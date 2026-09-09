# backend/services/gemini_service.py

import os
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

# Try loading .env from backend/.env or root .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()  # Fallback to current working directory

api_key = os.environ.get("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

DEFAULT_MODEL_ID = "gemini-3.6-flash"


# ── Prompt builder ────────────────────────────────────────────────────────────
def _build_prompt(
    delay_days: float,
    risk_label: str,
    shap_top_features: list[dict],
) -> str:
    """Construct a concise prompt for Gemini from prediction outputs."""

    features_text = "\n".join(
        f"  - {f['feature']}: SHAP value {f['shap_value']:+.4f}"
        for f in shap_top_features
    )

    return f"""You are a supply chain risk analyst.

A shipment has been analyzed with the following prediction results:
- Predicted delay: {delay_days:.1f} days
- Risk level: {risk_label}

The top contributing factors (SHAP values indicate direction and magnitude):
{features_text}

Based on this analysis, provide exactly 3 concise, actionable recommendations
to reduce the delay risk. Format your response as a numbered list (1. 2. 3.).
Keep each recommendation to 1-2 sentences. Be specific to supply chain logistics.
Do not repeat the input data back."""


# ── Main function ─────────────────────────────────────────────────────────────
def generate_action_plan(prediction: dict, model_name: str | None = None) -> str:
    """
    Call Gemini to generate an action plan based on prediction results.

    Args:
        prediction: dict returned by run_prediction() — must contain
                    delay_days, risk_label, shap_top_features
        model_name: Optional Gemini model ID (defaults to DEFAULT_MODEL_ID)

    Returns:
        str: Gemini-generated action plan (plain text, numbered list)
    """
    if not os.environ.get("GEMINI_API_KEY"):
        return "Gemini API key is not configured. Please set GEMINI_API_KEY in .env."

    target_model = model_name or DEFAULT_MODEL_ID

    prompt = _build_prompt(
        delay_days=prediction["delay_days"],
        risk_label=prediction["risk_label"],
        shap_top_features=prediction["shap_top_features"],
    )

    model = genai.GenerativeModel(
        model_name=target_model,
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            max_output_tokens=512,
        ),
    )

    response = model.generate_content(prompt)
    return response.text.strip()
