# Architecture Overview

## System Diagram

`
[Next.js Frontend @ Vercel]
        |
        | POST /predict        (single shipment JSON)
        | POST /predict-bulk   (CSV file upload)
        v
[FastAPI Backend @ Render]
        |
        |-- XGBoost Regressor  --> delay_days
        |-- XGBoost Classifier --> risk_level (High/Medium/Low)
        |-- SHAP Explainer     --> feature breakdown (%)
        |-- Gemini API         --> action_plan (text)
        v
[Supabase PostgreSQL]
        |-- feedback table
        |-- prediction_logs table
`

## Key Design Decisions

- **LLM as Narrator, not Predictor**: XGBoost owns all numeric predictions. Gemini only generates natural language recommendations from structured input. This eliminates hallucination risk for quantitative outputs.
- **SHAP for Trust**: Feature importance is shown to users so predictions are never a black box.
- **Bulk CSV First**: Primary UX is bulk manifest upload, not single-form input, because SMEs manage dozens of shipments simultaneously.
