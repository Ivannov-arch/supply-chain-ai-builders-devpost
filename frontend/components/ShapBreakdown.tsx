"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Sparkles } from "lucide-react";

interface ShapFeature {
  feature: string;
  contribution?: number;
  shap_value?: number;
}

interface ShapBreakdownProps {
  features: ShapFeature[];
}

// Friendly names — covers both snake_case AND original training column names
const FEATURE_LABELS: Record<string, string> = {
  // snake_case keys (frontend schema)
  freight_per_kg: "Freight / kg",
  value_per_unit: "Value / Unit",
  weight_kg: "Weight (kg)",
  freight_cost_usd: "Freight Cost ($)",
  line_item_value: "Line Item Value",
  line_item_quantity: "Quantity",
  pack_price: "Pack Price",
  planned_lead_time: "Lead Time",
  sched_month: "Schedule Month",
  sched_dayofweek: "Day of Week",
  country: "Country",
  managed_by: "Managed By",
  fulfill_via: "Fulfillment",
  vendor_inco_term: "Incoterm",
  shipment_mode: "Ship Mode",
  product_group: "Product Group",
  sub_classification: "Sub Class",
  vendor: "Vendor",
  // Original training column names (from backend predictor.py)
  "Country": "Country",
  "Managed By": "Managed By",
  "Fulfill Via": "Fulfillment",
  "Vendor INCO Term": "Vendor INCO Term",
  "Shipment Mode": "Ship Mode",
  "Product Group": "Product Group",
  "Sub Classification": "Sub Class",
  "Vendor": "Vendor",
  "Weight (Kilograms)": "Weight (kg)",
  "Freight Cost (USD)": "Freight Cost ($)",
  "Line Item Value": "Line Item Value",
  "Line Item Quantity": "Quantity",
  "Pack Price": "Pack Price",
};

function formatLabel(name: string): string {
  return FEATURE_LABELS[name] || name.replace(/_/g, " ");
}

/** Get the numeric contribution from a SHAP feature (backend may send 'shap_value' or 'contribution') */
function getContribution(f: ShapFeature): number {
  return f.contribution ?? f.shap_value ?? 0;
}

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; raw: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(212,165,116,0.2)",
        borderRadius: 10,
        padding: "0.6rem 0.85rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        fontSize: "0.82rem",
      }}
    >
      <div style={{ fontWeight: 700, color: "#1E1B4B", marginBottom: 2 }}>
        {d.name}
      </div>
      <div style={{ color: "#6B7280" }}>
        Contribution:{" "}
        <span style={{ fontWeight: 600, color: d.raw >= 0 ? "#4338CA" : "#D4A574" }}>
          {d.value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function ShapBreakdown({ features }: ShapBreakdownProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Sort by absolute contribution, take top 8
  const sorted = [...features]
    .sort((a, b) => Math.abs(getContribution(b)) - Math.abs(getContribution(a)))
    .slice(0, 8);

  // Compute percentage: each bar = |contribution| / sum(|contributions|) * 100
  const totalAbs = sorted.reduce((sum, f) => sum + Math.abs(getContribution(f)), 0) || 1;

  const chartData = sorted.map((f) => {
    const raw = getContribution(f);
    return {
      name: formatLabel(f.feature),
      value: (Math.abs(raw) / totalAbs) * 100,
      raw,
    };
  });

  return (
    <div
      className="glass-card"
      style={{
        padding: "2rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #EEF2FF, #C7D2FE)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={14} color="#4338CA" />
        </div>
        <div>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1E1B4B",
              margin: 0,
            }}
          >
            Feature Impact (SHAP)
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#6B7280",
              margin: 0,
            }}
          >
            What drove this prediction
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
            barCategoryGap="18%"
          >
            <XAxis
              type="number"
              tickFormatter={(v: number) => `${v}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#4B5563", fontWeight: 500 }}
              width={100}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(212,165,116,0.06)" }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.raw >= 0
                      ? `rgba(67,56,202,${0.5 + (index < 3 ? 0.4 - index * 0.1 : 0.1)})`
                      : `rgba(212,165,116,${0.5 + (index < 3 ? 0.4 - index * 0.1 : 0.1)})`
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          marginTop: "0.75rem",
          fontSize: "0.75rem",
          color: "#9CA3AF",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: "#4338CA",
              display: "inline-block",
            }}
          />
          Increases Risk
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: "#D4A574",
              display: "inline-block",
            }}
          />
          Decreases Risk
        </span>
      </div>
    </div>
  );
}
