"use client";

import { CheckCircle2, AlertTriangle, Scale, Target, Calendar, ArrowRight } from "lucide-react";
import { type GroundTruthData, type PredictionResponse } from "@/lib/api";

interface DevValidationCardProps {
  prediction: PredictionResponse;
  groundTruth: GroundTruthData;
}

export default function DevValidationCard({
  prediction,
  groundTruth,
}: DevValidationCardProps) {
  const predDelay = prediction.delay_days;
  const actualDelay = groundTruth.actual_delay_days;
  const deltaDays = Math.round((predDelay - actualDelay) * 10) / 10;
  const absDelta = Math.abs(deltaDays);

  const predFlag = prediction.risk_flag;
  const actualFlag = groundTruth.actual_risk_flag;

  // Determine Confusion Matrix Category
  let outcomeCategory: {
    title: string;
    description: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  };

  if (predFlag === 1 && actualFlag === 1) {
    outcomeCategory = {
      title: "TRUE POSITIVE (TP)",
      description: "Model correctly flagged high customs delay risk.",
      color: "#34D399",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.3)",
      icon: <Target size={18} color="#34D399" />,
    };
  } else if (predFlag === 0 && actualFlag === 0) {
    outcomeCategory = {
      title: "TRUE NEGATIVE (TN)",
      description: "Model correctly confirmed an on-time shipment.",
      color: "#38BDF8",
      bg: "rgba(56, 189, 248, 0.12)",
      border: "rgba(56, 189, 248, 0.3)",
      icon: <CheckCircle2 size={18} color="#38BDF8" />,
    };
  } else if (predFlag === 1 && actualFlag === 0) {
    outcomeCategory = {
      title: "FALSE POSITIVE (FP)",
      description: "Conservative alert: model warned of risk, but shipment arrived on-time.",
      color: "#FBBF24",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.3)",
      icon: <AlertTriangle size={18} color="#FBBF24" />,
    };
  } else {
    outcomeCategory = {
      title: "FALSE NEGATIVE (FN)",
      description: "Shipment delayed unexpectedly in the field.",
      color: "#F87171",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.3)",
      icon: <AlertTriangle size={18} color="#F87171" />,
    };
  }

  const isHighAccuracy = absDelta <= 3.0;

  return (
    <div
      style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, #090D1A, #141B33)",
        border: "1px solid rgba(99, 102, 241, 0.35)",
        boxShadow: "0 12px 30px -8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.12)",
        padding: "1.5rem",
        color: "#F8FAFC",
        position: "relative",
        overflow: "hidden",
        animation: "fadeIn 0.35s ease-out",
      }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(99, 102, 241, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#818CF8",
            }}
          >
            <Scale size={18} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Ground Truth Validation Matrix
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#94A3B8", margin: 0 }}>
              Benchmarked against historical field records
            </p>
          </div>
        </div>

        {/* Evaluation Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 20,
            background: outcomeCategory.bg,
            border: `1px solid ${outcomeCategory.border}`,
            color: outcomeCategory.color,
            fontSize: "0.76rem",
            fontWeight: 700,
          }}
        >
          {outcomeCategory.icon}
          <span>{outcomeCategory.title}</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        {/* Delay Days Comparison Card */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: 12,
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.5rem",
            }}
          >
            Delay Days (Predicted vs Real)
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "0.4rem",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>Model: </span>
              <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#818CF8" }}>
                {predDelay > 0 ? `+${predDelay}d` : `${predDelay}d`}
              </span>
            </div>
            <ArrowRight size={14} color="#64748B" />
            <div>
              <span style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>Real: </span>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: actualDelay > 0 ? "#F87171" : "#34D399",
                }}
              >
                {actualDelay > 0 ? `+${actualDelay}d` : `${actualDelay}d`}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "0.4rem",
              borderTop: "1px solid rgba(148, 163, 184, 0.1)",
              fontSize: "0.75rem",
            }}
          >
            <span style={{ color: "#94A3B8" }}>Residual Delta (Δ):</span>
            <span
              style={{
                fontWeight: 700,
                color: isHighAccuracy ? "#34D399" : "#FBBF24",
              }}
            >
              {deltaDays > 0 ? `+${deltaDays} days` : `${deltaDays} days`}{" "}
              {isHighAccuracy ? "✓ (High Accuracy)" : ""}
            </span>
          </div>
        </div>

        {/* Risk Classification Comparison Card */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: 12,
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.5rem",
            }}
          >
            Risk Category (Predicted vs Real)
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.4rem",
            }}
          >
            <div>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  background:
                    predFlag === 1
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(56, 189, 248, 0.2)",
                  color: predFlag === 1 ? "#F87171" : "#38BDF8",
                }}
              >
                {prediction.risk_label}
              </span>
            </div>
            <ArrowRight size={14} color="#64748B" />
            <div>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  background:
                    actualFlag === 1
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(52, 211, 153, 0.2)",
                  color: actualFlag === 1 ? "#F87171" : "#34D399",
                }}
              >
                Actual: {groundTruth.actual_risk_label}
              </span>
            </div>
          </div>

          <div
            style={{
              paddingTop: "0.4rem",
              borderTop: "1px solid rgba(148, 163, 184, 0.1)",
              fontSize: "0.75rem",
              color: "#94A3B8",
              lineHeight: 1.3,
            }}
          >
            {outcomeCategory.description}
          </div>
        </div>
      </div>

      {/* Historical Dates Timeline Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          padding: "0.65rem 0.9rem",
          borderRadius: 8,
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          fontSize: "0.78rem",
          color: "#94A3B8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={14} color="#818CF8" />
          <span>
            Scheduled: <strong style={{ color: "#F8FAFC" }}>{groundTruth.scheduled_date}</strong>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={14} color="#34D399" />
          <span>
            Actual Arrival: <strong style={{ color: "#F8FAFC" }}>{groundTruth.delivered_date}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
