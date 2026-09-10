# POST /feedback — save user feedback to Supabase
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from supabase import create_client, Client

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

class FeedbackRequest(BaseModel):
    origin: str
    destination: str
    predicted_delay: float
    predicted_risk: str
    was_delayed: bool

@router.post("/feedback")
async def submit_feedback(data: FeedbackRequest):
    try:
        response = supabase.table("feedback").insert(data.dict()).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))