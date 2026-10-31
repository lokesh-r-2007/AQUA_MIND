# AQUAMIND Data Dictionary & Schema Specification

This document provides the authoritative specification for all data columns in the AQUAMIND water resilience platform, explicitly delineating **Observable Features** (for real-time monitoring and ML model inputs) from **Evaluation Ground-Truth Labels** (strictly reserved for model scoring and offline evaluation).

---

## 1. Observable Telemetry Features (`historical_sensor_readings.csv`)

> [!IMPORTANT]
> These columns represent physically measurable quantities acquired by smart flow meters, pressure transducers, float sensors, and weather stations. ML models **MAY** use these features.

| Column Name | Data Type | Physical Unit | Permitted Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| `timestamp` | `string` | ISO 8601 | `YYYY-MM-DD HH:MM:SS` | Timestamp of observation (hourly sampling $\Delta t = 1.0\text{ h}$) |
| `zone_id` | `string` | Categorical | 6 campus zones | Unique zone identifier (e.g., `zone_1_academic_north`) |
| `zone_name` | `string` | String | Campus naming | Descriptive zone name |
| `inlet_flow_rate_lph` | `float` | Liters / hour (L/h) | $[0.0, \infty)$ | Volumetric flow rate into zone tank measured at supply pipe inlet |
| `outlet_flow_rate_lph` | `float` | Liters / hour (L/h) | $[0.0, \infty)$ | Bulk volumetric flow exiting zone overhead storage into distribution network |
| `building_consumption_lph`| `float` | Liters / hour (L/h) | $[0.0, \infty)$ | Aggregate water consumption measured by internal building smart sub-meters |
| `supply_pressure_bar` | `float` | Bar ($\text{bar}$) | $[0.5, 6.0]$ | Physical line pressure downstream of overhead tank |
| `tank_level_pct` | `float` | Percentage ($\%$) | $[0.0, 100.0]$ | Ratio of stored water volume to zone tank capacity |
| `tank_volume_liters` | `float` | Liters ($\text{L}$) | $[0.0, \text{Capacity}]$ | Current water volume stored in zone tank |
| `pump_status` | `int` | Binary | $\{0, 1\}$ | Booster pump state ($0 = \text{OFF}$, $1 = \text{ON}$) |
| `temperature_c` | `float` | Celsius ($^\circ\text{C}$) | $[10.0, 45.0]$ | Ambient air temperature |
| `precipitation_mm` | `float` | Millimeters ($\text{mm}$) | $[0.0, \infty)$ | Rainfall accumulation over the sampling interval |
| `relative_humidity_pct` | `float` | Percentage ($\%$) | $[10.0, 100.0]$ | Relative ambient air humidity |
| `weather_data_source` | `string` | Categorical | `open_meteo`, `synthetic_fallback` | Explicit provenance of weather telemetry |
| `hour_of_day` | `int` | Hour | $[0, 23]$ | Local hour of the day |
| `day_of_week` | `int` | Day index | $[0, 6]$ | Day of week ($0 = \text{Monday}$, $6 = \text{Sunday}$) |
| `is_weekend` | `int` | Binary | $\{0, 1\}$ | Weekend indicator ($1 = \text{Saturday/Sunday}$) |
| `is_holiday` | `int` | Binary | $\{0, 1\}$ | University holiday or semester recess indicator |

---

## 2. Evaluation Ground-Truth Target Labels (`ground_truth_labels.csv`)

> [!WARNING]
> **STRICT ML LEAKAGE GUARD:** These columns represent hidden ground-truth physical state. They **MUST NEVER** be provided as input features to machine learning models during training or inference. They are stored in an isolated file for benchmark evaluation.

| Column Name | Data Type | Permitted Values | Description |
| :--- | :--- | :--- | :--- |
| `timestamp` | `string` | ISO 8601 | Corresponds to matching observation timestamp |
| `zone_id` | `string` | 6 campus zones | Corresponds to matching zone |
| `ground_truth_leak_status` | `int` | $\{0, 1\}$ | Target label: $1$ if a physical pipe leak is active, $0$ otherwise |
| `ground_truth_leak_severity` | `string` | `none`, `minor`, `moderate`, `major` | Classification tier of active physical leak |
| `ground_truth_leak_rate_lph` | `float` | $[0.0, 6000.0]$ | Actual physical leak discharge rate in Liters/hour |
| `ground_truth_anomaly_status` | `int` | $\{0, 1\}$ | Target label: $1$ if ANY abnormal state is present (leak OR sensor fault) |
| `ground_truth_anomaly_type` | `string` | `none`, `pipe_leak`, `sensor_drift`, `sensor_freeze`, `telemetry_spike` | Root cause classification distinguishing physical leaks from telemetry errors |
| `ground_truth_affected_component` | `string` | Asset tag | Specific physical pipe joint, valve, or sensor hardware tag affected |

---

## 3. Physical Leak Severity Classification Matrix

| Severity Tier | Leak Rate Range ($Q_{\text{leak}}$) | Typical Hydraulic Symptoms | Campus Impact |
| :--- | :--- | :--- | :--- |
| `none` | $0.0\text{ L/h}$ | Pressure nominal ($3.2 - 3.8\text{ bar}$), mass balance error $< 1.5\%$ | Baseline normal operations |
| `minor` | $100 - 300\text{ L/h}$ | Subtle pressure drop ($\sim 8\%$), slight tank drawdown slope | Hairline crack, flange weep, or valve gland leak |
| `moderate` | $500 - 1500\text{ L/h}$ | Measurable pressure drop ($\sim 22\%$), pump cycles noticeably faster | Underground service line crack, gasket blowout |
| `major` | $2500 - 6000\text{ L/h}$ | Severe depressurization ($> 50\%$), rapid tank depletion ($< 2.0\text{ bar}$) | Distribution main rupture or catastrophic line shear |

---

## 4. Distinction: Physical Leaks vs Sensor Telemetry Faults

A core requirement of AQUAMIND is preventing false alarms triggered by faulty sensors:

1. **True Physical Leak (`pipe_leak`):**
   - High outlet flow: $Q_{\text{outlet}} = Q_{\text{consumption}} + Q_{\text{leak}}$.
   - Downstream smart meters measure ONLY legitimate consumption $Q_{\text{consumption}}$.
   - Real hydraulic line pressure drops due to friction and head loss.
   - Tank volume genuinely depletes according to conservation of mass.

2. **Sensor Calibration Drift (`sensor_drift`):**
   - Meter reading steadily inflates (e.g. $+2\%/\text{h}$).
   - Building consumption and true outflow remain normal.
   - Pressure and tank levels remain completely stable and physically consistent.

3. **Frozen Telemetry Card (`sensor_freeze`):**
   - Reading repeats identical floating-point values across consecutive time steps despite changing diurnal human occupancy.

