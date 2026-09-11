"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle, Loader2 } from "lucide-react";
import { submitFeedback } from "@/lib/api";
import confetti from "canvas-confetti";

interface FeedbackButtonProps {
  predictionId?: string;
  country: string;
  shipmentMode: string;
  vendor?: string;
  delayDays: number;
  riskLabel: string;
}

export default function FeedbackButton({
  predictionId,
  country,
  shipmentMode,
  vendor,
  delayDays,
  riskLabel,
}: FeedbackButtonProps) {
  const [state, setState] = useState<
    "idle" | "loading" | "submitted"
  >("idle");
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (wasDelayed: boolean) => {
    setAnswer(wasDelayed);
    setState("loading");
    setErrorMsg(null);

    try {
      await submitFeedback({
        prediction_id: predictionId,
        country,
        shipment_mode: shipmentMode,
        vendor,
        delay_days: delayDays,
        risk_label: riskLabel,
        actual_was_delayed: wasDelayed,
      });

      setState("submitted");

      // Celebration confetti
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.7 },
        colors: ["#4338CA", "#D4A574", "#818CF8", "#F5E6D3"],
      });
    } catch (err) {
      setState("idle");
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit feedback");
    }
  };

  if (state === "submitted") {
    return (
      <div
        className="glass-card"
        style={{
          padding: "1.5rem 2rem",
          textAlign: "center",
          animation: "fadeInUp 0.5s ease-out",
        }}
      >
        <CheckCircle
          size={32}
          color="#059669"
          style={{ margin: "0 auto 0.5rem" }}
        />
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#059669",
            marginBottom: "0.25rem",
          }}
        >
          Thank you for your feedback!
        </div>
        <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
          Your response helps improve our predictions.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: "1.5rem 2rem" }}>
      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#1E1B4B",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        Was this shipment actually delayed?
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => handleSubmit(true)}
          disabled={state === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.5rem",
            borderRadius: 10,
            border:
              answer === true
                ? "2px solid #DC2626"
                : "1.5px solid rgba(239,68,68,0.2)",
            background:
              answer === true
                ? "rgba(239,68,68,0.08)"
                : "white",
            color: "#DC2626",
            fontWeight: 600,
            fontSize: "0.88rem",
            cursor: state === "loading" ? "not-allowed" : "pointer",
            transition: "all 0.25s ease",
            opacity: state === "loading" && answer !== true ? 0.5 : 1,
          }}
        >
          {state === "loading" && answer === true ? (
            <Loader2 size={16} style={{ animation: "spin-slow 1s linear infinite" }} />
          ) : (
            <ThumbsDown size={16} />
          )}
          Yes, Delayed
        </button>

        <button
          onClick={() => handleSubmit(false)}
          disabled={state === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.5rem",
            borderRadius: 10,
            border:
              answer === false
                ? "2px solid #059669"
                : "1.5px solid rgba(16,185,129,0.2)",
            background:
              answer === false
                ? "rgba(16,185,129,0.08)"
                : "white",
            color: "#059669",
            fontWeight: 600,
            fontSize: "0.88rem",
            cursor: state === "loading" ? "not-allowed" : "pointer",
            transition: "all 0.25s ease",
            opacity: state === "loading" && answer !== false ? 0.5 : 1,
          }}
        >
          {state === "loading" && answer === false ? (
            <Loader2 size={16} style={{ animation: "spin-slow 1s linear infinite" }} />
          ) : (
            <ThumbsUp size={16} />
          )}
          No, On Time
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.6rem 0.85rem",
            borderRadius: 8,
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
            color: "#DC2626",
            fontSize: "0.78rem",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}
