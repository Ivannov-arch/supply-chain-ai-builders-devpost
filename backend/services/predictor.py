import json
import pickle
import pathlib
import numpy as np
import xgboost as xgb
from backend.schemas.request import PredictionRequest

# ── Paths ──────────────────────────────────────────────────────────────────────
MODELS_DIR = pathlib.Path(__file__).parent.parent / "models"

# ── Load artifacts (runs once at import time) ──────────────────────────────────
with open(MODELS_DIR / "feature_columns.json") as f:
    _fc = json.load(f)                           # dict with feature_cols, categorical_cols, etc.
    FEATURE_COLUMNS: list[str] = _fc["feature_cols"]   # ordered list matching training
    OPTIMAL_THRESHOLD: float = _fc["optimal_threshold"]

# with open(MODELS_DIR / "encoder_classes.json") as f:
#     ENCODER_CLASSES: dict[str, list] = json.load(f)

with open(MODELS_DIR / "label_encoders.pkl", "rb") as f:
    LABEL_ENCODERS: dict = pickle.load(f)

MODEL_DELAY = xgb.XGBRegressor()
MODEL_DELAY.load_model(str(MODELS_DIR / "model_delay.json"))

MODEL_RISK = xgb.XGBClassifier()
MODEL_RISK.load_model(str(MODELS_DIR / "model_risk.json"))

with open(MODELS_DIR / "explainer.pkl", "rb") as f:
    EXPLAINER = pickle.load(f)

# Map: schema field name (snake_case) → original training column name
# MUST match keys in feature_columns.json exactly (case-sensitive)
FIELD_MAP: dict[str, str] = {
    "country":           "Country",
    "managed_by":        "Managed By",
    "fulfill_via":       "Fulfill Via",
    "vendor_inco_term":  "Vendor INCO Term",
    "shipment_mode":     "Shipment Mode",
    "product_group":     "Product Group",
    "sub_classification":"Sub Classification",
    "vendor":            "Vendor",
    "weight_kg":         "Weight (Kilograms)",
    "freight_cost_usd":  "Freight Cost (USD)",
    "line_item_value":   "Line Item Value",
    "line_item_quantity":"Line Item Quantity",
    "pack_price":        "Pack Price",
    # Engineered features — names match training directly
    "planned_lead_time": "planned_lead_time",
    "freight_per_kg":    "freight_per_kg",
    "value_per_unit":    "value_per_unit",
    "sched_month":       "sched_month",
    "sched_dayofweek":   "sched_dayofweek",
}

# Categorical columns using original column names (keys in LABEL_ENCODERS)
CATEGORICAL_COLS = [
    "Country",
    "Managed By",
    "Fulfill Via",
    "Vendor INCO Term",
    "Shipment Mode",
    "Product Group",
    "Sub Classification",
    "Vendor",
]

# ── Helper: build feature array ────────────────────────────────────────────────
def _encode_input(data: PredictionRequest) -> np.ndarray:
    """Convert a PredictionRequest into a 1-row numpy array ordered by FEATURE_COLUMNS."""
    raw_schema = data.model_dump()  # keys: snake_case (e.g. "country", "weight_kg")

    # Remap to original column names used during training (ignore extra non-feature fields like model_name)
    raw: dict = {FIELD_MAP[k]: v for k, v in raw_schema.items() if k in FIELD_MAP}

    # Label-encode categorical fields (in-place)
    for col in CATEGORICAL_COLS:
        encoder = LABEL_ENCODERS[col]
        value = raw[col]
        if value in encoder.classes_:
            raw[col] = int(encoder.transform([value])[0])  # ← [0] inside int()
        else:
            raw[col] = -1  # Unseen category → unknown

    row = [raw[col] for col in FEATURE_COLUMNS]
    return np.array([row], dtype=float)

# ── Helper: extract top SHAP features ─────────────────────────────────────────
def _top_shap_features(X: np.ndarray, n: int = 5) -> list[dict]:
    """Return the top-n SHAP features (by absolute value) for the delay model."""
    shap_values = EXPLAINER.shap_values(X)  # shape: (1, n_features)
    contributions = shap_values[0]          # 1D array, one value per feature
    
    indices = np.argsort(np.abs(contributions))[::-1][:n]
    return [
        {
            "feature": FEATURE_COLUMNS[i],
            "shap_value": round(float(contributions[i]), 4),
        }
        for i in indices
    ]

# ── Main inference function ────────────────────────────────────────────────────
def run_prediction(data: PredictionRequest) -> dict:
    """
    Run full inference pipeline.
    Returns:
        dict with keys: delay_days, risk_flag, risk_label, shap_top_features
        (action_plan is added later by the Gemini service)
    """

    X = _encode_input(data)

    delay_days = float(MODEL_DELAY.predict(X)[0])
    prob = MODEL_RISK.predict_proba(X)[0][1]
    risk_flag = int(prob >= OPTIMAL_THRESHOLD)
    risk_label = "High Risk" if risk_flag == 1 else "Low Risk"
    shap_features = _top_shap_features(X)

    return {
        "delay_days": round(delay_days, 2),
        "risk_flag": risk_flag,
        "risk_label": risk_label,
        "shap_top_features": shap_features,
    }