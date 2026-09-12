from dotenv import load_dotenv
load_dotenv()  # Must be first — loads .env before any service imports read os.environ

import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas.request import PredictionRequest, PredictionResponse
from backend.services.predictor import run_prediction
from backend.services.gemini_service import generate_action_plan

from backend.routers import predict as predict_router, feedback, dev as dev_router

app = FastAPI(
    title="Supply Chain Risk API",
    description="Customs delay prediction using XGBoost + SHAP + Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Supabase config for prediction logging ──────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")


async def _log_prediction(input_data: PredictionRequest, result: dict):
    """Log prediction to Supabase 'prediction_logs' table (fire-and-forget)."""
    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        return  # Skip silently if not configured

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/prediction_logs"
    headers = {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        "Content-Type": "application/json",
        "Content-Profile": "devpost_name_ai_builders",
        "Prefer": "return=representation",
    }

    # Build payload aligned 1:1 with prediction_logs table columns
    payload = {
        # Input features
        "country": input_data.country,
        "managed_by": input_data.managed_by,
        "fulfill_via": input_data.fulfill_via,
        "vendor_inco_term": input_data.vendor_inco_term,
        "shipment_mode": input_data.shipment_mode,
        "product_group": input_data.product_group,
        "sub_classification": input_data.sub_classification,
        "vendor": input_data.vendor,
        "weight_kg": input_data.weight_kg,
        "freight_cost_usd": input_data.freight_cost_usd,
        "line_item_value": input_data.line_item_value,
        "line_item_quantity": input_data.line_item_quantity,
        "pack_price": input_data.pack_price,
        "planned_lead_time": input_data.planned_lead_time,
        "freight_per_kg": input_data.freight_per_kg,
        "value_per_unit": input_data.value_per_unit,
        "sched_month": input_data.sched_month,
        "sched_dayofweek": input_data.sched_dayofweek,
        # Prediction results
        "delay_days": result.get("delay_days"),
        "risk_flag": result.get("risk_flag"),
        "risk_label": result.get("risk_label"),
        "shap_top_features": json.dumps(result.get("shap_top_features", [])),
        "action_plan": result.get("action_plan"),
        "model_name": getattr(input_data, "model_name", None),
        "source": "web",
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            # Return the created row's id for linking feedback
            rows = resp.json()
            if isinstance(rows, list) and len(rows) > 0:
                return rows[0].get("id")
    except Exception:
        pass  # Don't break prediction if logging fails
    return None


@app.get("/", tags=["Health"])
@app.head("/", tags=["Health"])
def root():
    return {
        "status": "healthy",
        "service": "SupplyPulse AI API",
        "version": "1.0.0",
        "uptime": "active",
    }


@app.get("/health", tags=["Health"])
@app.head("/health", tags=["Health"])
def health():
    return {"status": "ok"}

app.include_router(predict_router.router)
app.include_router(feedback.router)
app.include_router(dev_router.router, prefix="/api/dev", tags=["Developer"])


@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionRequest):
    """
    Run full inference pipeline:
    1. Encode input features
    2. Predict delay_days (XGBRegressor) + risk_flag (XGBClassifier)
    3. Compute SHAP feature contributions
    4. Generate action plan via Gemini
    5. Log to Supabase prediction_logs
    """
    try:
        # Steps 1-3: ML inference
        result = run_prediction(data)

        # Step 4: Gemini action plan (with optional model selection)
        result["action_plan"] = generate_action_plan(result, model_name=getattr(data, "model_name", None))

        # Step 5: Log prediction to Supabase (fire-and-forget)
        prediction_id = await _log_prediction(data, result)
        if prediction_id:
            result["prediction_id"] = prediction_id

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
