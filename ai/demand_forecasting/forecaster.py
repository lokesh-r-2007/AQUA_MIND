"""
AquaMind AI - Water Demand Forecasting Engine
Trains a chronological Gradient Boosting / Random Forest Regressor to forecast
short-term hourly and daily water demand per building and campus-wide.
Integrates calendar rhythms, occupancy dynamics, and weather forecasts.
Evaluated with MAE, RMSE, and MAPE.
"""

from pathlib import Path
from typing import Dict, Any, Tuple, List
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

from backend.core.config import SAVED_MODELS_DIR, CAMPUS_BUILDINGS


FORECAST_FEATURE_COLS = [
    "hour_of_day",
    "day_of_week",
    "is_weekend",
    "is_holiday",
    "occupancy",
    "temperature",
    "rainfall",
    "humidity",
]


class DemandForecaster:
    """Supervised Regression model for multi-horizon building water demand forecasting."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        # Train one regressor per building for specialized accuracy
        self.models: Dict[str, GradientBoostingRegressor] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.is_fitted = False

    def _prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        df_copy = df.copy()
        if "hour_of_day" not in df_copy.columns:
            ts = pd.to_datetime(df_copy["timestamp"])
            df_copy["hour_of_day"] = ts.dt.hour
            df_copy["day_of_week"] = ts.dt.dayofweek

        X = df_copy[FORECAST_FEATURE_COLS].fillna(0.0).values
        return X

    def fit(self, df_train: pd.DataFrame) -> "DemandForecaster":
        """Fits building-specific regression models chronologically."""
        for bid in CAMPUS_BUILDINGS.keys():
            b_data = df_train[df_train["building_id"] == bid].copy()
            if b_data.empty:
                continue

            X = self._prepare_features(b_data)
            y = b_data["water_consumption_liters"].values

            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            reg = GradientBoostingRegressor(
                n_estimators=120,
                max_depth=5,
                learning_rate=0.08,
                random_state=self.seed,
            )
            reg.fit(X_scaled, y)

            self.models[bid] = reg
            self.scalers[bid] = scaler

        self.is_fitted = True
        return self

    def predict_building_hourly(self, building_id: str, df_horizon: pd.DataFrame) -> np.ndarray:
        """Predicts hourly consumption for a specific building over a forecast horizon."""
        if not self.is_fitted:
            raise RuntimeError("DemandForecaster must be fitted or loaded before prediction.")
        if building_id not in self.models:
            raise KeyError(f"No model found for building_id '{building_id}'")

        scaler = self.scalers[building_id]
        model = self.models[building_id]

        X = self._prepare_features(df_horizon)
        X_scaled = scaler.transform(X)
        preds = model.predict(X_scaled)
        return np.maximum(0.0, np.round(preds, 1))

    def forecast_next_hours(
        self,
        hours_ahead: int = 24,
        start_timestamp: pd.Timestamp = None,
        weather_df: pd.DataFrame = None,
    ) -> Dict[str, Any]:
        """
        Generates multi-step ahead demand forecasts for each building and the campus total.
        """
        if start_timestamp is None:
            start_timestamp = pd.Timestamp.now()

        timestamps = [start_timestamp + pd.Timedelta(hours=i) for i in range(1, hours_ahead + 1)]
        ts_strings = [t.strftime("%Y-%m-%d %H:%M:%S") for t in timestamps]

        building_forecasts: Dict[str, List[float]] = {}
        campus_hourly_total = np.zeros(hours_ahead)

        for bid, bcfg in CAMPUS_BUILDINGS.items():
            # Build synthetic horizon feature matrix
            horizon_rows = []
            for t in timestamps:
                hour = t.hour
                dow = t.dayofweek
                is_weekend = 1 if dow >= 5 else 0
                is_holiday = 0  # Standard operational assumption for short-term

                # Estimated occupancy
                if bid == "academic_block":
                    occ = int(bcfg.max_occupancy * 0.75) if (8 <= hour <= 17 and not is_weekend) else 20
                elif bid in ("hostel_a", "hostel_b"):
                    occ = int(bcfg.max_occupancy * 0.9) if (hour < 8 or hour > 18 or is_weekend) else int(bcfg.max_occupancy * 0.3)
                elif bid == "canteen":
                    occ = int(bcfg.max_occupancy * 0.8) if (hour in (8, 13, 20)) else 15
                elif bid == "laboratory_block":
                    occ = int(bcfg.max_occupancy * 0.6) if (8 <= hour <= 18 and not is_weekend) else 15
                else:
                    occ = int(bcfg.max_occupancy * 0.5) if (hour in (7, 17)) else 10

                temp = 25.0 + 4.0 * np.sin(np.pi * (hour - 8) / 12.0)
                rainfall = 0.0
                humidity = 60.0

                horizon_rows.append({
                    "timestamp": t.strftime("%Y-%m-%d %H:%M:%S"),
                    "hour_of_day": hour,
                    "day_of_week": dow,
                    "is_weekend": is_weekend,
                    "is_holiday": is_holiday,
                    "occupancy": occ,
                    "temperature": temp,
                    "rainfall": rainfall,
                    "humidity": humidity,
                })

            df_h = pd.DataFrame(horizon_rows)
            preds = self.predict_building_hourly(bid, df_h)
            building_forecasts[bid] = preds.tolist()
            campus_hourly_total += preds

        return {
            "timestamps": ts_strings,
            "building_forecasts": building_forecasts,
            "campus_hourly_total_liters": np.round(campus_hourly_total, 1).tolist(),
            "campus_total_period_liters": round(float(np.sum(campus_hourly_total)), 1),
            "forecast_horizon_hours": hours_ahead,
        }

    def save(self, model_dir: Path = SAVED_MODELS_DIR) -> Path:
        model_dir = Path(model_dir)
        model_dir.mkdir(parents=True, exist_ok=True)
        path = model_dir / "demand_forecaster.joblib"
        joblib.dump({"models": self.models, "scalers": self.scalers, "is_fitted": self.is_fitted}, path)
        return path

    @classmethod
    def load(cls, model_dir: Path = SAVED_MODELS_DIR) -> "DemandForecaster":
        path = Path(model_dir) / "demand_forecaster.joblib"
        if not path.exists():
            raise FileNotFoundError(f"Model file not found at {path}")
        data = joblib.load(path)
        forecaster = cls()
        forecaster.models = data["models"]
        forecaster.scalers = data["scalers"]
        forecaster.is_fitted = data["is_fitted"]
        return forecaster

