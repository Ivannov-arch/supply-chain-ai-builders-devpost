"use client";

import { useState } from "react";
import { Download, ArrowUpDown, AlertTriangle, ShieldCheck } from "lucide-react";
import type { BulkRowResult } from "@/lib/api";

interface RiskHeatmapProps {
  results: BulkRowResult[];
  summary: { high: number; medium: number; low: number };
}

type SortKey = "row" | "origin" | "risk_level" | "delay_days";
type SortDir = "asc" | "desc";

export default function RiskHeatmap({
  results,
  summary,
}: RiskHeatmapProps) {
  const [sortKey, setSortKey] = useState<SortKey>("row");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...results]
    .filter((r) => !r.error)
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "row") return (a.row - b.row) * dir;
      if (sortKey === "delay_days") return (a.delay_days - b.delay_days) * dir;
      if (sortKey === "risk_level")
        return a.risk_level.localeCompare(b.risk_level) * dir;
      if (sortKey === "origin")
        return a.origin.localeCompare(b.origin) * dir;
      return 0;
    });

  const handleExport = () => {
    const headers = ["Row", "Origin", "Destination", "Risk Level", "Delay Days"];
    const rows = sorted.map((r) =>
      [r.row, r.origin, r.destination, r.risk_level, r.delay_days.toFixed(1)].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "risk_predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({
    label,
    keyName,
  }: {
    label: string;
    keyName: SortKey;
  }) => (
    <th
      onClick={() => handleSort(keyName)}
      style={{
        padding: "0.75rem 1rem",
        textAlign: "left",
        fontSize: "0.75rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#4338CA",
        cursor: "pointer",
        userSelect: "none",
        borderBottom: "2px solid rgba(212,165,116,0.15)",
        background: "rgba(238,242,255,0.3)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {label}
        <ArrowUpDown
          size={12}
          style={{
            opacity: sortKey === keyName ? 1 : 0.3,
            color: sortKey === keyName ? "#4338CA" : "#9CA3AF",
          }}
        />
      </span>
    </th>
  );

  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          padding: "1.5rem 1.5rem 0",
        }}
      >
        {/* Total */}
        <div
          style={{
            padding: "1rem",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(67,56,202,0.06), rgba(99,102,241,0.04))",
            border: "1px solid rgba(99,102,241,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#4338CA",
            }}
          >
            {results.length}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Total Shipments
          </div>
        </div>

        {/* High risk */}
        <div
          style={{
            padding: "1rem",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(252,165,165,0.04))",
            border: "1px solid rgba(239,68,68,0.12)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <AlertTriangle size={18} />
            {summary.high}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            High Risk
          </div>
        </div>

        {/* Low risk */}
        <div
          style={{
            padding: "1rem",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(110,231,183,0.04))",
            border: "1px solid rgba(16,185,129,0.12)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <ShieldCheck size={18} />
            {summary.low}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Low Risk
          </div>
        </div>
      </div>

      {/* Export button */}
      <div style={{ padding: "1rem 1.5rem 0", textAlign: "right" }}>
        <button
          onClick={handleExport}
          className="btn-secondary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          padding: "1rem 1.5rem 1.5rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr>
              <SortHeader label="Row" keyName="row" />
              <SortHeader label="Origin" keyName="origin" />
              <th
                style={{
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#4338CA",
                  borderBottom: "2px solid rgba(212,165,116,0.15)",
                  background: "rgba(238,242,255,0.3)",
                }}
              >
                Destination
              </th>
              <SortHeader label="Risk" keyName="risk_level" />
              <SortHeader label="Delay (Days)" keyName="delay_days" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={r.row}
                style={{
                  background:
                    r.risk_level === "HIGH"
                      ? "rgba(239,68,68,0.03)"
                      : i % 2 === 0
                      ? "transparent"
                      : "rgba(245,230,211,0.15)",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(99,102,241,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    r.risk_level === "HIGH"
                      ? "rgba(239,68,68,0.03)"
                      : i % 2 === 0
                      ? "transparent"
                      : "rgba(245,230,211,0.15)")
                }
              >
                <td
                  style={{
                    padding: "0.65rem 1rem",
                    borderBottom: "1px solid rgba(212,165,116,0.08)",
                    color: "#6B7280",
                    fontWeight: 500,
                    fontSize: "0.8rem",
                  }}
                >
                  #{r.row}
                </td>
                <td
                  style={{
                    padding: "0.65rem 1rem",
                    borderBottom: "1px solid rgba(212,165,116,0.08)",
                    fontWeight: 600,
                    color: "#1E1B4B",
                  }}
                >
                  {r.origin}
                </td>
                <td
                  style={{
                    padding: "0.65rem 1rem",
                    borderBottom: "1px solid rgba(212,165,116,0.08)",
                    color: "#374151",
                  }}
                >
                  {r.destination}
                </td>
                <td
                  style={{
                    padding: "0.65rem 1rem",
                    borderBottom: "1px solid rgba(212,165,116,0.08)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0.2rem 0.65rem",
                      borderRadius: 8,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background:
                        r.risk_level === "HIGH"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(16,185,129,0.1)",
                      color:
                        r.risk_level === "HIGH" ? "#DC2626" : "#059669",
                    }}
                  >
                    {r.risk_level === "HIGH" ? (
                      <AlertTriangle size={11} />
                    ) : (
                      <ShieldCheck size={11} />
                    )}
                    {r.risk_level}
                  </span>
                </td>
                <td
                  style={{
                    padding: "0.65rem 1rem",
                    borderBottom: "1px solid rgba(212,165,116,0.08)",
                    fontWeight: 700,
                    color: "#1E1B4B",
                  }}
                >
                  {r.delay_days.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#9CA3AF",
              fontSize: "0.9rem",
            }}
          >
            No results to display
          </div>
        )}
      </div>
    </div>
  );
}
