from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas.request import PredictionRequest, PredictionResponse
from backend.services.predictor import run_prediction
from backend.services.gemini_service import generate_action_plan

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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    """
    Run full inference pipeline:
    1. Encode input features
    2. Predict delay_days (XGBRegressor) + risk_flag (XGBClassifier)
    3. Compute SHAP feature contributions
    4. Generate action plan via Gemini
    """
    try:
        # Steps 1-3: ML inference
        result = run_prediction(data)

        # Step 4: Gemini action plan
        result["action_plan"] = generate_action_plan(result)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
