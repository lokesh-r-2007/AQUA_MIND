"""Data generation and processing package for AQUAMIND."""
from .generator import HistoricalDataGenerator
from .splitter import split_features_and_targets, validate_feature_matrix_leakage
from .patterns import calculate_building_consumption, get_academic_calendar_factor

__all__ = [
    "HistoricalDataGenerator",
    "split_features_and_targets",
    "validate_feature_matrix_leakage",
    "calculate_building_consumption",
    "get_academic_calendar_factor",
]

