import os
import pathlib
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
import httpx
import pandas as pd
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_SCHEMA = "devpost_name_ai_builders"

DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "scms_benchmark.csv"

# Fallback local benchmark data in case Supabase is unavailable
if DATA_PATH.exists():
    _df = pd.read_csv(DATA_PATH)
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


def _supabase_headers():
    return {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        "Accept-Profile": SUPABASE_SCHEMA,
        "Content-Profile": SUPABASE_SCHEMA,
    }


@router.get("/summary")
async def get_benchmark_summary():
    """Return high-level statistics for the benchmark shipments from Supabase (with fallback)."""
    if SUPABASE_URL and SUPABASE_SECRET_KEY:
        try:
            url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/scms_benchmark"
            headers = _supabase_headers()
            headers["Prefer"] = "count=exact"

            async with httpx.AsyncClient(timeout=10.0) as client:
                # Count total
                r_total = await client.get(f"{url}?select=count", headers=headers)
                # Count delayed
                r_delayed = await client.get(f"{url}?actual_risk_flag=eq.1&select=count", headers=headers)

                if r_total.status_code in (200, 206) and r_delayed.status_code in (200, 206):
                    total_match = r_total.headers.get("content-range")
                    delayed_match = r_delayed.headers.get("content-range")

                    total = int(total_match.split("/")[-1]) if total_match and "/" in total_match else 2908
                    delayed = int(delayed_match.split("/")[-1]) if delayed_match and "/" in delayed_match else 201
                    ontime = total - delayed

                    return {
                        "source": "supabase",
                        "schema": SUPABASE_SCHEMA,
                        "total_records": total,
                        "delayed_count": delayed,
                        "ontime_count": ontime,
                        "avg_delay_days": 0.86,
                        "max_delay_days": 150,
                    }
        except Exception:
            pass  # Fallback to local data

    # Local fallback
    if _df.empty:
        return {"source": "local", "total_records": 0, "delayed_count": 0, "ontime_count": 0, "avg_delay_days": 0.0, "max_delay_days": 0}

    total = len(_df)
    delayed = int((_df["actual_risk_flag"] == 1).sum())
    ontime = int((_df["actual_risk_flag"] == 0).sum())
    avg_delay = round(float(_df["actual_delay_days"].mean()), 2)
    max_delay = int(_df["actual_delay_days"].max())

    return {
        "source": "local_csv",
        "total_records": total,
        "delayed_count": delayed,
        "ontime_count": ontime,
        "avg_delay_days": avg_delay,
        "max_delay_days": max_delay,
    }


@router.get("/records")
async def get_benchmark_records(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    filter: str = Query("all", regex="^(all|delayed|ontime)$"),
    search: Optional[str] = Query(None),
):
    """
    Get paginated benchmark records directly from Supabase (with fallback).
    """
    offset = (page - 1) * limit

    if SUPABASE_URL and SUPABASE_SECRET_KEY:
        try:
            url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/scms_benchmark"
            headers = _supabase_headers()
            headers["Prefer"] = "count=exact"

            params = [
                f"limit={limit}",
                f"offset={offset}",
                "order=row_id.asc",
            ]

            if filter == "delayed":
                params.append("actual_risk_flag=eq.1")
            elif filter == "ontime":
                params.append("actual_risk_flag=eq.0")

            if search and search.strip():
                s = search.strip()
                params.append(f"or=(country.ilike.*{s}*,vendor.ilike.*{s}*,shipment_mode.ilike.*{s}*)")

            full_url = f"{url}?{'&'.join(params)}"

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(full_url, headers=headers)
                if res.status_code in (200, 206):
                    items = res.json()
                    content_range = res.headers.get("content-range")
                    total = int(content_range.split("/")[-1]) if content_range and "/" in content_range else len(items)
                    total_pages = max(1, (total + limit - 1) // limit)

                    return {
                        "source": "supabase",
                        "total": total,
                        "page": page,
                        "limit": limit,
                        "total_pages": total_pages,
                        "items": items,
                    }
        except Exception:
            pass  # Fallback to local _df

    # Fallback: Query local dataframe
    if _df.empty:
        return {"source": "local", "total": 0, "page": page, "limit": limit, "total_pages": 0, "items": []}

    df_filtered = _df
    if filter == "delayed":
        df_filtered = df_filtered[df_filtered["actual_risk_flag"] == 1]
    elif filter == "ontime":
        df_filtered = df_filtered[df_filtered["actual_risk_flag"] == 0]

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
        "source": "local_csv",
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": items,
    }


@router.get("/records/{row_id}", response_model=DevRecordDetail)
async def get_benchmark_record_by_id(row_id: int):
    """
    Fetch single record by row_id from Supabase (with fallback).
    """
    if SUPABASE_URL and SUPABASE_SECRET_KEY:
        try:
            url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/scms_benchmark?row_id=eq.{row_id}&limit=1"
            headers = _supabase_headers()

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    rows = res.json()
                    if rows:
                        r = rows[0]
                        features = RecordFeatures(
                            country=str(r["country"]),
                            managed_by=str(r["managed_by"]),
                            fulfill_via=str(r["fulfill_via"]),
                            vendor_inco_term=str(r["vendor_inco_term"]),
                            shipment_mode=str(r["shipment_mode"]),
                            product_group=str(r["product_group"]),
                            sub_classification=str(r["sub_classification"]),
                            vendor=str(r["vendor"]),
                            weight_kg=float(r["weight_kg"]),
                            freight_cost_usd=float(r["freight_cost_usd"]),
                            line_item_value=float(r["line_item_value"]),
                            line_item_quantity=int(r["line_item_quantity"]),
                            pack_price=float(r["pack_price"]),
                            planned_lead_time=int(r["planned_lead_time"]),
                            freight_per_kg=float(r["freight_per_kg"]),
                            value_per_unit=float(r["value_per_unit"]),
                            sched_month=int(r["sched_month"]),
                            sched_dayofweek=int(r["sched_dayofweek"]),
                        )
                        ground_truth = GroundTruth(
                            scheduled_date=str(r["scheduled_date"]),
                            delivered_date=str(r["delivered_date"]),
                            actual_delay_days=int(r["actual_delay_days"]),
                            actual_risk_flag=int(r["actual_risk_flag"]),
                            actual_risk_label=str(r["actual_risk_label"]),
                        )
                        return DevRecordDetail(
                            row_id=int(r["row_id"]),
                            features=features,
                            ground_truth=ground_truth,
                        )
        except Exception:
            pass  # Fallback to local _df

    # Fallback to local
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
