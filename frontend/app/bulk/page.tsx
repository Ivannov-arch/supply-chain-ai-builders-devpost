"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  AlertTriangle,
  Download,
  Info,
} from "lucide-react";
import { predictBulk, type BulkResponse } from "@/lib/api";
import BulkUpload from "@/components/BulkUpload";
import RiskHeatmap from "@/components/RiskHeatmap";
import DelayChart from "@/components/DelayChart";

// ═══════════════════════════════════════════════════════════════
//  Bulk CSV Upload Page
// ═══════════════════════════════════════════════════════════════

export default function BulkPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictBulk(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
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
        {/* ── Page Header ──────────────────────────────────────── */}
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
            Bulk CSV
            <span
              style={{
                background:
                  "linear-gradient(135deg, #4338CA, #818CF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              Upload
            </span>
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#6B7280",
              maxWidth: 560,
              margin: 0,
            }}
          >
            Upload a CSV or XLSX file with your shipment manifest to get batch
            risk predictions, a visual heatmap, and delay distribution chart.
          </p>
        </div>

        {/* ── Upload Zone (show when no results) ───────────────── */}
        {!result && (
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            <div className="animate-in animate-delay-1">
              <BulkUpload onUpload={handleUpload} isLoading={loading} />
            </div>

            {/* Error message */}
            {error && (
              <div
                className="animate-in"
                style={{
                  marginTop: "1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  color: "#DC2626",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* Required columns info */}
            <div
              className="animate-in animate-delay-2"
              style={{
                marginTop: "1.5rem",
                padding: "1.25rem 1.5rem",
                borderRadius: 14,
                background: "rgba(238,242,255,0.35)",
                border: "1px solid rgba(99,102,241,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.75rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#4338CA",
                }}
              >
                <Info size={14} />
                Required CSV Columns
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                }}
              >
                {[
                  "country",
                  "managed_by",
                  "fulfill_via",
                  "vendor_inco_term",
                  "shipment_mode",
                  "product_group",
                  "sub_classification",
                  "vendor",
                  "weight_kg",
                  "freight_cost_usd",
                  "line_item_value",
                  "line_item_quantity",
                  "pack_price",
                  "planned_lead_time",
                  "freight_per_kg",
                  "value_per_unit",
                  "sched_month",
                  "sched_dayofweek",
                ].map((col) => (
                  <code
                    key={col}
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(212,165,116,0.15)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "'Inter', monospace",
                    }}
                  >
                    {col}
                  </code>
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9CA3AF",
                  marginTop: "0.6rem",
                  margin: "0.6rem 0 0",
                }}
              >
                Maximum 200 rows per upload. Supports .csv and .xlsx formats.
              </p>
            </div>

            {/* Sample download helper */}
            <div
              className="animate-in animate-delay-3"
              style={{
                marginTop: "1rem",
                textAlign: "center",
              }}
            >
              <a
                href="/sample_manifest.csv"
                download
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#4338CA",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: 8,
                  border: "1px solid rgba(99,102,241,0.15)",
                  background: "rgba(255,255,255,0.5)",
                  transition: "all 0.2s ease",
                }}
              >
                <Download size={14} />
                Download Sample CSV
              </a>
            </div>
          </div>
        )}

        {/* ── Results Section ──────────────────────────────────── */}
        {result && (
          <div style={{ animation: "fadeInUp 0.6s ease-out" }}>
            {/* Top bar: summary + reset */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #D4A574, #C48B52)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileSpreadsheet size={18} color="white" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#1E1B4B",
                    }}
                  >
                    Analysis Complete
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#6B7280",
                    }}
                  >
                    {result.total} shipments processed
                  </div>
                </div>
              </div>

              <button
                className="btn-secondary"
                onClick={handleReset}
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.85rem",
                }}
              >
                Upload Another File
              </button>
            </div>

            {/* Risk Heatmap Table */}
            <div style={{ marginBottom: "1.5rem" }}>
              <RiskHeatmap
                results={result.results}
                summary={result.summary}
              />
            </div>

            {/* Delay Distribution Chart */}
            <DelayChart results={result.results} />
          </div>
        )}
      </div>
    </div>
  );
}
