"""
Data Splitter and ML Leakage Prevention Utilities for AQUAMIND.
Enforces strict column filtering and validation to ensure no evaluation targets
or future information leaks into training feature sets.
"""

from typing import Tuple, List, Set, Union
from pathlib import Path
import pandas as pd

from src.models.telemetry import ZoneFullRecord


# Authoritative definition of ground-truth target columns
FORBIDDEN_GROUND_TRUTH_COLUMNS: Set[str] = set(ZoneFullRecord.ground_truth_column_names()) | {
    "ground_truth_leak_status",
    "ground_truth_leak_severity",
    "ground_truth_leak_rate_lph",
    "ground_truth_anomaly_status",
    "ground_truth_anomaly_type",
    "ground_truth_affected_component",
    "leak_status",
    "anomaly_status",
    "leak_severity",
    "leak_rate_lph",
}

# Permitted observable features
ALLOWED_OBSERVABLE_COLUMNS: Set[str] = set(ZoneFullRecord.observable_column_names())


def validate_feature_matrix_leakage(df_features: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Scans a feature DataFrame to verify that ZERO ground-truth labels are present.
    
    Returns:
        Tuple of (is_clean: bool, violations: List[str])
    """
    violations = []
    current_cols = set(df_features.columns)

    for col in current_cols:
        col_lower = col.lower()
        if col in FORBIDDEN_GROUND_TRUTH_COLUMNS:
            violations.append(col)
        elif "leak_status" in col_lower or "ground_truth" in col_lower or "anomaly_type" in col_lower:
            violations.append(col)

    return (len(violations) == 0, violations)


def split_features_and_targets(
    df: Union[pd.DataFrame, str, Path],
    include_metadata: bool = True,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Safely decouples a master dataset into observable features (X) and ground truth targets (y).
    
    Args:
        df: DataFrame or path to CSV file.
        include_metadata: If True, retains 'timestamp' and 'zone_id' in both X and y for tracking.
                          If False, removes metadata identifiers from X.
                          
    Returns:
        (X, y) tuple of DataFrames.
        
    Raises:
        ValueError: If leakage is detected in X after filtering.
    """
    if isinstance(df, (str, Path)):
        df = pd.read_csv(df)

    # Separate target columns
    target_cols = [c for c in df.columns if c in FORBIDDEN_GROUND_TRUTH_COLUMNS]
    if include_metadata:
        target_cols = [c for c in ["timestamp", "zone_id"] if c in df.columns] + [
            c for c in target_cols if c not in ("timestamp", "zone_id")
        ]
    
    y = df[target_cols].copy()

    # Form feature matrix X by dropping all forbidden columns
    cols_to_drop = [c for c in df.columns if c in FORBIDDEN_GROUND_TRUTH_COLUMNS]
    if not include_metadata:
        cols_to_drop.extend([c for c in ["timestamp", "zone_id", "zone_name"] if c in df.columns])

    X = df.drop(columns=cols_to_drop, errors="ignore").copy()

    # Verify no leakage remains in X
    is_clean, violations = validate_feature_matrix_leakage(X)
    if not is_clean:
        raise ValueError(
            f"CRITICAL: Data leakage detected in feature matrix X! Contaminated columns: {violations}"
        )

    return X, y

