# PREPARATION.md
> Pre-hackathon setup checklist. Complete everything here **before** the clock starts.

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

> **Status: Not ready yet.** Prepare download links and inspect structure before hackathon.

### Selected Datasets (Opsi A: Cross-Border Delay + Risk + LLM + XAI)

| Dataset | Source | Role | Notes |
|---------|--------|------|-------|
| **Cross-Border Trade & Customs Delay** | [Kaggle CC0](https://www.kaggle.com/datasets/ziya07/cross-border-trade-and-customs-delay-dataset) | **✅ Primary — Model Utama** | 10k rows, 1.88 MB, target siap pakai, lisensi CC0 |
| **Freight Indicators Weekly** | [data.gov](https://catalog.data.gov/dataset/freight-indicators-weekly) | **✅ Secondary — Dashboard Context** | Indikator kondisi freight mingguan, gratis, resmi US DOT |

### Pre-hackathon Dataset Tasks
- [ ] Download Cross-Border dataset locally to `ml/data/raw/cross_border_customs.csv`
- [ ] Download Freight Indicators CSV to `ml/data/raw/freight_indicators_weekly.csv`
- [ ] Open in a notebook and confirm these columns exist:
  - `Origin_Country`, `Destination_Country`
  - `Transport_Mode` (sea / air / land)
  - `Cargo_Type`
  - `Customs_Delay_Days` ← target regresi
  - `Risk_Flag` ← target klasifikasi (0 = low, 1 = high)
  - `Compliance_Score`
  - `Prior_Offense_Count`
  - `Inspection_Type` (none / x-ray / document / physical)
  - `Is_High_Risk_Cargo`
  - `Trade_Agreement` (FTA / non-FTA)
- [ ] Target: gunakan **semua ~10k rows** (dataset sudah ringkas, tidak perlu subset)

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
