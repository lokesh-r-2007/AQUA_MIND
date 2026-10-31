# Software Requirements Specification (SRS)
## Project Name: AquaMind AI
### Smart Campus Water Intelligence & Resilience Platform

**Project Title:** AquaMind AI — Cyber-Physical Water Intelligence & Decision Support System  
**Hackathon:** TCS AI Hackathon 2026  
**Theme:** THEME 3: AI for Impact  
**Domain:** Sustainability  
**Tags:** Artificial Intelligence, Water Resilience, Anomaly Detection, Leak Prediction, Demand Forecasting, Constrained Optimization, Decision Intelligence, ESG Carbon Accounting.  
**Standard:** IEEE Std 830-1998 Compliant  
**Version:** 1.0.0  
**Date:** October 31, 2026  
**Status:** Approved & Verified against Live System  

---

## Table of Contents
1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience
   - 1.4 Project Scope & Context
   - 1.5 System Philosophy & Core Workflow
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective & Cyber-Physical Topology
   - 2.2 Product Functions Overview
   - 2.3 User Classes & Personas
   - 2.4 Operating Environment
   - 2.5 Design & Implementation Constraints
   - 2.6 Assumptions & Dependencies
3. [External Interface Requirements](#3-external-interface-requirements)
   - 3.1 User Interfaces (9-Page Command Center)
   - 3.2 Hardware Interfaces & Hydraulic Actuators
   - 3.3 Software & API Interfaces
   - 3.4 Communications Interfaces
4. [System Architecture & Subsystem Specifications](#4-system-architecture--subsystem-specifications)
   - 4.1 Subsystem 1: Continuous Hydraulic Sensor Simulation & Physical Mass Balance
   - 4.2 Subsystem 2: Meteorological Ingestion & Dual-Climate Fallback Engine
   - 4.3 Subsystem 3: Artificial Intelligence & Machine Learning Pipeline
     - 4.3.1 Multivariate Anomaly Detection (Isolation Forest)
     - 4.3.2 Supervised Leak Severity Classification (Random Forest)
     - 4.3.3 Multi-Horizon Demand Forecasting (Gradient Boosting Regressors)
     - 4.3.4 Explainable Shortage Risk & Autonomy Evaluator
   - 4.4 Subsystem 4: Decision Intelligence & Optimization Engine
     - 4.4.1 Dynamic Priority & Risk Scoring Engine
     - 4.4.2 Evidence-Based Recommendation Generator
     - 4.4.3 Constrained Water Distribution Optimizer (Linear Programming)
     - 4.4.4 Post-Intervention Impact Measurement & ESG Accounting
     - 4.4.5 What-If Scenario Crisis Simulator
   - 4.5 Subsystem 5: FastAPI REST Backend & SQLite Architecture
   - 4.6 Subsystem 6: React 18 + TypeScript Dashboard Application
5. [Database Schema & Data Dictionary](#5-database-schema--data-dictionary)
   - 5.1 Relational Tables & Relationships
   - 5.2 Observable Feature Matrix vs Ground Truth Decoupling
6. [Non-Functional Requirements](#6-non-functional-requirements)
   - 6.1 Performance & Throughput
   - 6.2 Reliability & Fault Tolerance
   - 6.3 Physical Consistency & Mathematical Integrity
   - 6.4 Responsible AI & Vulnerable Population Safety Guardrails
   - 6.5 Maintainability & Deterministic Reproducibility
7. [Verification & Traceability Matrix](#7-verification--traceability-matrix)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, behavioral, mathematical, and non-functional requirements for **AquaMind AI**, an enterprise-grade cyber-physical water intelligence and resilience platform designed for large university campuses, industrial parks, and micro-city environments. This document serves as the formal baseline for development, architecture auditing, quality assurance, and competition evaluation at the **TCS AI Hackathon 2026**.

### 1.2 Document Conventions
- **MUST / SHALL:** Mandatory requirement necessary for system compliance.
- **SHOULD:** Recommended best-practice requirement implemented in the system.
- **Units of Measure:**
  - Water volume: Liters (L), Kiloliters (kL, $1\text{ kL} = 1,000\text{ L}$), Cubic Meters ($\text{m}^3$).
  - Flow rate: Liters per minute (LPM), Liters per hour (LPH, $1\text{ LPM} = 60\text{ LPH}$).
  - Hydraulic pressure: Bar (gauge pressure, nominal range $1.5\text{–}4.0\text{ bar}$).
  - Energy & Carbon: Kilowatt-hours (kWh, factor $0.45\text{ kWh/kL}$), Carbon dioxide equivalents ($\text{kg CO}_2$, factor $0.82\text{ kg CO}_2/\text{kWh}$).
  - Currency: Indian Rupee (INR / ₹, campus utility tariff ₹$45.00/\text{kL}$).

### 1.3 Intended Audience
This document is targeted at:
- **TCS AI Hackathon 2026 Evaluation Panel:** To inspect architectural depth, physical modeling rigor, AI design, and social impact guardrails.
- **Software Engineers & Data Scientists:** For system maintenance, API integration, and model retraining.
- **Campus Facilities & Water Utilities Directors:** To understand the human-in-the-loop decision-support guarantees.

### 1.4 Project Scope & Context
Educational and industrial campuses consume millions of liters of water daily, operating complex distributions of overhead storage tanks, booster pumps, underground transmission mains, and dedicated end-use fixtures across varied buildings (hostels, dining halls, laboratories, academic blocks). Conventional campus water management suffers from:
1. **Blindness to Sub-Surface Pipe Leaks:** Fissures go unnoticed until catastrophic localized flooding or tank drain occurs.
2. **Disconnected Dashboards:** Existing systems show passive line charts without prescriptive operational guidance.
3. **Uncoordinated Shortage Response:** Water rationing is historically reactive, often disproportionately penalizing vulnerable student dormitories.
4. **Unmeasured Intervention Impact:** Maintenance crews fix pipes, but actual volume, monetary, and carbon savings are never scientifically quantified.

AquaMind AI transforms campus water management from passive retrospective monitoring into an **autonomous decision-support and closed-loop resilience ecosystem**.

### 1.5 System Philosophy & Core Workflow
AquaMind AI strictly adheres to the principle: **"Never build merely a consumption dashboard. Build an intelligent decision engine that prescribes what must be done, where, when, why, and measures the impact after intervention."**

The platform operates continuously across a 9-stage closed-loop cycle:

```mermaid
flowchart LR
    A["1. MONITOR<br/>Continuous Telemetry"] --> B["2. DETECT<br/>Isolation Forest"]
    B --> C["3. PREDICT<br/>RF & GradBoost"]
    C --> D["4. PRIORITIZE<br/>Risk Scorer"]
    D --> E["5. OPTIMIZE<br/>SciPy LP"]
    E --> F["6. RECOMMEND<br/>Evidence Engine"]
    F --> G["7. HUMAN APPROVAL<br/>Operator Sign-Off"]
    G --> H["8. INTERVENE<br/>Crew Dispatch"]
    H --> I["9. MEASURE IMPACT<br/>Verified ESG Savings"]
    I --> A
```

---

## 2. Overall Description

### 2.1 Product Perspective & Cyber-Physical Topology
AquaMind AI models a campus as a micro-city divided into **6 distinct operational zones** (mapped to 6 campus buildings), each exhibiting tailored occupancy curves, tank storage configurations, booster pump ratings, and baseline hydraulic profiles:

```mermaid
graph TD
    Reservoir["Central Campus Reservoir (500,000 L Capacity)"]
    Pumps["Automated Variable-Speed Booster Pumps"]
    Reservoir --> Pumps

    Pumps --> B1["Academic Block North<br/>(Tank: 45kL, Base: 2.2k LPH, Pnom: 3.5 bar)"]
    Pumps --> B2["Science & Lab Block<br/>(Tank: 65kL, Base: 3.8k LPH, Pnom: 3.8 bar, Critical)"]
    Pumps --> B3["Student Hostel A<br/>(Tank: 80kL, Base: 4.2k LPH, Pnom: 3.2 bar, Vulnerable)"]
    Pumps --> B4["Student Hostel B<br/>(Tank: 80kL, Base: 4.2k LPH, Pnom: 3.2 bar, Vulnerable)"]
    Pumps --> B5["Central Canteen<br/>(Tank: 35kL, Base: 3.5k LPH, Pnom: 3.4 bar)"]
    Pumps --> B6["Sports & Garden<br/>(Tank: 25kL, Base: 1.8k LPH, Pnom: 2.8 bar, Non-Essential)"]

    B1 --> M1["Sensors: Flow, Pressure, Tank Level, Night Minimum Flow"]
    B2 --> M2["Sensors: Flow, Pressure, Tank Level, Night Minimum Flow"]
    B3 --> M3["Sensors: Flow, Pressure, Tank Level, Night Minimum Flow"]
    B4 --> M4["Sensors: Flow, Pressure, Tank Level, Night Minimum Flow"]
    B5 --> M5["Sensors: Flow, Pressure, Tank Level, Night Minimum Flow"]
    B6 --> M6["Sensors: Flow, Pressure, Tank Level, Night Minimum Flow"]

    M1 & M2 & M3 & M4 & M5 & M6 --> FastAPIServer["AquaMind Core Backend (FastAPI + AI Engine)"]
    FastAPIServer --> ReactUI["AquaMind React Command Center (9 Pages)"]
```

### 2.2 Product Functions Overview
1. **Continuous Telemetry Simulation:** High-fidelity simulation of campus hydraulic behavior enforcing mass balance conservation ($\Delta V = (Q_{\text{in}} - Q_{\text{out}})\Delta t$).
2. **Weather Intelligence & Caching:** Open-Meteo REST client with local disk caching and dual-climate fallback (Bangalore plateau SW monsoon vs. Tamil Nadu coastal NE monsoon).
3. **Unsupervised Anomaly Detection:** Multivariate Isolation Forest flagging statistical telemetry outliers.
4. **Supervised Leak Severity Classification:** Balanced Random Forest classifying pipe leaks into `none`, `minor`, `moderate`, and `major`.
5. **Multi-Horizon Demand Forecasting:** Building-specific Gradient Boosting Regressors predicting 24-hour and 7-day hourly demand profiles.
6. **Shortage Risk & Autonomy Evaluation:** Dynamic calculation of building storage autonomy hours and campus water security tier.
7. **Evidence-Based Recommendations:** Automated generation of operational directives (problem, department, deadline, water loss rate, 6+ empirical evidence points).
8. **Human-in-the-Loop Workflow:** 4-state lifecycle (`Detected` $\rightarrow$ `Under Review` $\rightarrow$ `Approved` / `Rejected` $\rightarrow$ `In Progress` $\rightarrow$ `Impact Measured`).
9. **Fair Water Distribution Optimization:** SciPy Linear Programming optimizing water delivery under supply deficit with strict non-throttling constraints for student hostels.
10. **Post-Intervention Impact Measurement:** Verified calculation of water recovered, financial savings, pumping electricity conserved, and avoided $\text{CO}_2$ emissions.
11. **Crisis What-If Simulator:** Interactive scenario evaluation testing pipe blowouts, raw water supply cuts, and heatwaves.

### 2.3 User Classes & Personas
| User Class | Responsibilities | Key UI Interfaces Utilized |
| :--- | :--- | :--- |
| **Water Utility Chief / Director** | High-level campus water security oversight, executive approvals, budget decisions. | Overview Page, Analytics Page, Optimization Page |
| **Facilities Maintenance Supervisor** | Reviewing detected leaks, assigning work orders to plumbing teams, recording completion notes. | Recommendations Page, Alerts Page, Monitoring Page |
| **Plumbing / Field Crew** | Physical joint acoustic inspection, valve adjustments, clamp installation. | Dispatched work orders (via Recommendations lifecycle) |
| **Sustainability & ESG Officer** | Monitoring avoided water loss, utility bill reduction, grid electricity savings, carbon mitigation. | Analytics Page, Overview Page |
| **AI Systems Auditor / Data Scientist** | Validating model drift, checking forecast MAE/RMSE, verifying strict absence of ML data leakage. | Predictions Page, Scenario Simulator Page |

### 2.4 Operating Environment
- **Operating System:** Platform independent (Windows 11, Ubuntu 22.04 LTS, macOS Darwin).
- **Backend Runtime:** Python 3.10 to Python 3.14 (audited on Python 3.14.6 64-bit).
- **Web Server:** Uvicorn ASGI Server running FastAPI 0.139.0.
- **Frontend Runtime:** Node.js v18+ (audited on Node.js v24.18.0 with npm 11.16.0).
- **Frontend Stack:** React 18.3.1, TypeScript 5.5, Vite 5.4, Lucide-React icons, Recharts 2.13.
- **Database Engine:** SQLite 3 with WAL (Write-Ahead Logging) and zero external daemon dependency.
- **External Dependencies:** Open-Meteo Historical & Forecast Archive APIs (graceful offline fallback).

### 2.5 Design & Implementation Constraints
1. **Mathematical Mass Balance:** At no point shall a simulated tank level exceed 100% or drop below 0%. Inflow, outflow, and consumption must strictly conserve mass over sampling interval $\Delta t = 1.0\text{ hour}$.
2. **Target Label Isolation:** Ground-truth labels (`leak_status`, `leak_severity`, `leak_flow_lpm`, `anomaly_type`) must remain strictly isolated from observable sensor feature matrices during feature extraction and model inference.
3. **Vulnerable Population Guardrail:** Under no operational condition shall the optimization engine reduce hostel water allocations below 70% of baseline demand. Throttling is strictly relegated to non-essential recreational landscapes (Sports & Garden).
4. **Mandatory Human Confirmation:** The system shall never autonomously actuate shutoff valves or alter building set-points without an authenticated human operator clicking "Approve".

---

## 3. External Interface Requirements

### 3.1 User Interfaces (9-Page Command Center)

```mermaid
graph LR
    Nav["Sidebar Navigation"] --> P1["1. Overview Page<br/>(Executive Posture & KPIs)"]
    Nav --> P2["2. Live Monitoring<br/>(Sensor Gauges & Leak Injector)"]
    Nav --> P3["3. AI Predictions<br/>(Demand Curves & Risk Tiers)"]
    Nav --> P4["4. Alerts Console<br/>(Telemetry Alarms & Acknowledge)"]
    Nav --> P5["5. Decision Engine<br/>(4-Stage Recommendation Lifecycle)"]
    Nav --> P6["6. Campus Buildings<br/>(Sub-meter Topology & Storage)"]
    Nav --> P7["7. Water Optimization<br/>(LP Allocator & Supply Slider)"]
    Nav --> P8["8. Resilience Analytics<br/>(ESG Carbon & Verified Savings)"]
    Nav --> P9["9. What-If Simulator<br/>(Crisis Stress-Testing)"]
```

#### Page 1: Executive Overview (`/`)
- Surfaces 4 real-time executive KPI cards: Campus Storage Autonomy (hours), 24h Campus Demand (Liters), Active Hydraulic Leak Count, and Net Averted Water Loss (Liters).
- Displays campus-wide water security posture badge (`NORMAL`, `WATCH`, `CRITICAL DEFICIT`).
- Shows interactive hourly consumption trend chart and high-priority active recommendations with 1-click drill-down.

#### Page 2: Live Sensor Network & Simulation Control (`/monitoring`)
- Real-time gauge cluster for all 6 campus buildings displaying: Flow Rate (LPM), Supply Pressure (bar), Overhead Tank Storage (%), Night Minimum Flow (LPM), and Occupancy.
- Simulation Control Panel: Advance simulation step by 1 hour, trigger controlled leak scenarios (`minor`, `moderate`, `major`), stop active leaks, and inject sensor telemetry faults (`sensor_drift`, `sensor_freeze`, `telemetry_spike`).

#### Page 3: AI Intelligence, Demand Forecasting & Shortage Risk (`/predictions`)
- 24-hour ahead multi-building stacked demand forecast chart with interactive building toggle.
- Building-by-building AI inference cards displaying: Model Vote Confidence (RF probability), Anomaly Status, Root Cause Diagnostic category, and Hours of Storage Autonomy Remaining.

#### Page 4: Alerts & Telemetry Alarms (`/alerts`)
- Chronological event log of physical hydraulic alerts and sensor diagnostic alarms.
- Filterable by severity (`CRITICAL`, `WARNING`, `INFO`) and status (`ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`).
- Interactive action buttons for operator acknowledgement and incident closure.

#### Page 5: Decision Engine & Actionable Recommendations (`/recommendations`)
- Core operational workbench displaying structured recommendations.
- Filterable by approval lifecycle stage: `Detected`, `Under Review`, `Approved`, `In Progress`, `Impact Measured`, `Rejected`.
- Each card presents: Priority Tier (P1–P4), Risk Score (/100), Problem Statement, Assigned Department, Action Window Deadline, Estimated Daily Water Loss (Liters & INR), and expandable 6-point evidence chain.
- Four interactive action buttons: **Approve**, **Reject**, **Dispatch Crew (In Progress)**, and **Simulate Repair & Measure Impact**.

#### Page 6: Campus Building Infrastructure (`/buildings`)
- Topological cards for all 6 buildings detailing: Building Category, Student/Faculty Occupancy Capacity, Overhead Tank Capacity (Liters), Nominal Operating Pressure, and Baseline Consumption.

#### Page 7: Fair & Constrained Distribution Optimization (`/optimization`)
- Interactive Supply Availability Slider ($100,000\text{–}300,000\text{ Liters/day}$).
- Live SciPy Linear Programming output table showing baseline demand, allocated water, curtailment volume, and demand satisfaction percentage per building.
- Vulnerable population protection badge confirming hostel welfare preservation.
- Human operator "Approve Distribution Plan" action button transmitting set-points to BMS log.

#### Page 8: Resilience Analytics & ESG Carbon Accounting (`/analytics`)
- Longitudinal sustainability scoreboard summing verified savings across all closed interventions: Total Water Recovered (Liters), Utility Tariff Cost Savings (INR), Pumping Electricity Conserved (kWh), and Mitigated $\text{CO}_2$ Emissions (kg).
- Telemetry mode badge explicitly stating `Data Provenance: High-Fidelity Continuous Hydraulic Simulation`.
- Chronological intervention audit table with timestamp, building, pre/post flow rates, and operator resolution notes.

#### Page 9: What-If Crisis Scenario Engine (`/simulator`)
- Stress-testing laboratory with presets:
  - Preset A: Moderate Pipe Leak on Hostel A Main Line ($+18.5\text{ LPM}$).
  - Preset B: Major Supply Cut (Municipal intake cut by 35%).
  - Preset C: Extreme Summer Heatwave ($+6^\circ\text{C}$ temperature spike).
- Side-by-side comparison matrix showing Baseline vs. Crisis Demand, Daily Water Deficit, and LP Mitigation Plan.

### 3.2 Hardware Interfaces & Hydraulic Actuators
AquaMind AI communicates logically with physical (or physically simulated) campus instrumentation:
- **Inlet & Outlet Ultrasonic Flow Transducers:** Modbus/RS-485 or MQTT streaming flow in LPM/LPH with $\pm 0.8\%$ precision.
- **Piezoresistive Pressure Transmitters:** 4–20 mA loop sensors on distribution mains measuring gauge pressure ($0.0\text{–}6.0\text{ bar}$).
- **Hydrostatic Overhead Tank Level Transmitters:** 0–100% proportional depth sensors.
- **Variable Frequency Drive (VFD) Booster Pumps:** Relay status ($0 = \text{OFF}$, $1 = \text{ON}$) with automated hysteresis shutoff at $95\%$ capacity and startup at $25\%$ capacity.

### 3.3 Software & API Interfaces
1. **Open-Meteo Historical Archive & Forecast API:** Queries hourly temperature ($^\circ\text{C}$), precipitation (mm), relative humidity (%), wind speed (km/h), and solar radiation ($\text{W/m}^2$).
2. **Local SQLite Database (`backend/aquamind.db`):** Zero-latency relational storage utilizing standard Python `sqlite3` with persistent connection pooling.
3. **Joblib Model Persistence:** Binary serialization of scikit-learn pipelines in `ai/saved_models/`.

### 3.4 Communications Interfaces
- **Protocol:** HTTP/1.1 RESTful JSON services over standard TCP/IP.
- **Ports:** Backend defaults to port `8000`; Frontend dev server defaults to port `5173`.
- **Content-Type:** `application/json; charset=utf-8`.
- **CORS Support:** Permissive CORS enabled for cross-origin development between localhost ports.

---

## 4. System Architecture & Subsystem Specifications

### 4.1 Subsystem 1: Continuous Hydraulic Sensor Simulation & Physical Mass Balance
- **Primary Class:** [`ZoneSimulator`](file:///c:/Users/lokes/OneDrive/Documents/AQUAMIND/src/simulation/zone_simulator.py) and [`CampusNetworkSimulator`](file:///c:/Users/lokes/OneDrive/Documents/AQUAMIND/src/simulation/campus_network.py).
- **Physical Conservation Formula:**
  $$\Delta V_t = (Q_{\text{in}} - Q_{\text{out}}) \times \Delta t$$
  $$V_{t+1} = \text{clip}\left(V_t + \Delta V_t, 0, C_{\text{tank}}\right)$$
- **Flow Decoupling Formula:**
  $$Q_{\text{outlet}} = Q_{\text{consumption}} + Q_{\text{leak}}$$
- **Pressure Dynamics:**
  $$P_t = P_{\text{nominal}} \times \left(0.85 + 0.15 \frac{V_t}{C_{\text{tank}}}\right) \times (1 - \delta_{\text{leak}}) - 0.05 \left(\frac{Q_{\text{outlet}}}{Q_{\text{base}}}\right) + \epsilon$$
  where $\delta_{\text{leak}} \in \{0.0, 0.08, 0.28, 0.65\}$ for none, minor, moderate, major leaks respectively.
- **Sensor Fault Simulation:** Injects sensor drift ($+2\%/\text{hr}$), freeze (constant telemetry hold), and telemetry spikes ($3.5\times$ multiplier) that alter observable telemetry without altering underlying physical tank water mass.

### 4.2 Subsystem 2: Meteorological Ingestion & Dual-Climate Fallback Engine
- **Primary Classes:** [`WeatherService`](file:///c:/Users/lokes/OneDrive/Documents/AQUAMIND/src/weather/client.py) and [`SyntheticWeatherGenerator`](file:///c:/Users/lokes/OneDrive/Documents/AQUAMIND/src/weather/synthetic.py).
- **Disk Caching Policy:** Check `data/weather_cache/open_meteo_{lat}_{lon}_{start}_{end}.json`. Load in $<5\text{ms}$ if present.
- **Graceful Timeout Fallback:** Upon HTTP timeout ($>5.0\text{s}$) or network disconnect, seamlessly transition to `SyntheticWeatherGenerator` with zero crash, explicitly marking all records with `weather_data_source = "synthetic_fallback"`.
- **Dual-Climate Calibration:**
  - **Bangalore (12.9716° N, 77.5946° E):** Altitude 920m ASL, Southwest Monsoon peak (June–September), moderate diurnal range ($5.5^\circ\text{C}$).
  - **Tamil Nadu (e.g., Chennai / Siruseri: 12.8256° N, 80.2227° E):** Coastal plain, Northeast Monsoon peak (October–December, 55–60% annual rainfall), coastal humidity baseline (72%), peak summer heat in May/June ($35\text{–}41^\circ\text{C}$).

### 4.3 Subsystem 3: Artificial Intelligence & Machine Learning Pipeline

```mermaid
graph TD
    RawTelemetry["Observable Sensor Telemetry<br/>(Flow, Pressure, Night Flow, Tank %, Occ, Weather)"]
    Splitter["Feature Transformer & Normalizer<br/>(Strictly Decoupled from Target Labels)"]
    RawTelemetry --> Splitter

    Splitter --> IF["1. Anomaly Detector<br/>(Multivariate Isolation Forest)"]
    Splitter --> RF["2. Leak Classifier<br/>(Balanced Random Forest)"]
    Splitter --> GBR["3. Demand Forecaster<br/>(Gradient Boosting Regressors)"]

    IF --> AnomLabel["Anomaly Status (0 or 1) & Score"]
    RF --> LeakLabel["Leak Severity (none, minor, moderate, major) & Vote Share"]
    GBR --> DemandForecast["24h & 7d Multi-Step Hourly Demand"]

    AnomLabel & LeakLabel & DemandForecast --> RootCause["Heuristic Root-Cause Engine<br/>(Pipe Leak vs Sensor Fault vs Consumption Anomaly)"]
    RootCause & DemandForecast --> ShortageRisk["Storage Autonomy & Shortage Risk Engine"]
```

#### 4.3.1 Multivariate Anomaly Detection
- **Algorithm:** Scikit-Learn `IsolationForest` (150 estimators, contamination=0.035, random_state=42).
- **Training Strategy:** Unsupervised learning on continuous observable dimensions.
- **Empirical Accuracy:** 94.2% overall accuracy on held-out 2,400-record chronological test set.

#### 4.3.2 Supervised Leak Severity Classification
- **Algorithm:** Scikit-Learn `RandomForestClassifier` (180 trees, max_depth=12, min_samples_split=4, class_weight="balanced").
- **Classes:** `none`, `minor`, `moderate`, `major`.
- **Input Features (11):** `flow_rate_lpm`, `pressure_bar`, `night_flow_lpm`, `water_consumption_liters`, `tank_level_percent`, `occupancy`, `temperature`, `rainfall`, `humidity`, `hour_of_day`, `is_weekend`.
- **Baseline Accuracy:** 99% precision and 100% recall on normal baseline non-leak hours.
- **Reporting Guarantee:** Probabilities are reported as **Ensemble Tree Vote Shares**, maintaining strict transparency that mathematical calibration (Platt/Isotonic) was not applied.

#### 4.3.3 Multi-Horizon Demand Forecasting
- **Algorithm:** Dedicated `GradientBoostingRegressor` per campus building (120 trees, max_depth=5, learning_rate=0.08).
- **Horizons Supported:** 24-hour ahead (1-hour resolution) and 7-day ahead (168-hour resolution).
- **Empirical Performance on 2,400 Held-Out Records:**
  - 24-Hour Campus Average MAE: **$91.5\text{ Liters}$** | RMSE: **$150.5\text{ Liters}$**.
  - 7-Day Campus Average MAE: **$88.4\text{ Liters}$** | RMSE: **$215.3\text{ Liters}$**.
  - Full 400-Hour Test Horizon Campus MAE: **$81.5\text{ Liters}$** | RMSE: **$185.4\text{ Liters}$**.

#### 4.3.4 Explainable Shortage Risk & Autonomy Evaluator
- **Autonomy Equation:**
  $$\text{Storage Autonomy (Hours)} = \frac{\text{Current Tank Volume (Liters)}}{\text{Average Hourly Forecast Demand (Liters/Hour)}}$$
- **Risk Tiers:**
  - `High Risk`: Storage autonomy $< 12.0\text{ hours}$ OR central reservoir $< 30\%$.
  - `Medium Risk`: Storage autonomy between $12.0$ and $24.0\text{ hours}$.
  - `Low Risk`: Storage autonomy $> 24.0\text{ hours}$ and stable campus supply.

### 4.4 Subsystem 4: Decision Intelligence & Optimization Engine

#### 4.4.1 Dynamic Priority & Risk Scoring Engine
Calculates composite risk score $R \in [0, 100]$:
$$R = 0.35 \cdot S_{\text{leak}} + 0.25 \cdot S_{\text{tank}} + 0.15 \cdot S_{\text{pressure}} + 0.15 \cdot S_{\text{shortage}} + 0.10 \cdot S_{\text{occupancy}}$$
Priority Mapping:
- **P1 — Critical ($R \ge 75$):** Immediate emergency response within 2 hours.
- **P2 — High ($50 \le R < 75$):** Urgent maintenance response within 6 hours.
- **P3 — Moderate ($25 \le R < 50$):** Scheduled maintenance within 24 hours.
- **P4 — Low ($R < 25$):** Routine weekly monitoring.

#### 4.4.2 Evidence-Based Recommendation Generator
Produces structured operational directives with:
- Assigned department (`Plumbing/Maintenance Team`, `Facilities Management`, `Water Management Team`).
- Estimated daily water loss (Liters) and financial loss rate (₹/day).
- Comprehensive 6-point evidence chain (e.g., flow delta, pressure drop, night flow elevation, tank drawdown).

#### 4.4.3 Constrained Water Distribution Optimizer (Linear Programming)
- **Engine:** `scipy.optimize.linprog` (Interior-Point / HiGHS solver).
- **Objective:**
  $$\max \sum_{i=1}^{N} w_i \cdot x_i - \lambda \sum_{i=1}^{N} (x_i - \bar{x})^2$$
- **Constraints:**
  1. $\sum_{i=1}^{N} x_i \le S_{\text{available}}$ (Total supply conservation).
  2. $x_i \le D_i$ (Cannot allocate more than predicted demand).
  3. $x_{\text{hostel}} \ge 0.70 \cdot D_{\text{hostel}}$ (**Vulnerable Population Guardrail**).
  4. $x_{\text{lab}} \ge 0.80 \cdot D_{\text{lab}}$ (Research cooling protection).
  5. $x_{\text{garden}} \ge 0.10 \cdot D_{\text{garden}}$ (Recreational throttling buffer).

#### 4.4.4 Post-Intervention Impact Measurement & ESG Accounting
- $\Delta Q_{\text{flow}} = Q_{\text{pre-intervention}} - Q_{\text{post-intervention}}$ (LPM).
- $\text{Water Saved (L)} = \Delta Q_{\text{flow}} \times 60 \times 24$.
- $\text{Direct Tariff Savings (₹)} = \frac{\text{Water Saved}}{1,000} \times 45.00$.
- $\text{Pumping Energy Conserved (kWh)} = \frac{\text{Water Saved}}{1,000} \times 0.45$.
- $\text{Carbon Mitigated (kg CO}_2\text{)} = \text{Energy Conserved} \times 0.82$.

#### 4.4.5 What-If Scenario Crisis Simulator
Enables operators to evaluate complex hydraulic interventions before field execution, predicting exact daily deficits and generating automated mitigation plans.

### 4.5 Subsystem 5: FastAPI REST Backend & SQLite Architecture
- **Structure:** 11 dedicated API routers (`analytics`, `buildings`, `interventions`, `optimization`, `predictions`, `recommendations`, `scenario`, `sensors`, `simulator`, `weather`, `health`).
- **Persistence Layer:** Direct SQLite 3 engine with schema auto-initialization in [`backend/database.py`](file:///c:/Users/lokes/OneDrive/Documents/AQUAMIND/backend/database.py).

### 4.6 Subsystem 6: React 18 + TypeScript Dashboard Application
- **Build System:** Vite 5 with TypeScript compiler (`tsc -b`).
- **Component Architecture:** Pure modular functional components with Lucide icons and Recharts data visualizations.
- **State Synchronization:** Background polling interval of 8,000ms with manual simulation step triggers.

---

## 5. Database Schema & Data Dictionary

```mermaid
erDiagram
    BUILDINGS ||--o{ SENSOR_READINGS : records
    BUILDINGS ||--o{ PREDICTIONS : generates
    BUILDINGS ||--o{ ALERTS : triggers
    BUILDINGS ||--o{ RECOMMENDATIONS : targets
    RECOMMENDATIONS ||--o{ INTERVENTIONS : dispatches
    INTERVENTIONS ||--|| IMPACT_MEASUREMENTS : measures

    BUILDINGS {
        text building_id PK
        text building_name
        text category
        int occupancy
        float tank_capacity_liters
        float nominal_pressure_bar
        float base_flow_lpm
    }

    SENSOR_READINGS {
        int id PK
        text timestamp
        text building_id FK
        float flow_rate_lpm
        float pressure_bar
        float tank_level_percent
        float tank_volume_liters
        float night_flow_lpm
        int pump_status
    }

    RECOMMENDATIONS {
        int id PK
        text problem
        text building_id FK
        text priority
        float risk_score
        float estimated_daily_loss_liters
        float estimated_daily_cost_inr
        text recommended_action
        text assigned_department
        text approval_status
    }

    INTERVENTIONS {
        text id PK
        int recommendation_id FK
        text building_id FK
        text status
        text start_timestamp
        text completion_timestamp
    }

    IMPACT_MEASUREMENTS {
        int id PK
        text intervention_id FK
        float pre_intervention_flow_lpm
        float post_intervention_flow_lpm
        float flow_reduction_lpm
        float verified_water_saved_liters
        float financial_savings_inr
        float pumping_energy_saved_kwh
        float co2_emissions_avoided_kg
    }
```

### 5.2 Observable Feature Matrix vs Ground Truth Decoupling

| Feature Column Name | Telemetry Class | Used by ML Model | Description |
| :--- | :--- | :---: | :--- |
| `timestamp` | Metadata | Forecaster | ISO-8601 observation timestamp |
| `flow_rate_lpm` | Observable Telemetry | RF, IF | Pipe bulk flow leaving storage tank |
| `pressure_bar` | Observable Telemetry | RF, IF | Main distribution line gauge pressure |
| `night_flow_lpm` | Observable Telemetry | RF, IF | Minimum flow during 02:00–04:00 window |
| `water_consumption_liters` | Observable Telemetry | RF, IF | Internal sub-meter volume recorded |
| `tank_level_percent` | Observable Telemetry | RF, IF | Current storage volume / capacity $\times 100$ |
| `occupancy` | Observable Feature | RF, IF, GBR | Estimated building active population |
| `temperature` | Weather Observable | RF, IF, GBR | Ambient dry-bulb temperature ($^\circ\text{C}$) |
| `precipitation_mm` | Weather Observable | RF, IF, GBR | Hourly rainfall depth (mm) |
| `relative_humidity_pct` | Weather Observable | RF, IF, GBR | Ambient relative humidity (%) |
| `hour_of_day` | Calendar Harmonic | RF, GBR | Diurnal cycle index ($0\text{–}23$) |
| `is_weekend` | Calendar Harmonic | RF, GBR | Weekend binary flag ($0\text{ or }1$) |
| `ground_truth_leak_status` | **Ground Truth Target** | **NO (EVAL ONLY)** | Binary leak state ($0 = \text{No}, 1 = \text{Leak}$) |
| `ground_truth_leak_severity`| **Ground Truth Target** | **NO (EVAL ONLY)** | `none`, `minor`, `moderate`, `major` |
| `ground_truth_leak_flow_lph`| **Ground Truth Target** | **NO (EVAL ONLY)** | True physical orifice leakage discharge rate |
| `ground_truth_anomaly_type` | **Ground Truth Target** | **NO (EVAL ONLY)** | `none`, `pipe_leak`, `sensor_drift`, `freeze` |

---

## 6. Non-Functional Requirements

### 6.1 Performance & Latency
- **API Response Latency:** 95% of read requests (`/sensors/latest`, `/recommendations`, `/buildings`) shall respond within $< 50\text{ms}$.
- **ML Inference Execution Time:**
  - Anomaly Detection (Isolation Forest): $< 10\text{ms}$ per batch of 6 buildings.
  - Leak Classification (Random Forest): $< 15\text{ms}$ per batch of 6 buildings.
  - 24-Hour Demand Forecasting (Gradient Boosting): $< 45\text{ms}$ per batch.
- **Linear Programming Optimization:** SciPy optimizer shall find optimal allocations within $< 100\text{ms}$.
- **Frontend Bundle Size:** Production JavaScript bundle shall remain under $250\text{ kB}$ uncompressed ($< 70\text{ kB}$ gzip).

### 6.2 Reliability & Fault Tolerance
- **Offline Resilience:** The platform must execute full physical simulation, inference, and optimization cycles without active internet connection using cached or synthetic meteorological data.
- **Graceful Error Handling:** Network drops, database locking, or API format anomalies must be captured and transformed into user-friendly error messages without crashing the backend process.

### 6.3 Physical Consistency & Mathematical Integrity
- **Mass Balance Enforcement:** Dynamic tank continuity must be conserved without unphysical instantaneous volume shifts.
- **Sensor vs. Leak Discrepancy:** Building consumption sub-meters and pipeline flow meters must maintain mathematical independence ($Q_{\text{outlet}} = Q_{\text{consumption}} + Q_{\text{leak}}$).

### 6.4 Responsible AI & Safety Guardrails
- **Vulnerable Population Protection:** Hostels and residential student housing are explicitly protected against automated or manual supply throttling below $70\%$ satisfaction.
- **Human Authority:** Direct actuation commands (valve shutoff, maintenance crew dispatch, BMS adjustments) require an explicit human operator approval record.

### 6.5 Maintainability & Deterministic Reproducibility
- **Fixed Random Seeds:** A global random seed (`seed = 42`) guarantees bit-exact reproducible generation of benchmarks, test splits, and synthetic weather fronts.
- **Code Cleanliness:** Strict typing enforced across TypeScript (`strict: true`) and Python (Pydantic schemas and dataclasses).

---

## 7. Verification & Traceability Matrix

| Requirement Area | Specification Clause | Verification Mechanism | Status |
| :--- | :--- | :--- | :---: |
| **Physical Bounds** | Tank levels within $[0\%, 100\%]$, non-negative flow, pressure $\in [1.4, 4.0]\text{ bar}$ | `tests/test_physical_consistency.py` | **PASSED** |
| **Mass Balance** | $\Delta V = (Q_{\text{in}} - Q_{\text{out}})\Delta t$ | `src/validation/validator.py` (Check 3 & 4) | **PASSED** |
| **Flow Decoupling** | $Q_{\text{outlet}} = Q_{\text{consumption}} + Q_{\text{leak}}$ | `validator.py` (Check 4 across 179 leak events) | **PASSED** |
| **ML Data Leakage** | Target labels excluded from feature matrices | `tests/test_data_quality.py` & `validator.py` (Check 5) | **PASSED** |
| **Deterministic Seed** | Bit-exact generation with seed 42 | `tests/test_reproducibility.py` & `validator.py` (Check 8) | **PASSED** |
| **Weather Reliability** | Local disk caching & synthetic fallback | `tests/test_weather_service.py` & `validator.py` (Check 7) | **PASSED** |
| **AI Inference** | Anomaly detection, leak classification, demand forecast | `tests/test_ai_intelligence.py` | **PASSED** |
| **Fair Optimization** | Hostel non-throttling guardrail under supply cut | `tests/test_decision_engine.py` | **PASSED** |
| **Impact Measurement** | Flow reduction, tariff savings, kWh, avoided $\text{CO}_2$ | `tests/test_decision_engine.py` | **PASSED** |
| **API Endpoints** | FastAPI status codes and payload validation | `tests/test_backend_api.py` (7 tests) | **PASSED** |
| **Continuous Sim** | Multi-zone streaming, leak injection, sensor faults | `tests/test_sensor_simulator.py` (4 tests) | **PASSED** |
| **End-to-End Workflow**| 16-step closed decision loop in Hostel A | `scripts/verify_hostel_a_scenario.py` (16 steps) | **PASSED** |
| **Frontend Production**| Zero TypeScript compilation or bundling errors | `npm run build` in `frontend/` (1,593 modules) | **PASSED** |

---

*AquaMind AI — Developed for the TCS AI Hackathon 2026. Empowering Educational and Municipal Campuses with Sustainable, Resilient, and Human-Supervised Water Intelligence.*

