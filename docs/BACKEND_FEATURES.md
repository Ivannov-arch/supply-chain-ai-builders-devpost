# Backend Features & Server-Side Logic Reference

This document details the backend service architecture, machine learning inference pipeline, generative AI integration, database logging, and API routers powering the **SupplyPulse** FastAPI application.

---

## 1. Machine Learning Inference Pipeline & Encoding

### Service Overview
Loads trained XGBoost artifacts on startup, handles categorical encoding, feature ordering, regression, classification, and SHAP feature importance extraction.

### Core Server Logic
- **Artifact Initialization:** Loads `model_delay.json` (XGBRegressor), `model_risk.json` (XGBClassifier), `label_encoders.pkl`, `explainer.pkl`, and `feature_columns.json` once at module import.
- **Categorical Feature Encoding:** Converts input string values (`Country`, `Vendor`, `Shipment Mode`, etc.) using pre-fitted `LabelEncoders`. Unseen categories are mapped to `-1`.
- **Dual Model Inference:**
  - `MODEL_DELAY`: Predicts expected delay in days (`float`).
  - `MODEL_RISK`: Computes class probability and compares against tuned `OPTIMAL_THRESHOLD` (0.51) to assign `High Risk` or `Low Risk`.
- **Top SHAP Feature Extraction:** Computes SHAP values via `TreeExplainer` and returns top 5 features sorted by absolute contribution magnitude.

### File References & Line Numbers
- [`backend/services/predictor.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/predictor.py#L12-L30) — One-time model & artifact loading
- [`backend/services/predictor.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/predictor.py#L69-L86) — `_encode_input` feature array transformation
- [`backend/services/predictor.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/predictor.py#L89-L101) — `_top_shap_features` extraction logic
- [`backend/services/predictor.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/predictor.py#L104-L125) — `run_prediction` main entry point

---

## 2. Generative AI Action Plan Reasoning Layer

### Service Overview
Uses Google Gemini API (`gemini-2.5-flash` or custom selected model) to generate concise, natural language supply chain mitigation plans.

### Core Server Logic
- **Prompt Engineering:** Injects prediction outcomes, SHAP risk drivers, and shipment metadata into a structured domain-specific prompt.
- **Fallback Resilience:** Returns structured rule-based fallback recommendations if the Gemini API call times out or encounters network issues.

### File References & Line Numbers
- [`backend/services/gemini_service.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/gemini_service.py#L15-L65) — Prompt construction & Gemini API execution
- [`backend/services/gemini_service.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/services/gemini_service.py#L67-L90) — Fallback action plan generator

---

## 3. Fire-and-Forget Prediction Logging & Supabase Integration

### Service Overview
Asynchronously records all prediction requests, feature vectors, SHAP contributions, and Gemini advice into Supabase PostgreSQL.

### Core Server Logic
- **Non-Blocking Execution:** Uses `httpx.AsyncClient` in a fire-and-forget pattern so database latency never degrades user response time.
- **Prediction ID Return:** Returns generated record UUID to frontend to enable ground-truth feedback linking.

### File References & Line Numbers
- [`backend/main.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/main.py#L35-L90) — `_log_prediction` async Supabase logger
- [`backend/main.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/main.py#L114-L140) — `POST /predict` pipeline controller

---

## 4. Benchmark Dataset Router & Dual-Source Fallback System

### Service Overview
Provides paginated access, record detail lookup, and summary statistics for the 2,908 historical SCMS benchmark dataset.

### Core Server Logic
- **Dual-Source Architecture:** Primary query targets Supabase REST API under schema `devpost_name_ai_builders`. If Supabase is unreachable or unconfigured, seamlessly falls back to querying `backend/data/scms_benchmark.csv` via Pandas in-memory dataframe.
- **Server-Side Filtering & Search:** Supports filtering by `all`, `delayed`, and `ontime`, alongside case-insensitive substring searching across Country, Vendor, and Shipment Mode.

### File References & Line Numbers
- [`backend/routers/dev.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/dev.py#L20-L26) — Benchmark CSV loading & in-memory pandas initialization
- [`backend/routers/dev.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/dev.py#L72-L125) — `GET /api/dev/summary` stats aggregator
- [`backend/routers/dev.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/dev.py#L127-L227) — `GET /api/dev/records` paginated search & filter endpoint
- [`backend/routers/dev.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/dev.py#L230-L325) — `GET /api/dev/records/{row_id}` detail record lookup

---

## 5. User Feedback & Ground Truth Loop Router

### Service Overview
Receives actual shipment outcome submissions from users and records them into Supabase to facilitate future model retraining.

### Core Server Logic
- Validates feedback payload (`was_delayed`, `actual_delay_days`, `user_notes`).
- Updates `feedback` table in Supabase PostgreSQL linked to the original `prediction_id`.

### File References & Line Numbers
- [`backend/routers/feedback.py`](file:///c:/Coding/Hackathons/Devpost_AI%20Builders/backend/routers/feedback.py#L15-L65) — `POST /feedback` endpoint handler
