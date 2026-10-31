"""
AquaMind AI - Anomaly Detection Engine
Uses Isolation Forest trained on multivariate physical features (consumption, flow,
pressure, tank levels, night flow, occupancy, and ambient weather).
Classifies abnormal operating conditions into:
- Normal vs Anomalous
- Granular anomaly category: Consumption, Pressure, Flow, Tank, Infrastructure, or Sensor anomaly.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from backend.core.config import SAVED_MODELS_DIR


ANOMALY_FEATURE_COLS = [
    "water_consumption_liters",
    "flow_rate_lpm",
    "pressure_bar",
    "tank_level_percent",
    "night_flow_lpm",
    "occupancy",
    "temperature",
    "rainfall",
    "humidity",
    "hour_of_day",
    "day_of_week",
]


class WaterAnomalyDetector:
    """Multivariate Isolation Forest Anomaly Detector with heuristic root-cause classification."""

    def __init__(self, contamination: float = 0.04, seed: int = 42):
        self.contamination = contamination
        self.seed = seed
        self.model = IsolationForest(
            n_estimators=150,
            contamination=contamination,
            random_state=seed,
            n_jobs=-1,
        )
        self.scaler = StandardScaler()
        self.is_fitted = False

    def _prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extracts and scales input features."""
        df_copy = df.copy()
        if "hour_of_day" not in df_copy.columns:
            ts = pd.to_datetime(df_copy["timestamp"])
            df_copy["hour_of_day"] = ts.dt.hour
            df_copy["day_of_week"] = ts.dt.dayofweek

        X = df_copy[ANOMALY_FEATURE_COLS].fillna(0.0).values
        return X

    def fit(self, df_train: pd.DataFrame) -> "WaterAnomalyDetector":
        """Fits scaler and Isolation Forest on observable training telemetry."""
        X = self._prepare_features(df_train)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_fitted = True
        return self

    def predict(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predicts anomaly status (0: Normal, 1: Anomalous) and continuous anomaly score.
        """
        if not self.is_fitted:
            raise RuntimeError("AnomalyDetector must be fitted or loaded before prediction.")
        
        X = self._prepare_features(df)
        X_scaled = self.scaler.transform(X)
        raw_pred = self.model.predict(X_scaled)  # 1 for inlier, -1 for outlier
        anomaly_scores = -self.model.decision_function(X_scaled)  # higher = more anomalous

        is_anomaly = np.where(raw_pred == -1, 1, 0)
        return is_anomaly, anomaly_scores

    def diagnose_category(self, row: pd.Series) -> str:
        """
        Diagnoses the probable category of an anomaly using hydraulic and sensor heuristics.
        Does NOT automatically diagnose every anomaly as a leak!
        """
        flow = float(row.get("flow_rate_lpm", 0.0))
        pressure = float(row.get("pressure_bar", 3.0))
        tank = float(row.get("tank_level_percent", 50.0))
        night_flow = float(row.get("night_flow_lpm", 2.0))
        occupancy = float(row.get("occupancy", 10.0))
        
        # 1. Sensor Anomaly: Stuck reading or impossible physical discontinuity
        if flow == 0.0 and occupancy > 100:
            return "Sensor Anomaly (Dead Sensor)"
        if pressure > 5.5 or pressure < 0.2:
            return "Sensor Anomaly (Electrical Outlier)"

        # 2. Hydraulic Infrastructure Anomaly / Pipe Leak
        # Characterized by elevated flow AND distinct pressure drop
        if pressure < 2.6 and flow > 35.0:
            return "Infrastructure Anomaly (Suspected Physical Leak)"
        
        # 3. High Night Consumption Anomaly (Fixture left running or valve weep)
        if night_flow > 12.0 and pressure >= 2.8:
            return "Consumption Anomaly (Excessive Night-Time Usage)"
        
        # 4. Tank Level Storage Anomaly
        if tank < 20.0 and flow < 15.0:
            return "Storage Anomaly (Low Tank Reserve)"
        if tank > 98.0:
            return "Storage Anomaly (Potential Tank Overflow)"

        # 5. Flow-Occupancy Discrepancy
        if occupancy < 10 and flow > 40.0:
            return "Flow Anomaly (Unexplained High Flow at Zero Occupancy)"

        return "Unclassified Operating Anomaly"

    def save(self, model_dir: Path = SAVED_MODELS_DIR) -> Path:
        """Saves model and scaler artifacts."""
        model_dir = Path(model_dir)
        model_dir.mkdir(parents=True, exist_ok=True)
        path = model_dir / "anomaly_detector.joblib"
        joblib.dump({"model": self.model, "scaler": self.scaler, "is_fitted": self.is_fitted}, path)
        return path

    @classmethod
    def load(cls, model_dir: Path = SAVED_MODELS_DIR) -> "WaterAnomalyDetector":
        """Loads model and scaler artifacts."""
        path = Path(model_dir) / "anomaly_detector.joblib"
        if not path.exists():
            raise FileNotFoundError(f"Model file not found at {path}")
        data = joblib.load(path)
        detector = cls()
        detector.model = data["model"]
        detector.scaler = data["scaler"]
        detector.is_fitted = data["is_fitted"]
        return detector

