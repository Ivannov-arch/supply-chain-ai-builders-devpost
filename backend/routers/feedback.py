# POST /feedback — save user feedback to Supabase (via REST API)
# Columns aligned 1:1 with Supabase 'feedback' table schema
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import httpx
from dotenv import load_dotenv

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(base_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")


class FeedbackRequest(BaseModel):
    """Aligned 1:1 with Supabase 'feedback' table columns."""
    prediction_id: Optional[str] = None
    country: str
    shipment_mode: str
    vendor: Optional[str] = None
    delay_days: float
    risk_label: str
    actual_was_delayed: bool
    actual_delay_days: Optional[float] = None
    notes: Optional[str] = None
    model_name: Optional[str] = None


@router.post("/feedback")
async def submit_feedback(data: FeedbackRequest):
    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Konfigurasi Supabase tidak lengkap di .env"
        )

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/feedback"
    headers = {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        "Content-Type": "application/json",
        "Content-Profile": "devpost_name_ai_builders",
        "Prefer": "return=minimal",
    }

    # Build payload — only include non-None fields
    payload = {k: v for k, v in data.dict().items() if v is not None}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()

        return {"success": True}
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Supabase error: {e.response.text}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))