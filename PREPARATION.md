# PREPARATION.md
> Pre-hackathon setup checklist. Complete everything here **before** the clock starts.

---

## 1. Accounts & Credentials

### Required (Must Have)
- [ ] **GitHub** — Create shared repository, invite both team members as collaborators
- [ ] **Supabase** — Create project, get `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- [ ] **Vercel** — Connect GitHub account, ready for frontend deploy
- [ ] **Render** (or Railway) — Account ready for backend deploy
- [ ] **Google AI Studio** — Get `GEMINI_API_KEY` (free tier available at [aistudio.google.com](https://aistudio.google.com))

### Optional / Nice to Have
- [ ] **Open-Meteo API** — No key required, free and open. Just verify endpoint works:
  ```
  GET https://api.open-meteo.com/v1/forecast?latitude=1.35&longitude=103.82&current_weather=true
  ```

---

## 2. Local Environment

### Both Team Members

#### Python (Backend + ML)
- [ ] Python 3.11+
- [ ] Create virtualenv: `python -m venv venv`
- [ ] Install backend dependencies:
  ```bash
  pip install fastapi uvicorn xgboost shap pandas numpy scikit-learn \
              httpx python-multipart supabase google-generativeai python-dotenv
  ```
- [ ] Install ML/training dependencies:
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

> **Status: Not ready yet.** Prepare download links and inspect structure before hackathon.

### Primary Candidates (pick ONE to focus on)

| Dataset | Source | Notes |
|---------|--------|-------|
| Supply Chain Data Hub — Delay Prediction | [supplychaindata.io](https://supplychaindata.io) | Most directly relevant |
| Kaggle: Global Supply Chain Risk 2024–2026 | [kaggle.com](https://kaggle.com) | Has geopolitical + weather features |
| ISOMORPH Digital Twin | Research paper dataset | Time series inventory + disruption |
| U.S. Freight Indicators | [data.gov](https://data.gov) | Good for route-level signals |

### Pre-hackathon Dataset Tasks
- [ ] Download chosen dataset locally to `ml/data/raw/`
- [ ] Open in a notebook and confirm these columns exist (or equivalents):
  - Origin / Destination
  - Shipment date
  - Actual delivery date → compute `delay_days`
  - Transport mode (sea / air / land)
  - At least one disruption/risk signal (weather, port status, etc.)
- [ ] Target: subset to **10k–50k rows** for fast training

---

## 4. Pre-training Model (Do This Offline Before Hackathon)

> Training during hackathon wastes precious hours. Do it now.

### Steps
- [ ] Run `ml/notebooks/01_eda.ipynb` — understand data distribution
- [ ] Run `ml/notebooks/02_training.ipynb` — train both models:
  - `XGBoostRegressor` → predict `delay_days` (regression)
  - `XGBoostClassifier` → predict risk level: `High / Medium / Low` (classification)
- [ ] Compute and cache SHAP explainer:
  ```python
  import shap, pickle
  explainer = shap.TreeExplainer(model)
  with open("backend/models/explainer.pkl", "wb") as f:
      pickle.dump(explainer, f)
  ```
- [ ] Save trained models:
  ```
  backend/models/model_delay.json      ← XGBoost regressor
  backend/models/model_risk.json       ← XGBoost classifier
  backend/models/explainer.pkl         ← SHAP explainer
  backend/models/feature_columns.json  ← list of feature names used during training
  ```
- [ ] Upload model files to **Supabase Storage** as backup (bucket: `models`)

### Target Metrics (Minimum Acceptable for Demo)
| Model | Metric | Target |
|-------|--------|--------|
| Delay Regressor | MAE | < 2 days |
| Risk Classifier | Accuracy | > 70% |

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

Run this SQL in Supabase SQL Editor before hackathon:

```sql
-- Feedback table for user validation loop
CREATE TABLE feedback (
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
CREATE TABLE prediction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  input_data JSONB,
  output_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] Tables created and confirmed in Supabase dashboard

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
