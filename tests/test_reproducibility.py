"""
Tests for Bit-Exact Reproducibility in AQUAMIND.
"""

import pytest
import pandas as pd
from src.data.generator import HistoricalDataGenerator
from src.config import RANDOM_SEED


def test_fixed_seed_deterministic_generation():
    """Verify that using the same fixed seed produces bit-exact identical datasets."""
    gen_a = HistoricalDataGenerator(seed=RANDOM_SEED, timesteps=30)
    obs_a, gt_a, _ = gen_a.generate()

    gen_b = HistoricalDataGenerator(seed=RANDOM_SEED, timesteps=30)
    obs_b, gt_b, _ = gen_b.generate()

    pd.testing.assert_frame_equal(obs_a, obs_b)
    pd.testing.assert_frame_equal(gt_a, gt_b)


def test_differing_seed_produces_different_noise():
    """Verify that different seeds produce different variations."""
    gen1 = HistoricalDataGenerator(seed=101, timesteps=30)
    obs1, _, _ = gen1.generate()

    gen2 = HistoricalDataGenerator(seed=202, timesteps=30)
    obs2, _, _ = gen2.generate()

    # Flow rates should have different random perturbations
    assert not obs1["outlet_flow_rate_lph"].equals(obs2["outlet_flow_rate_lph"])

