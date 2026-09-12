# PREPARATION.md
>Setup checklist. Complete everything here **before** the clock starts.

---

## 1. Accounts & Credentials

### Required (Must Have)
- [x] **GitHub** — Create shared repository, invite both team members as collaborators
- [x] **Supabase** — Create project, get `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- [x] **Vercel** — Connect GitHub account, ready for frontend deploy
- [x] **Render** (or Railway) — Account ready for backend deploy
- [x] **Google AI Studio** — Get `GEMINI_API_KEY` (free tier available at [aistudio.google.com](https://aistudio.google.com))

### Optional / Nice to Have
- [x] **Open-Meteo API** — No key required, free and open. Just verify endpoint works:
  ```
  GET https://api.open-meteo.com/v1/forecast?latitude=1.35&longitude=103.82&current_weather=true
  ```

---

## 2. Local Environment

### Both Team Members

#### Python (Backend + ML)
- [x] Python 3.11+
- [x] Create virtualenv: `python -m venv venv`
- [x] Install backend dependencies:
  ```bash
  pip install -r backend/requirements.txt
  ```
- [x] Install ML/training dependencies:
  ```bash
  pip install jupyter matplotlib seaborn plotly
  ```

#### Node.js (Frontend)
- [ ] Node.js 18+
- [ ] pnpm recommended: `npm install -g pnpm`
- [ ] Verify Next.js 15 scaffold works:
  ```bash
  pnpm create next-app@latest --typescript --tailwind --app
  ```

---

## 3. Dataset

> **Status: Ready! ✅** Dataset SCMS Delivery History (Real Data) downloaded and prepared.

### Selected Datasets (Option A: Real SCMS Supply Chain Dataset)

| Dataset | Source | Role | Notes |
|---------|--------|------|-------|
| **SCMS Delivery History Dataset** | USAID Supply Chain | **✅ Primary — Main Model** | 10k rows, real supply chain data, target delay_days & risk_flag |

### Pre-hackathon Dataset Tasks
- [x] Download SCMS dataset to `ml/datasets/SCMS_Delivery_History_Dataset.csv`
- [x] Extracted features: `Country`, `Managed By`, `Fulfill Via`, `Vendor INCO Term`, `Shipment Mode`, `Product Group`, `Sub Classification`, `Vendor`, `Weight`, `Freight Cost`, `Line Item Value`, `Line Item Quantity`, `Pack Price`, `planned_lead_time`, `freight_per_kg`, `value_per_unit`, `sched_month`, `sched_dayofweek`
- [x] Targets: `delay_days` (Regression) & `risk_flag` (Binary Classification: 0=On Time, 1=Delayed)

---

## 4. Pre-training Model (Do This Offline Before Hackathon)

> **Status: Completed! ✅** Models trained, evaluated, and saved to `backend/models/`.

### Steps
- [x] Run `ml/notebooks/01_training.ipynb` — train both XGBoost models on SCMS dataset
- [x] Compute and cache SHAP explainer
- [x] Save trained models to `backend/models/`:
  - `model_delay.json` (XGBoost Regressor — MAE: 3.57 days)
  - `model_risk.json` (XGBoost Classifier — Accuracy: 91.6%, Recall: 72.5%)
  - `explainer.pkl` (SHAP TreeExplainer)
  - `label_encoders.pkl` (Label encoders for 8 categorical columns)
  - `feature_columns.json` (Feature schema & optimal threshold: 0.51)
  - `encoder_classes.json` (Encoder category classes)

### Target Metrics vs Achieved Results
| Model | Metric | Target | Achieved | Status |
|-------|--------|--------|----------|--------|
| Delay Regressor | MAE | < 5.0 days | **3.57 days** | ✅ PASSED |
| Risk Classifier | Accuracy | > 70% | **91.6%** | ✅ PASSED |
| Risk Classifier | Sensitivity (Recall) | > 60% | **72.5%** | ✅ PASSED |
| Risk Classifier | Optimal Threshold | - | **0.51** | ✅ TUNED |


---

## 5. Architecture Verification

Confirm the full system flow works end-to-end locally before hackathon:

```
[Next.js Frontend]
        │  POST /predict  (JSON: origin, dest, cargo, date)
        │  POST /predict-bulk  (CSV file upload)
        ▼
[FastAPI Backend]
        │  Load XGBoost model → predict delay + risk
        │  Run SHAP → get feature importance breakdown
        │  Call Gemini API → generate action plan text
        ▼
[Response JSON]
  {
    "delay_days": 3.8,
    "risk_level": "HIGH",
    "shap_breakdown": {"port_congestion": 0.45, "weather": 0.30},
    "action_plan": "Consider rerouting via land. Buffer stock by 5 days."
  }
        ▼
[Frontend Dashboard]
  - Risk score card
  - SHAP breakdown bar chart
  - LLM action plan text
  - Feedback button
```

- [ ] FastAPI server runs on `localhost:8000`
- [ ] Next.js runs on `localhost:3000`
- [ ] `/predict` endpoint returns correct shape
- [ ] Gemini API call works with test prompt
- [ ] Supabase connection saves a test row to `feedback` table

---

## 6. Environment Files

### `backend/.env.example`
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MODEL_DIR=./models
```

### `frontend/.env.local.example`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] Both `.env` files filled in with real values (never commit real keys)
- [ ] `.env.example` files committed to repo as templates

---

## 7. Supabase Schema

Schema: `devpost_name_ai_builders` (already created & verified in Supabase)

```sql
CREATE SCHEMA IF NOT EXISTS devpost_name_ai_builders;

-- Feedback table for user validation loop
CREATE TABLE devpost_name_ai_builders.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT,
  destination TEXT,
  cargo_type TEXT,
  predicted_delay FLOAT,
  predicted_risk TEXT,
  was_delayed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: prediction logs
CREATE TABLE devpost_name_ai_builders.prediction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  input_data JSONB,
  output_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [x] Tables created and confirmed in Supabase dashboard under schema `devpost_name_ai_builders`

---

## 8. Team Role Split (2 People)

| Role | Responsibilities |
|------|-----------------|
| **Person A — Backend / ML** | FastAPI endpoints, model loading, SHAP, Gemini integration, Supabase |
| **Person B — Frontend / UX** | Next.js pages, components, CSV upload, dashboard, charts, deploy to Vercel |

> Both should be able to run the full stack locally before hackathon starts.

---

## Pre-Hackathon Checklist Summary

- [ ] All accounts created
- [ ] Both envs set up and working locally
- [ ] Dataset downloaded and inspected
- [ ] Models trained and saved to `backend/models/`
- [ ] Full local stack verified end-to-end
- [ ] Supabase schema created
- [ ] GitHub repo initialized and both members have push access
