# AquaMind AI — Model Evaluation & Performance Audit Report

**Audit Date:** October 31, 2026  
**Auditor:** Independent Technical & Scientific Quality Audit  
**Total Historical Dataset Size:** 12,000 hourly records across 6 campus buildings (2,000 continuous hours)  
**Dataset Split Methodology:** Strict chronological split avoiding future data leakage:
- **Training Set (First 80% / 1,600 hours):** 9,600 records  
- **Held-out Test Set (Last 20% / 400 hours):** 2,400 records  
**Target Label Decoupling:** Verified zero ground-truth target columns in feature matrices.

---

## 1. Leak Severity Classifier (Supervised Random Forest)
- **Algorithm:** Random Forest Classifier (180 estimators, max_depth=12, balanced class weights)
- **Classes:** `major`, `minor`, `moderate`, `none`
- **Features Used (11 observable features):** `flow_rate_lpm`, `pressure_bar`, `night_flow_lpm`, `water_consumption_liters`, `tank_level_percent`, `occupancy`, `temperature`, `rainfall`, `humidity`, `hour_of_day`, `is_weekend`
- **Test Set Size:** 2,400 records (400 consecutive campus hours)
- **Chronological Class Distribution in Test Set:**
  - `none`: 2,364 records (98.5%)
  - `minor`: 36 records (1.5%)
  - `moderate`: 0 records (0.0% — moderate leaks occurred within the first 1,600 hours)
  - `major`: 0 records (0.0% — major leaks occurred within the first 1,600 hours)

### Classification Performance on Held-Out Test Set
```
              precision    recall  f1-score   support

       major       0.00      0.00      0.00         0
       minor       0.00      0.00      0.00        36
    moderate       0.00      0.00      0.00         0
        none       0.99      1.00      0.99      2364

    accuracy                           0.98      2400
   macro avg       0.25      0.25      0.25      2400
weighted avg       0.97      0.98      0.98      2400
```

### Exact Confusion Matrix
```
Labels: ['major', 'minor', 'moderate', 'none']
[[   0    0    0    0]
 [   0    0   10   26]
 [   0    0    0    0]
 [   0    0    0 2364]]
```

### Confidence Score Transparency Audit
- **Calibration Finding:** Probabilities are direct ensemble vote fractions (`predict_proba`) from Random Forest decision trees.
- **Audit Clarification:** The model has **not** undergone Platt scaling or isotonic regression calibration. Therefore, confidence scores are accurately reported as **Ensemble Tree Vote Shares**, not true statistically calibrated probabilities.

---

## 2. Anomaly Detection (Multivariate Isolation Forest)
- **Algorithm:** Multivariate Isolation Forest (150 trees, contamination=0.035, seed=42)
- **Features Used:** 9 continuous observable features (consumption, flow rate, pressure, tank level, night flow, occupancy, temperature, rainfall, humidity)
- **Evaluation Methodology:** Unsupervised training on normal/unlabeled historical features. Evaluated against ground-truth anomaly status on held-out 2,400 test records.

### Anomaly Detection Performance
```
Confusion Matrix (0: Normal, 1: Anomaly):
[[2253  110]
 [  29    8]]

              precision    recall  f1-score   support
     Normal       0.99      0.95      0.97      2363
    Anomaly       0.07      0.22      0.10        37

   Accuracy: 94.2% (2,261 / 2,400)
```
- **Audit Finding:** Unsupervised Isolation Forest flags statistical outliers with 94.2% overall accuracy. However, because anomaly events are rare (1.5% base rate), precision on anomalies is 7% with recall of 22%. Heuristic root-cause diagnostic rules provide vital disambiguation between sensor faults and physical pipe leaks.

---

## 3. Water Demand Forecasting (Multi-Building Gradient Boosting)
- **Algorithm:** Building-specific Gradient Boosting Regressors (120 estimators, max_depth=5, learning_rate=0.08)
- **Features:** Calendar harmonics, time-of-day, day-of-week, occupancy dynamics, diurnal temperature cycle, rainfall, humidity.

### Empirical Performance Across Horizons (MAE & RMSE)

| Campus Building | 24-Hour Horizon MAE | 24-Hour Horizon RMSE | 7-Day Horizon MAE | 7-Day Horizon RMSE | Full 400h Test MAE | Full 400h Test RMSE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Academic Block** | **24.4 L** | 39.7 L | **40.6 L** | 358.9 L | **24.2 L** | 233.3 L |
| **Central Dining / Canteen** | **34.6 L** | 64.2 L | **24.4 L** | 47.1 L | **26.5 L** | 51.7 L |
| **Hostel A (Residential)** | **25.0 L** | 31.8 L | **48.3 L** | 73.6 L | **50.1 L** | 75.6 L |
| **Hostel B (Residential)** | **92.8 L** | 148.5 L | **163.7 L** | 278.7 L | **149.4 L** | 259.3 L |
| **Laboratory Block** | **273.2 L** | 336.9 L | **130.1 L** | 204.4 L | **139.3 L** | 224.3 L |
| **Sports & Recreation** | **98.9 L** | 281.5 L | **123.5 L** | 329.2 L | **99.4 L** | 268.1 L |
| **Campus Average** | **91.5 Liters** | **150.5 Liters** | **88.4 Liters** | **215.3 Liters** | **81.5 Liters** | **185.4 Liters** |

---

## 4. Responsible AI & Guardrail Verification
1. **Human Oversight Principle:** AI generates structured recommendations, evidence chains, and risk scores, but never dispatches maintenance or restricts valve set-points without operator approval.
2. **Vulnerable Population Guardrail:** Hostels (Hostel A and Hostel B) and healthcare/dining zones have strict minimum water allocations enforced in the linear programming optimizer, guaranteeing minimum 70% satisfaction even under severe supply shortages.
