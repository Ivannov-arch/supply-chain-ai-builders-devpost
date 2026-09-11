"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { BulkRowResult } from "@/lib/api";

interface DelayChartProps {
  results: BulkRowResult[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { row: number; delay_days: number; risk: string; origin: string } }>;
}) {
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
      <div style={{ fontWeight: 700, color: "#1E1B4B" }}>
        Row #{d.row} — {d.origin}
      </div>
      <div style={{ color: "#6B7280", marginTop: 2 }}>
        Delay:{" "}
        <span style={{ fontWeight: 700, color: "#4338CA" }}>
          {d.delay_days.toFixed(1)} days
        </span>
      </div>
      <div
        style={{
          marginTop: 2,
          fontWeight: 600,
          color: d.risk === "HIGH" ? "#DC2626" : "#059669",
        }}
      >
        {d.risk} Risk
      </div>
    </div>
  );
}

export default function DelayChart({ results }: DelayChartProps) {
  const valid = results.filter((r) => !r.error);

  const chartData = valid.map((r) => ({
    row: r.row,
    delay_days: r.delay_days,
    risk: r.risk_level,
    origin: r.origin,
  }));

  return (
    <div className="glass-card" style={{ padding: "2rem" }}>
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
            background: "linear-gradient(135deg, #F5E6D3, #D4A574)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BarChart3 size={14} color="#6B4F10" />
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
            Delay Distribution
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#6B7280",
              margin: 0,
            }}
          >
            Predicted delay per shipment row
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
            barCategoryGap="15%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(212,165,116,0.12)"
              vertical={false}
            />
            <XAxis
              dataKey="row"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              label={{
                value: "Shipment Row",
                position: "insideBottom",
                offset: -10,
                style: {
                  fontSize: 11,
                  fill: "#9CA3AF",
                  fontWeight: 600,
                },
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              label={{
                value: "Delay (days)",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: {
                  fontSize: 11,
                  fill: "#9CA3AF",
                  fontWeight: 600,
                },
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(212,165,116,0.06)" }} />
            <Bar dataKey="delay_days" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.risk === "HIGH"
                      ? "rgba(239,68,68,0.7)"
                      : "rgba(67,56,202,0.55)"
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
          marginTop: "0.5rem",
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
              background: "rgba(239,68,68,0.7)",
              display: "inline-block",
            }}
          />
          High Risk
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: "rgba(67,56,202,0.55)",
              display: "inline-block",
            }}
          />
          Low Risk
        </span>
      </div>
    </div>
  );
}
