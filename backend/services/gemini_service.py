# backend/services/gemini_service.py
# Copy this file to: backend/services/gemini_service.py

import os
from google import genai
from google.genai import types

# ── Client (initialized once) ─────────────────────────────────────────────────
# Set GEMINI_API_KEY in your .env file
_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

MODEL_ID = "gemini-1.5-flash"


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
def generate_action_plan(prediction: dict) -> str:
    """
    Call Gemini to generate an action plan based on prediction results.

    Args:
        prediction: dict returned by run_prediction() — must contain
                    delay_days, risk_label, shap_top_features

    Returns:
        str: Gemini-generated action plan (plain text, numbered list)
    """
    prompt = _build_prompt(
        delay_days=prediction["delay_days"],
        risk_label=prediction["risk_label"],
        shap_top_features=prediction["shap_top_features"],
    )

    response = _client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,          # Low temp → consistent, factual output
            max_output_tokens=512,
        ),
    )

    return response.text.strip()
