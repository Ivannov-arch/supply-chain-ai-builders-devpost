# Implementation Worksteps — Cross-Border Supply Chain Risk Predictor

---

## Phase 1 — Dataset & Backend Setup

### Step 1.1: Environment & Project Setup (Completed [x])

1. [x] Create project repository structure: ackend/, rontend/, ml/
2. [x] Set up Python virtual environment in ackend/ and install dependencies: astapi, uvicorn, xgboost, scikit-learn, shap, google-generativeai, supabase, python-dotenv
3. [x] Create .env file with GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY
4. [x] Verify trained models from ml/ exist: model_delay.json, model_risk.json, label_encoders.pkl, explainer.pkl
5. [x] Create basic ackend/main.py with /health endpoint and test server startup

---

### Step 1.2: Core Prediction Endpoint (Completed [x])

6. [x] Create ackend/schemas/request.py — define Pydantic models for input/output matching SCMS dataset schema (PredictionRequest, PredictionResponse)
7. [x] Create ackend/services/model_service.py — load model_delay.json, model_risk.json, label_encoders.pkl on startup
8. [x] Create ackend/routers/predict.py — implement POST /predict:
   - Accept SCMS supply chain input fields (Country, Shipment Mode, Vendor INCO Term, Weight, Freight Cost, Line Item Value, Quantity, etc.)
   - Run XGBoost inference ? delay_days (regression) + isk_label (classification)
   - Return structured JSON response
9. [x] Mount router in main.py, test with FastAPI swagger docs

---

### Step 1.3: SHAP Integration (Completed [x])

10. [x] Create ackend/services/shap_service.py — load explainer.pkl on startup
11. [x] For each /predict call, run SHAP and extract top feature contributions as percentages
12. [x] Add shap_top_features to the predict response
13. [x] Verify SHAP values and output structure

---

### Step 1.4: Gemini AI Integration (Completed [x])

14. [x] Create ackend/services/gemini_service.py — initialize Google GenAI / Gemini client
15. [x] Build prompt template specific to supply chain risk & customs clearance context
16. [x] Use Gemini model for fast, actionable advice generation
17. [x] Inject Gemini response as ction_plan string into /predict response
18. [x] Test full /predict end-to-end: input ? XGBoost ? SHAP ? Gemini ? JSON output

---

### Step 1.5: Backend Phase 1 Verification & Supabase Integration (Completed [x])

19. [x] Test /predict with valid inputs — confirm all fields populated (delay_days, isk_flag, isk_label, shap_top_features, ction_plan)
20. [x] Create & execute Supabase SQL Schema for prediction_logs and eedback tables (column names aligned 1:1 with backend models)
21. [x] Save prediction log automatically into Supabase prediction_logs on each /predict call
22. [x] Implement POST /feedback endpoint in backend to log user actual outcome into Supabase

---

## Phase 2 — Bulk Upload & Endpoints (Completed [x])

23. [x] Implement POST /predict-bulk in ackend/routers/predict.py:
    - Accept CSV file upload
    - Validate required columns
    - Run prediction loop for rows (reusing prediction pipeline)
    - Return aggregated summary (High/Medium/Low counts) and row predictions

---

## Phase 3 — Frontend Application & Deployment

### Step 3.1: Frontend Application Build

24. [ ] Build Next.js 15 app in rontend/ with Tailwind CSS & UI components
25. [ ] Create rontend/lib/api.ts — API client wrappers for /predict, /predict-bulk, /feedback
26. [ ] Build **Single Shipment Predictor Page**:
    - Form inputs matching backend PredictionRequest
    - Interactive results card: Risk badge, predicted delay days, confidence/risk flag
    - SHAP Feature Importance visual chart
    - Gemini Action Plan display
    - Live Feedback submit button (Was this shipment delayed? Yes / No)
27. [ ] Build **Bulk CSV Upload Page**:
    - Drag-and-drop CSV upload zone
    - Summary risk cards & risk heatmap table
    - Export results functionality

---

### Step 3.2: Verification & Final Polish

28. [ ] End-to-end testing of Frontend ? Backend integration
29. [ ] Prepare demo data (sample_manifest.csv) for submission/pitch

---

## Quick Reference

| Endpoint | Method | Purpose | Output |
|----------|--------|---------|--------|
| /health | GET | Healthcheck | { status: "ok" } |
| /predict | POST | Single shipment prediction + SHAP + Gemini + Supabase log | delay_days, isk_flag, isk_label, shap_top_features, ction_plan |
| /predict-bulk | POST | CSV bulk prediction | array of predictions + summary counts |
| /feedback | POST | Submit ground truth outcome | { status: "success", log_id: ... } |
