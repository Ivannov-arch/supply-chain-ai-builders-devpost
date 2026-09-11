# Pydantic request/response schemas
from pydantic import BaseModel, Field
from typing import Literal


class PredictionRequest(BaseModel):
    """Input schema for the SCMS delay prediction endpoint."""

    # --- Categorical Features ---
    country: str = Field(..., description="Destination country")
    managed_by: str = Field(..., description="Managing office")
    fulfill_via: str = Field(..., description="Fulfillment method")
    vendor_inco_term: str = Field(..., description="Incoterm agreed with vendor")
    shipment_mode: str = Field(..., description="Mode of shipment (Air/Sea/Truck/Air Charter)")
    product_group: str = Field(..., description="Product category group")
    sub_classification: str = Field(..., description="Product sub-classification")
    vendor: str = Field(..., description="Vendor/supplier name")

    # --- Numeric Features ---
    weight_kg: float = Field(..., gt=0, description="Shipment weight in kilograms")
    freight_cost_usd: float = Field(..., ge=0, description="Freight cost in USD")
    line_item_value: float = Field(..., ge=0, description="Total value of the line item")
    line_item_quantity: int = Field(..., gt=0, description="Number of units ordered")
    pack_price: float = Field(..., ge=0, description="Price per pack")
    planned_lead_time: int = Field(..., ge=0, description="Planned lead time in days")

    # --- Engineered Features ---
    freight_per_kg: float = Field(..., ge=0, description="Freight cost divided by weight (freight_cost_usd / weight_kg)")
    value_per_unit: float = Field(..., ge=0, description="Line item value divided by quantity (line_item_value / line_item_quantity)")
    sched_month: int = Field(..., ge=1, le=12, description="Scheduled delivery month (1-12)")
    sched_dayofweek: int = Field(..., ge=0, le=6, description="Scheduled delivery day of week (0=Mon, 6=Sun)")

    # --- AI Model Config ---
    model_name: str | None = Field(default="gemini-3.6-flash", description="Optional Gemini model ID (e.g., gemini-3.5-flash, gemini-3.6-flash)")

    # Pydantic v2: replaces deprecated `class Config`
    model_config = {
        "json_schema_extra": {
            "example": {
                "country": "Nigeria",
                "managed_by": "PMO - US",
                "fulfill_via": "Direct Drop",
                "vendor_inco_term": "EXW",
                "shipment_mode": "Air",
                "product_group": "ARV",
                "sub_classification": "Adult",
                "vendor": "Aurobindo Pharma Limited",
                "weight_kg": 500.0,
                "freight_cost_usd": 12000.0,
                "line_item_value": 45000.0,
                "line_item_quantity": 10000,
                "pack_price": 4.5,
                "planned_lead_time": 30,
                "freight_per_kg": 24.0,
                "value_per_unit": 4.5,
                "sched_month": 6,
                "sched_dayofweek": 2,
            }
        }
    }


class PredictionResponse(BaseModel):
    """Output schema returned by the prediction endpoint."""

    delay_days: float = Field(..., description="Predicted number of delay days")
    risk_flag: int = Field(..., description="Risk classification: 0 = Low, 1 = High")
    risk_label: Literal["Low Risk", "High Risk"] = Field(..., description="Human-readable risk label")
    shap_top_features: list[dict] = Field(
        ...,
        description="Top SHAP feature contributions driving the prediction",
    )
    action_plan: str = Field(..., description="AI-generated action plan from Gemini")
    prediction_id: str | None = Field(default=None, description="Supabase prediction_logs row ID (for feedback linking)")

