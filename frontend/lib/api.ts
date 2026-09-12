// ═══════════════════════════════════════════════════════════════
//  API Client — Supply Chain Risk Predictor
//  Typed wrappers aligned 1:1 with backend Pydantic schemas
// ═══════════════════════════════════════════════════════════════

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://devpost-ai-builders-supply-chain.onrender.com"
).replace(/\/$/, "");

// ── Request Types ───────────────────────────────────────────────

export interface PredictionRequest {
  country: string;
  managed_by: string;
  fulfill_via: string;
  vendor_inco_term: string;
  shipment_mode: string;
  product_group: string;
  sub_classification: string;
  vendor: string;
  weight_kg: number;
  freight_cost_usd: number;
  line_item_value: number;
  line_item_quantity: number;
  pack_price: number;
  planned_lead_time: number;
  freight_per_kg: number;
  value_per_unit: number;
  sched_month: number;
  sched_dayofweek: number;
  model_name?: string;
}

// ── Response Types ──────────────────────────────────────────────

export interface ShapFeature {
  feature: string;
  contribution?: number;
  shap_value?: number;
}

export interface PredictionResponse {
  delay_days: number;
  risk_flag: number;
  risk_label: "Low Risk" | "High Risk";
  shap_top_features: ShapFeature[];
  action_plan: string;
  prediction_id?: string;  // Supabase prediction_logs row ID
}

export interface BulkRowResult {
  row: number;
  origin: string;
  destination: string;
  risk_level: "HIGH" | "LOW";
  delay_days: number;
  error?: string;
}

export interface BulkResponse {
  total: number;
  results: BulkRowResult[];
  summary: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface FeedbackRequest {
  prediction_id?: string;
  country: string;
  shipment_mode: string;
  vendor?: string;
  delay_days: number;
  risk_label: string;
  actual_was_delayed: boolean;
  actual_delay_days?: number;
  notes?: string;
  model_name?: string;
}

// ── API Functions ───────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const json = JSON.parse(body);
      detail = json.detail || json.message || body;
    } catch {
      /* use raw body */
    }
    throw new ApiError(detail, res.status);
  }
  return res.json();
}

/** Single shipment prediction — XGBoost + SHAP + Gemini */
export async function predict(
  data: PredictionRequest
): Promise<PredictionResponse> {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PredictionResponse>(res);
}

/** Bulk CSV/XLSX upload prediction */
export async function predictBulk(file: File): Promise<BulkResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/predict-bulk`, {
    method: "POST",
    body: form,
  });
  return handleResponse<BulkResponse>(res);
}

/** Submit ground-truth feedback for a prediction */
export async function submitFeedback(
  data: FeedbackRequest
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean }>(res);
}

/** Health check */
export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/health`);
  return handleResponse<{ status: string }>(res);
}

// ── Dev Benchmark Types & API ───────────────────────────────────

export interface GroundTruthData {
  scheduled_date: string;
  delivered_date: string;
  actual_delay_days: number;
  actual_risk_flag: number;
  actual_risk_label: string;
}

export interface DevRecordListItem {
  row_id: number;
  country: string;
  shipment_mode: string;
  vendor: string;
  scheduled_date: string;
  delivered_date: string;
  actual_delay_days: number;
  actual_risk_flag: number;
  actual_risk_label: string;
  weight_kg: number;
  freight_cost_usd: number;
}

export interface DevRecordsResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: DevRecordListItem[];
}

export interface DevRecordDetail {
  row_id: number;
  features: PredictionRequest;
  ground_truth: GroundTruthData;
}

export interface DevSummary {
  total_records: number;
  delayed_count: number;
  ontime_count: number;
  avg_delay_days: number;
  max_delay_days: number;
}

/** Fetch paginated benchmark records */
export async function fetchDevRecords(
  page: number = 1,
  limit: number = 20,
  filter: "all" | "delayed" | "ontime" = "all",
  search?: string
): Promise<DevRecordsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    filter,
  });
  if (search && search.trim()) {
    params.append("search", search.trim());
  }
  const res = await fetch(`${API_URL}/api/dev/records?${params.toString()}`);
  return handleResponse<DevRecordsResponse>(res);
}

/** Fetch a single benchmark record by row_id */
export async function fetchDevRecordById(rowId: number): Promise<DevRecordDetail> {
  const res = await fetch(`${API_URL}/api/dev/records/${rowId}`);
  return handleResponse<DevRecordDetail>(res);
}

/** Fetch benchmark statistics */
export async function fetchDevSummary(): Promise<DevSummary> {
  const res = await fetch(`${API_URL}/api/dev/summary`);
  return handleResponse<DevSummary>(res);
}