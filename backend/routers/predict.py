# POST /predict — single shipment prediction
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from backend.schemas.request import PredictionRequest
from backend.services.predictor import run_prediction

router = APIRouter()

@router.post("/predict-bulk")
async def predict_bulk(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Hanya format .csv atau .xlsx yang didukung")
    
    contents = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membaca file: {str(e)}")

    required_cols = [
        'country', 'managed_by', 'fulfill_via', 'vendor_inco_term', 
        'shipment_mode', 'product_group', 'sub_classification', 'vendor', 
        'weight_kg', 'freight_cost_usd', 'line_item_value', 'line_item_quantity', 
        'pack_price', 'planned_lead_time', 'freight_per_kg', 'value_per_unit', 
        'sched_month', 'sched_dayofweek'
    ]
    
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise HTTPException(status_code=400, detail=f"Kolom file kurang: {missing_cols}")

    # Batasi maksimal 200 baris per upload
    df = df.head(200)
    results = []
    high_count = 0
    low_count = 0

    for idx, row in df.iterrows():
        try:
            row_dict = row.to_dict()
            req_data = PredictionRequest(**row_dict)
            
            # Jalankan model XGBoost asli dari Phase 1
            pred_res = run_prediction(req_data)
            
            risk_label = pred_res.get("risk_label", "Low Risk")
            delay_days = pred_res.get("delay_days", 0.0)
            
            risk_str = "HIGH" if "High" in risk_label else "LOW"
            if risk_str == "HIGH":
                high_count += 1
            else:
                low_count += 1

            results.append({
                "row": idx + 1,
                "origin": row_dict.get('country', 'Unknown'),
                "destination": row_dict.get('country', 'Unknown'),
                "risk_level": risk_str,
                "delay_days": delay_days
            })
        except Exception as row_err:
            results.append({
                "row": idx + 1,
                "error": str(row_err)
            })

    return {
        "total": len(df),
        "results": results,
        "summary": {"high": high_count, "medium": 0, "low": low_count}
    }