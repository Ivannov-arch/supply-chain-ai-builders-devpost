# SupplyPulse AI — Pitch Deck (Lite Version)
> **Compact & High-Impact Slide Deck (10 Slides)**  
> *Engineered for visual clarity, minimal text density, and maximum audience engagement.*

---

# SLIDE 1: Title & Hook
## **SupplyPulse AI**
### Stop Multi-Million Dollar Supply Chain Delays *Before* Cargo Leaves the Port.

* **What it is:** The first accessible, Explainable AI early-warning system for cross-border logistics.
* **Core Tech:** Next.js 15 • FastAPI • Dual XGBoost • TreeSHAP • Google Gemini 3.6 Flash • Supabase
* **Team:** Tatang Ivannov Kennedy & AI Builders Team
* **Live System:** `github.com/Ivannov-arch/supply-chain-devpost`

---

# SLIDE 2: The Problem (Marcus's Story)
### Marcus Trusted the Tracking Portal... Until It Was Too Late.

* **The Incident:** Marcus imported a **$120,000** batch of essential medical supplies to Lagos.
* **The Blindspot:** Tracking said *"On Track"* — until an unpredicted 14-day port and customs bottleneck hit.
* **The Cost:** Cargo spoiled • **$28,000 contract penalty** • Lost his #1 enterprise client.

> **The Macro Reality:** **$1.6 Trillion** lost annually worldwide.  
> **90% of operators** are SMEs flying blind with static Excel sheets and gut instinct.

---

# SLIDE 3: Why Existing Solutions Fail
### Three Fatal Flaws in Modern Logistics

1. **The Enterprise Paywall ($100k+):**  
   Project44 & FourKites require 6-month ERP integrations. SMEs are priced out.
2. **The Black-Box Fallacy:**  
   Opaque AI alerts (*"Delay: 5 Days"*) give zero reasons. Logistics managers won't risk capital on blind guesses.
3. **The AI Disconnect:**  
   *Pure LLMs* hallucinate numbers. *Classical ML* gives cold numbers with zero actionable advice.

---

# SLIDE 4: The Solution
### The SupplyPulse AI Triad: Predict • Explain • Prescribe

```
[ 1. PREDICT (XGBoost) ] ──> [ 2. EXPLAIN (TreeSHAP) ] ──> [ 3. PRESCRIBE (Gemini 3.6) ]
  • Exact delay in days        • Mathematical feature %       • 3 tactical action steps
  • High/Low risk flag           attribution (0% black box)     to mitigate disruptions
```

* **Real-World Grounding:** Trained on **10,000+ real international shipments** (USAID SCMS Dataset).
* **Zero Setup:** Instant single-shipment query or bulk CSV manifest scan in seconds.

---

# SLIDE 5: Target Users
### Empowering the Overlooked 90% of Global Trade

| User Segment | Core Pain Point | How SupplyPulse AI Solves It |
| :--- | :--- | :--- |
| **SME Exporters / Importers** | Stockouts & SLA penalty risks | 2–4 week early warning to adjust safety buffers. |
| **Mid-Tier Freight Forwarders** | Client churn from surprise delays | Instant risk scoring to advise routes & defend margins. |
| **Procurement Teams** | Vulnerable Incoterms (`EXW` vs `DDU`) | Data-driven vendor and fulfillment reliability audits. |

---

# SLIDE 6: Key Features
### From Shipping Manifest to Action Plan in < 3 Seconds

* **1. Single Consignment Radar:** Real-time delay forecast (days) and High/Low risk badges.
* **2. Bulk Manifest Scanner (`/predict-bulk`):** Drag-and-drop 200+ row CSV/Excel manifest for instant risk heatmap.
* **3. Mathematical XAI (SHAP):** Transparent breakdown of top risk drivers (Freight cost, Incoterm, weight).
* **4. Agentic Gemini Action Playbook:** 3 immediate, contextual mitigation steps tailored to the cargo.
* **5. Closed-Loop Feedback (`/feedback`):** One-click actual outcome logging to Supabase for continuous retraining.

---

# SLIDE 7: Technical Architecture
### Lightweight, Fast, and Hallucination-Free

```
[Next.js 15 UI] ──(JSON / Bulk CSV)──> [FastAPI Gateway]
                                              │
              ┌───────────────────────────────┴───────────────────────────────┐
              ▼                               ▼                               ▼
     [ XGBoost Regressor ]           [ XGBoost Classifier ]          [ SHAP TreeExplainer ]
     • Forecasts: delay_days         • Classifies: High/Low Risk     • Computes: % Driver Impact
              │                               │                               │
              └───────────────────────────────┬───────────────────────────────┘
                                              ▼
                             [ Google Gemini 3.6 Flash Agent ]
                             • Translates data into 3 mitigation steps
                                              │
                                              ▼
                             [ Supabase: Feedback & Audit Logs ]
```

---

# SLIDE 8: AI Stack & Validated Metrics
### Hybrid AI: Quantitative Precision + Generative Action

| Component | Technology | Benchmark / Target | **Achieved Metric** |
| :--- | :--- | :--- | :--- |
| **Delay Forecast** | XGBoost Regressor | MAE < 5.0 days | **3.57 Days (PASSED)** |
| **Risk Classification**| XGBoost Classifier | Accuracy > 70% | **91.6% (PASSED)** |
| **Delay Recall** | XGBoost (Threshold 0.51) | Sensitivity > 60% | **72.5% (PASSED)** |
| **Explainability** | TreeSHAP Explainer | Transparent attribution | **100% Auditable** |
| **Action Planning** | Google Gemini 3.6 Flash | Tactical recommendations | **< 1s Latency** |

---

# SLIDE 9: Impact & Value Proposition
### Transforming Guesswork into Measurable ROI

| Dimension | Manual Spreadsheets | Enterprise Platforms | **SupplyPulse AI** |
| :--- | :--- | :--- | :--- |
| **Cost** | Hidden ($28k+ failure) | $100,000+/yr | **Freemium / $49-$199/mo** |
| **Onboarding** | Manual Excel | 3–6 Months ERP setup | **Instant (Zero Integration)** |
| **Explainability** | Zero | Black-box score | **100% Transparent SHAP** |
| **Actionability** | Panic firefighting | Raw tracking pings | **Gemini Mitigation Playbook** |

> 💰 **Direct ROI:** Eliminating a 4-day port container hold saves up to **$1,600/container** in demurrage fees.

---

# SLIDE 10: Future Roadmap & Vision
### The Journey from Predictive Alerting to Autonomous Logistics

* **Phase 1 (Completed ✅):** Real SCMS ML models • SHAP XAI • Gemini Playbooks • Supabase feedback loop.
* **Phase 2 (Next 30 Days):** Live weather telematics (Open-Meteo API) + port congestion satellite AIS data.
* **Phase 3 (90 Days):** Multi-agent carrier rerouting & automated alternative freight quoting.
* **Phase 4 (Horizon):** Native ERP/Shopify webhooks + parametric delay micro-insurance.

---

### **Never Fly Blind into Port Delays Again.**
* **Demo:** `supplypulse-ai.vercel.app`
* **Repo:** `github.com/Ivannov-arch/supply-chain-devpost`
* **Pitch Line:** *"Predicting a delay is useful. Knowing why and how to fix it is everything."*
