# Initial Research & Brainstorming - Supply Chain Disruption & Delay Prediction

This document summarizes the core proposal, business model, dataset selection, system architecture, and execution plan for **SupplyPulse** (Supply Chain Disruption & Delay Prediction System).

---

## 1. Problem Statement

**Core Problem:**
Global supply chains and logistics are extremely vulnerable to disruptions (natural disasters, conflicts, port congestion, extreme weather). Minor delays can cause a domino effect:

- Delivery delays
- Stockouts
- Operational downtime
- Massive financial losses (damaged shipments, contract penalties, customer churn)

**Target Audience:**
- Importers / Exporters (especially time-sensitive or perishable goods)
- SME Manufacturers & Retailers
- Logistics Providers & Freight Forwarders
- Cross-border businesses reliant on international supply chains

**Current Market Landscape & Gap:**
- Existing enterprise tools (Project44, FourKites, Everstream AI) offer disruption tracking, but:
  - High costs
  - Lengthy enterprise integration cycles
  - Target large multinational corporations, leaving SMEs without access
- Currently, SMEs rely primarily on gut feeling, static estimates, or manual spreadsheets.
- There is no accessible, simple, and affordable early warning tool specifically designed for SMEs in emerging and cross-border markets.

---

## 2. Proposed Solution & Value Proposition

**Product:**
An AI-powered Early Warning & Delay Prediction System tailored for cross-border supply chains.

**Core Capabilities:**
1. **Logistic Inputs:** Historical lead times, inventory levels, transit mode, vendor INCO terms, and shipment value.
2. **Predictive Machine Learning:** XGBoost regression models forecasting delivery delays (in days) and classifying risk levels (`HIGH`, `MEDIUM`, `LOW`).
3. **Explainable AI (XAI):** SHAP (SHapley Additive exPlanations) integration explaining *why* a shipment is flagged (e.g., origin port congestion, freight cost ratio, weight).
4. **Agentic Action Plan:** LLM (Google Gemini 2.5 Flash) generates concise, actionable mitigation steps (e.g., switch routes, buffer inventory by N days, contact alternative vendors).

**Unique Differentiator:**
- Focused on SMEs and mid-market exporters rather than enterprise conglomerates.
- Clean, intuitive dashboard interface + instant actionable insights.
- Frictionless workflow with single shipment prediction and drag-and-drop CSV bulk manifest scanning.

---

## 3. Dataset & Model Training Strategy

**Public Datasets Evaluated:**
1. **ISOMORPH** – Digital twin supply chain dataset (inventory, orders, disruptions).
2. **Supply Chain Data Hub** – Disruption monitoring and delivery delay datasets.
3. **World Bank Logistics Performance Indicators (LPI 2.0)** – International supply chain speed and reliability scores.
4. **USAID SCMS Delivery History Dataset** – **(Selected Primary Dataset)** Real-world historical logistics data with 10,000+ shipments.

**Selected Dataset (SCMS Delivery History):**
- **Input Features:** `Country`, `Managed By`, `Fulfill Via`, `Vendor INCO Term`, `Shipment Mode`, `Product Group`, `Sub Classification`, `Vendor`, `Weight`, `Freight Cost`, `Line Item Value`, `Line Item Quantity`, `Pack Price`, `planned_lead_time`, `freight_per_kg`, `value_per_unit`, `sched_month`, `sched_dayofweek`.
- **Target Variables:**
  - `delay_days` (Regression)
  - `risk_flag` (Binary Classification: On-Time vs Delayed)

---

## 4. Technology Stack

### Frontend
- **Framework:** Next.js 15 (React 19, TypeScript)
- **Styling & UI:** Tailwind CSS, Lucide Icons, Glassmorphism design system
- **Features:**
  - Single Shipment Predictor form with interactive sliders & dropdowns
  - Bulk CSV Upload Zone & Risk Heatmap
  - Interactive SHAP Feature Importance bar charts
  - Developer Mode Benchmark Inspector
- **Deployment:** Vercel

### Backend API
- **Framework:** FastAPI (Python 3.11)
- **ML / AI Libraries:** XGBoost, Scikit-Learn, SHAP, Google GenAI SDK (Gemini 2.5 Flash)
- **Endpoints:**
  - `GET /health` – Health check
  - `POST /predict` – Single shipment prediction + SHAP + Gemini + Supabase log
  - `POST /predict-bulk` – Bulk CSV batch prediction
  - `POST /feedback` – Ground truth outcome submission
  - `GET /api/dev/records` – Benchmark historical dataset inspection
- **Deployment:** Render / Railway

### Database & Storage
- **Database:** Supabase (PostgreSQL) for storing prediction logs and user feedback loop data.

---

## 5. System Architecture

```text
[Next.js Frontend @ Vercel]
        │
        │ (HTTP REST API Request)
        ▼
[FastAPI Backend @ Render]
        │
        ├──> [XGBoost ML Models] ──> Predict delay_days & risk_label
        ├──> [SHAP Explainer]   ──> Generate feature importance breakdown (%)
        ├──> [Google Gemini API] ──> Generate natural language Action Plan
        │
        ▼
[Response JSON] ──> Logged into Supabase PostgreSQL DB
```

---

## 6. Execution Roadmap & Hackathon Milestones

### Phase 1: Data & Model Training
- Clean SCMS dataset, encode categorical variables, and generate engineered features (`freight_per_kg`, `value_per_unit`, `planned_lead_time`).
- Train XGBoost regressor (`model_delay.json`) and XGBoost classifier (`model_risk.json`).
- Train SHAP TreeExplainer (`explainer.pkl`).

### Phase 2: Backend Development
- Build FastAPI routes for single prediction, bulk CSV upload, and developer dataset inspection.
- Integrate Google Gemini API for automated mitigation action plan generation.
- Connect Supabase client for prediction logging and feedback collection.

### Phase 3: Frontend Build & Polish
- Build responsive Next.js web application with modern dark-mode aesthetic.
- Implement single shipment form, SHAP charts, Gemini advice panel, and CSV bulk scanner.
- Add Developer Mode Easter Egg (`Ctrl+Shift+D` or 5 logo clicks) for inspecting all 2,908 historical benchmark records.

---

## 7. Business Value & Long-Term Potential

**Value for End Users:**
- Prevent severe financial losses from unexpected logistics disruptions.
- Enable proactive decision-making (advance ordering, route diversification, buffer inventory).
- Reduce operational uncertainty in international cross-border trade.

**Monetization Strategy:**
- **Freemium:** Free predictions for basic routes and low monthly volume.
- **SME Subscription:** Monthly B2B tier for unlimited predictions, real-time alerts, and bulk manifest scanning.
- **Enterprise / Custom API:** Dedicated integration with existing ERPs or TMS (Transportation Management Systems).

---

## 8. Pitch Narrative & Elevator Pitch

> "Every year, supply chain disruptions cost businesses billions of dollars in delayed shipments, stockouts, and halted production. While global conglomerates have expensive enterprise tools to monitor risk, millions of SMEs and exporters still rely on guesswork and manual spreadsheets.
> 
> We built **SupplyPulse** — an AI-powered early warning system that predicts delay days and disruption risks from logistics parameters, explains the exact risk drivers using Explainable AI (SHAP), and generates instant mitigation strategies powered by Gemini.
> 
> Designed specifically for SMEs, SupplyPulse makes enterprise-grade logistics intelligence accessible, fast, and actionable."