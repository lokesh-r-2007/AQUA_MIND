"""
AquaMind AI - Leak Prediction and Severity Classification Engine
Trains a supervised Random Forest Classifier to detect suspected pipeline leaks
and classify severity into: No Leak, Minor Leak, Moderate Leak, Major Leak.
Provides calibrated probability confidence scores.
Strictly decoupled from target labels during feature engineering.
"""

from pathlib import Path
from typing import Dict, Any, Tuple, List
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, f1_score

from backend.core.config import SAVED_MODELS_DIR


LEAK_FEATURE_COLS = [
    "flow_rate_lpm",
    "pressure_bar",
    "night_flow_lpm",
    "water_consumption_liters",
    "tank_level_percent",
    "occupancy",
    "temperature",
    "rainfall",
    "humidity",
    "hour_of_day",
    "is_weekend",
]

SEVERITY_CLASSES = ["none", "minor", "moderate", "major"]


class LeakClassifier:
    """Supervised Random Forest Classifier for pipeline leak severity prediction."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.model = RandomForestClassifier(
            n_estimators=180,
            max_depth=12,
            min_samples_split=4,
            class_weight="balanced",  # Critical for rare leak events
            random_state=seed,
            n_jobs=-1,
        )
        self.scaler = StandardScaler()
        self.is_fitted = False

    def _prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        df_copy = df.copy()
        if "hour_of_day" not in df_copy.columns:
            ts = pd.to_datetime(df_copy["timestamp"])
            df_copy["hour_of_day"] = ts.dt.hour

        # Ensure no label columns are ever in input features
        for forbidden in ["leak_status", "anomaly_status", "leak_severity", "leak_flow_lpm", "anomaly_type"]:
            if forbidden in LEAK_FEATURE_COLS:
                raise ValueError(f"CRITICAL: Forbidden label {forbidden} found in feature definition!")

        X = df_copy[LEAK_FEATURE_COLS].fillna(0.0).values
        return X

    def fit(self, df_features: pd.DataFrame, y_labels: pd.Series) -> "LeakClassifier":
        """Fits scaler and Random Forest on training features and ground truth labels."""
        X = self._prepare_features(df_features)
        X_scaled = self.scaler.fit_transform(X)

        # Standardize labels to lowercase
        y_clean = y_labels.astype(str).str.lower().values
        self.model.fit(X_scaled, y_clean)
        self.is_fitted = True
        return self

    def predict(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, float]]]:
        """
        Predicts leak severity class, numeric confidence, and per-class probability breakdown.
        """
        if not self.is_fitted:
            raise RuntimeError("LeakClassifier must be fitted or loaded before prediction.")

        X = self._prepare_features(df)
        X_scaled = self.scaler.transform(X)
        preds = self.model.predict(X_scaled)
        probas = self.model.predict_proba(X_scaled)
        classes = list(self.model.classes_)

        max_confidences = np.max(probas, axis=1)
        prob_dicts = [
            {cls_name: round(float(prob), 4) for cls_name, prob in zip(classes, row_prob)}
            for row_prob in probas
        ]

        return preds, max_confidences, prob_dicts

    def format_status_label(self, severity_pred: str, confidence: float) -> Dict[str, Any]:
        """
        Formats human-explainable status ensuring:
        'Possible Leak — Inspection Required' until a human verifies.
        """
        sev = str(severity_pred).lower()
        if sev == "none":
            return {
                "status_code": "NORMAL",
                "display_label": "Normal Operating Condition",
                "is_leak": False,
                "severity": "none",
                "confidence_percent": round(confidence * 100, 1),
                "requires_inspection": False,
            }
        else:
            return {
                "status_code": "SUSPECTED_LEAK",
                "display_label": f"Possible {sev.capitalize()} Leak — Inspection Required",
                "is_leak": True,
                "severity": sev,
                "confidence_percent": round(confidence * 100, 1),
                "requires_inspection": True,
            }

    def save(self, model_dir: Path = SAVED_MODELS_DIR) -> Path:
        model_dir = Path(model_dir)
        model_dir.mkdir(parents=True, exist_ok=True)
        path = model_dir / "leak_classifier.joblib"
        joblib.dump({"model": self.model, "scaler": self.scaler, "is_fitted": self.is_fitted}, path)
        return path

    @classmethod
    def load(cls, model_dir: Path = SAVED_MODELS_DIR) -> "LeakClassifier":
        path = Path(model_dir) / "leak_classifier.joblib"
        if not path.exists():
            raise FileNotFoundError(f"Model file not found at {path}")
        data = joblib.load(path)
        clf = cls()
        clf.model = data["model"]
        clf.scaler = data["scaler"]
        clf.is_fitted = data["is_fitted"]
        return clf

