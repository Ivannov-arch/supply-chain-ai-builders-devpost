"use client";

import { useState } from "react";
import {
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  Package,
  DollarSign,
  Calendar,
  Settings2,
} from "lucide-react";
import { predict, type PredictionRequest, type PredictionResponse } from "@/lib/api";
import RiskCard from "@/components/RiskCard";
import ShapBreakdown from "@/components/ShapBreakdown";
import ActionPlan from "@/components/ActionPlan";
import FeedbackButton from "@/components/FeedbackButton";

// ── Dropdown options (aligned with SCMS dataset values) ─────────
const COUNTRIES = [
  "Nigeria", "South Africa", "Côte d'Ivoire", "Uganda", "Vietnam",
  "Haiti", "Tanzania", "Zambia", "Kenya", "Rwanda", "Mozambique",
  "Ethiopia", "Zimbabwe", "Guyana", "Dominican Republic", "Cameroon",
  "Congo, DRC", "Botswana", "Ghana", "Namibia", "Burundi",
  "Swaziland", "Malawi", "Lesotho", "South Sudan", "Liberia",
  "Guatemala", "Sierra Leone", "Mali", "Senegal", "Benin",
  "Togo", "Chad", "Niger", "Angola", "Pakistan", "India",
  "Afghanistan", "Myanmar", "Papua New Guinea", "Indonesia",
];

const MANAGED_BY = ["PMO - US", "PMO - US/DC"];
const FULFILL_VIA = ["Direct Drop", "From RDC"];
const VENDOR_INCO_TERMS = ["EXW", "FCA", "CIP", "DDP", "DAP", "CIF", "DDU", "N/A - DDU"];
const SHIPMENT_MODES = ["Air", "Ocean", "Truck", "Air Charter"];
const PRODUCT_GROUPS = ["ARV", "HRDT", "ANTM", "ACT", "MRDT", "HIV test"];
const SUB_CLASSIFICATIONS = ["Adult", "Pediatric", "HIV test - Loss/Gain", "ACT", "Malaria"];

const DAYS_OF_WEEK = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Section Collapsible ─────────────────────────────────────────
function FormSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(212,165,116,0.15)",
        background: "rgba(255,255,255,0.5)",
        overflow: "hidden",
        marginBottom: "1rem",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1.25rem",
          background: open
            ? "linear-gradient(135deg, rgba(238,242,255,0.4), rgba(245,230,211,0.2))"
            : "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Icon size={16} color="#4338CA" />
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#1E1B4B",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp size={16} color="#9CA3AF" />
        ) : (
          <ChevronDown size={16} color="#9CA3AF" />
        )}
      </button>

      {open && (
        <div
          style={{
            padding: "1rem 1.25rem 1.25rem",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Single Prediction Page
// ═══════════════════════════════════════════════════════════════

export default function PredictPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    country: "Nigeria",
    managed_by: "PMO - US",
    fulfill_via: "Direct Drop",
    vendor_inco_term: "EXW",
    shipment_mode: "Air",
    product_group: "ARV",
    sub_classification: "Adult",
    vendor: "Aurobindo Pharma Limited",
    weight_kg: 500,
    freight_cost_usd: 12000,
    line_item_value: 45000,
    line_item_quantity: 10000,
    pack_price: 4.5,
    planned_lead_time: 30,
    freight_per_kg: 24,
    value_per_unit: 4.5,
    sched_month: 6,
    sched_dayofweek: 2,
  });

  const updateField = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-compute engineered features when dependencies change
  const autoCompute = () => {
    const fk =
      form.weight_kg > 0
        ? Math.round((form.freight_cost_usd / form.weight_kg) * 100) / 100
        : 0;
    const vu =
      form.line_item_quantity > 0
        ? Math.round((form.line_item_value / form.line_item_quantity) * 100) / 100
        : 0;
    setForm((prev) => ({
      ...prev,
      freight_per_kg: fk,
      value_per_unit: vu,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: PredictionRequest = {
        ...form,
        weight_kg: Number(form.weight_kg),
        freight_cost_usd: Number(form.freight_cost_usd),
        line_item_value: Number(form.line_item_value),
        line_item_quantity: Number(form.line_item_quantity),
        pack_price: Number(form.pack_price),
        planned_lead_time: Number(form.planned_lead_time),
        freight_per_kg: Number(form.freight_per_kg),
        value_per_unit: Number(form.value_per_unit),
        sched_month: Number(form.sched_month),
        sched_dayofweek: Number(form.sched_dayofweek),
      };

      const data = await predict(payload);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        paddingTop: 88,
        paddingBottom: "4rem",
        minHeight: "100vh",
      }}
    >
      <div className="section-container">
        {/* Page header */}
        <div
          className="animate-in"
          style={{ marginBottom: "2rem" }}
        >
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 800,
              color: "#1E1B4B",
              marginBottom: "0.35rem",
            }}
          >
            Single Shipment
            <span
              style={{
                background:
                  "linear-gradient(135deg, #4338CA, #818CF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              Prediction
            </span>
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#6B7280",
              maxWidth: 520,
              margin: 0,
            }}
          >
            Fill in your shipment details below to get AI-powered risk analysis,
            SHAP feature importance, and an actionable mitigation plan.
          </p>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: result ? "1fr 1fr" : "1fr",
            gap: "2rem",
            alignItems: "start",
          }}
          className="predict-grid"
        >
          {/* ── Left: Form ─────────────────────────────────────── */}
          <div className="animate-in animate-delay-1">
            <div
              className="glass-card"
              style={{ padding: "1.5rem", overflow: "hidden" }}
            >
              {/* Logistics */}
              <FormSection title="Logistics & Routing" icon={MapPin}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <label className="input-label">Country</label>
                    <select
                      className="select-field"
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Managed By</label>
                    <select
                      className="select-field"
                      value={form.managed_by}
                      onChange={(e) => updateField("managed_by", e.target.value)}
                    >
                      {MANAGED_BY.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Fulfillment</label>
                    <select
                      className="select-field"
                      value={form.fulfill_via}
                      onChange={(e) => updateField("fulfill_via", e.target.value)}
                    >
                      {FULFILL_VIA.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Vendor Incoterm</label>
                    <select
                      className="select-field"
                      value={form.vendor_inco_term}
                      onChange={(e) =>
                        updateField("vendor_inco_term", e.target.value)
                      }
                    >
                      {VENDOR_INCO_TERMS.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </FormSection>

              {/* Shipment */}
              <FormSection title="Shipment Details" icon={Truck}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <label className="input-label">Shipment Mode</label>
                    <select
                      className="select-field"
                      value={form.shipment_mode}
                      onChange={(e) =>
                        updateField("shipment_mode", e.target.value)
                      }
                    >
                      {SHIPMENT_MODES.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Product Group</label>
                    <select
                      className="select-field"
                      value={form.product_group}
                      onChange={(e) =>
                        updateField("product_group", e.target.value)
                      }
                    >
                      {PRODUCT_GROUPS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Sub Classification</label>
                    <select
                      className="select-field"
                      value={form.sub_classification}
                      onChange={(e) =>
                        updateField("sub_classification", e.target.value)
                      }
                    >
                      {SUB_CLASSIFICATIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Vendor</label>
                    <input
                      className="input-field"
                      value={form.vendor}
                      onChange={(e) => updateField("vendor", e.target.value)}
                      placeholder="Vendor name"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Financial */}
              <FormSection title="Financial & Weight" icon={DollarSign}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <label className="input-label">Weight (kg)</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0.1}
                      step="any"
                      value={form.weight_kg}
                      onChange={(e) =>
                        updateField("weight_kg", parseFloat(e.target.value) || 0)
                      }
                      onBlur={autoCompute}
                    />
                  </div>
                  <div>
                    <label className="input-label">Freight Cost (USD)</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      step="any"
                      value={form.freight_cost_usd}
                      onChange={(e) =>
                        updateField(
                          "freight_cost_usd",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      onBlur={autoCompute}
                    />
                  </div>
                  <div>
                    <label className="input-label">Line Item Value</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      step="any"
                      value={form.line_item_value}
                      onChange={(e) =>
                        updateField(
                          "line_item_value",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      onBlur={autoCompute}
                    />
                  </div>
                  <div>
                    <label className="input-label">Quantity</label>
                    <input
                      className="input-field"
                      type="number"
                      min={1}
                      value={form.line_item_quantity}
                      onChange={(e) =>
                        updateField(
                          "line_item_quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      onBlur={autoCompute}
                    />
                  </div>
                  <div>
                    <label className="input-label">Pack Price</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      step="any"
                      value={form.pack_price}
                      onChange={(e) =>
                        updateField("pack_price", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <label className="input-label">Lead Time (days)</label>
                    <input
                      className="input-field"
                      type="number"
                      min={0}
                      value={form.planned_lead_time}
                      onChange={(e) =>
                        updateField(
                          "planned_lead_time",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </FormSection>

              {/* Engineered Features */}
              <FormSection title="Computed Features" icon={Settings2} defaultOpen={false}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <label className="input-label">Freight/kg</label>
                    <input
                      className="input-field"
                      type="number"
                      step="any"
                      value={form.freight_per_kg}
                      onChange={(e) =>
                        updateField(
                          "freight_per_kg",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      style={{ background: "rgba(238,242,255,0.3)" }}
                    />
                  </div>
                  <div>
                    <label className="input-label">Value/Unit</label>
                    <input
                      className="input-field"
                      type="number"
                      step="any"
                      value={form.value_per_unit}
                      onChange={(e) =>
                        updateField(
                          "value_per_unit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      style={{ background: "rgba(238,242,255,0.3)" }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9CA3AF",
                    marginTop: "0.5rem",
                    fontStyle: "italic",
                  }}
                >
                  Auto-computed when you fill Financial fields. Override here if needed.
                </p>
              </FormSection>

              {/* Schedule */}
              <FormSection title="Schedule" icon={Calendar}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <label className="input-label">Month</label>
                    <select
                      className="select-field"
                      value={form.sched_month}
                      onChange={(e) =>
                        updateField("sched_month", parseInt(e.target.value))
                      }
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Day of Week</label>
                    <select
                      className="select-field"
                      value={form.sched_dayofweek}
                      onChange={(e) =>
                        updateField(
                          "sched_dayofweek",
                          parseInt(e.target.value)
                        )
                      }
                    >
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </FormSection>

              {/* Submit */}
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.95rem",
                  fontSize: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      style={{ animation: "spin-slow 1s linear infinite" }}
                    />
                    Analyzing Shipment...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Analyze Shipment
                  </>
                )}
              </button>

              {/* Error */}
              {error && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.85rem 1rem",
                    borderRadius: 10,
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    color: "#DC2626",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Results ──────────────────────────────────── */}
          {result && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "slide-in-right 0.5s ease-out",
              }}
            >
              <RiskCard
                riskLabel={result.risk_label}
                riskFlag={result.risk_flag}
                delayDays={result.delay_days}
              />

              <ShapBreakdown features={result.shap_top_features} />

              <ActionPlan plan={result.action_plan} />

              <FeedbackButton
                predictionId={result.prediction_id}
                country={form.country}
                shipmentMode={form.shipment_mode}
                vendor={form.vendor}
                delayDays={result.delay_days}
                riskLabel={result.risk_label}
              />
            </div>
          )}
        </div>
      </div>

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .predict-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
