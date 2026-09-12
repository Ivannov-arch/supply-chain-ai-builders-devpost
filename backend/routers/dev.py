import pathlib
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from pydantic import BaseModel

router = APIRouter()

DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "scms_benchmark.csv"

# Load benchmark data into memory once
if DATA_PATH.exists():
    _df = pd.read_csv(DATA_PATH)
    # Ensure row_id is int
    _df["row_id"] = _df["row_id"].astype(int)
else:
    _df = pd.DataFrame()


class GroundTruth(BaseModel):
    scheduled_date: str
    delivered_date: str
    actual_delay_days: int
    actual_risk_flag: int
    actual_risk_label: str


class RecordFeatures(BaseModel):
    country: str
    managed_by: str
    fulfill_via: str
    vendor_inco_term: str
    shipment_mode: str
    product_group: str
    sub_classification: str
    vendor: str
    weight_kg: float
    freight_cost_usd: float
    line_item_value: float
    line_item_quantity: int
    pack_price: float
    planned_lead_time: int
    freight_per_kg: float
    value_per_unit: float
    sched_month: int
    sched_dayofweek: int


class DevRecordDetail(BaseModel):
    row_id: int
    features: RecordFeatures
    ground_truth: GroundTruth


@router.get("/summary")
def get_benchmark_summary():
    """Return high-level statistics for the 2,908 benchmark shipments."""
    if _df.empty:
        return {"total_records": 0, "delayed_count": 0, "ontime_count": 0, "avg_delay_days": 0.0, "max_delay_days": 0}
    
    total = len(_df)
    delayed = int((_df["actual_risk_flag"] == 1).sum())
    ontime = int((_df["actual_risk_flag"] == 0).sum())
    avg_delay = round(float(_df["actual_delay_days"].mean()), 2)
    max_delay = int(_df["actual_delay_days"].max())

    return {
        "total_records": total,
        "delayed_count": delayed,
        "ontime_count": ontime,
        "avg_delay_days": avg_delay,
        "max_delay_days": max_delay,
    }


@router.get("/records")
def get_benchmark_records(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    filter: str = Query("all", regex="^(all|delayed|ontime)$"),
    search: Optional[str] = Query(None),
):
    """
    Get paginated benchmark records with optional filter and search.
    """
    if _df.empty:
        return {"total": 0, "page": page, "limit": limit, "total_pages": 0, "items": []}

    df_filtered = _df

    # Apply outcome filter
    if filter == "delayed":
        df_filtered = df_filtered[df_filtered["actual_risk_flag"] == 1]
    elif filter == "ontime":
        df_filtered = df_filtered[df_filtered["actual_risk_flag"] == 0]

    # Apply search (country, vendor, shipment mode)
    if search:
        s = search.strip().lower()
        match_mask = (
            df_filtered["country"].str.lower().str.contains(s, na=False)
            | df_filtered["vendor"].str.lower().str.contains(s, na=False)
            | df_filtered["shipment_mode"].str.lower().str.contains(s, na=False)
        )
        df_filtered = df_filtered[match_mask]

    total = len(df_filtered)
    total_pages = max(1, (total + limit - 1) // limit)
    offset = (page - 1) * limit

    paged = df_filtered.iloc[offset : offset + limit]

    items = []
    for _, row in paged.iterrows():
        items.append({
            "row_id": int(row["row_id"]),
            "country": str(row["country"]),
            "shipment_mode": str(row["shipment_mode"]),
            "vendor": str(row["vendor"]),
            "scheduled_date": str(row["scheduled_date"]),
            "delivered_date": str(row["delivered_date"]),
            "actual_delay_days": int(row["actual_delay_days"]),
            "actual_risk_flag": int(row["actual_risk_flag"]),
            "actual_risk_label": str(row["actual_risk_label"]),
            "weight_kg": float(row["weight_kg"]),
            "freight_cost_usd": float(row["freight_cost_usd"]),
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items,
    }


@router.get("/records/{row_id}", response_model=DevRecordDetail)
def get_benchmark_record_by_id(row_id: int):
    """
    Fetch a single record by row_id (1-indexed) with full features and ground truth.
    """
    if _df.empty:
        raise HTTPException(status_code=404, detail="Benchmark dataset is empty")

    matches = _df[_df["row_id"] == row_id]
    if matches.empty:
        raise HTTPException(status_code=404, detail=f"Record with row_id {row_id} not found")

    row = matches.iloc[0]

    features = RecordFeatures(
        country=str(row["country"]),
        managed_by=str(row["managed_by"]),
        fulfill_via=str(row["fulfill_via"]),
        vendor_inco_term=str(row["vendor_inco_term"]),
        shipment_mode=str(row["shipment_mode"]),
        product_group=str(row["product_group"]),
        sub_classification=str(row["sub_classification"]),
        vendor=str(row["vendor"]),
        weight_kg=float(row["weight_kg"]),
        freight_cost_usd=float(row["freight_cost_usd"]),
        line_item_value=float(row["line_item_value"]),
        line_item_quantity=int(row["line_item_quantity"]),
        pack_price=float(row["pack_price"]),
        planned_lead_time=int(row["planned_lead_time"]),
        freight_per_kg=float(row["freight_per_kg"]),
        value_per_unit=float(row["value_per_unit"]),
        sched_month=int(row["sched_month"]),
        sched_dayofweek=int(row["sched_dayofweek"]),
    )

    ground_truth = GroundTruth(
        scheduled_date=str(row["scheduled_date"]),
        delivered_date=str(row["delivered_date"]),
        actual_delay_days=int(row["actual_delay_days"]),
        actual_risk_flag=int(row["actual_risk_flag"]),
        actual_risk_label=str(row["actual_risk_label"]),
    )

    return DevRecordDetail(
        row_id=int(row["row_id"]),
        features=features,
        ground_truth=ground_truth,
    )
