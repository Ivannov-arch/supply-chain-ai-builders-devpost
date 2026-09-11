"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Clock, TrendingUp } from "lucide-react";

interface RiskCardProps {
  riskLabel: "Low Risk" | "High Risk";
  riskFlag: number;
  delayDays: number;
}

export default function RiskCard({
  riskLabel,
  riskFlag,
  delayDays,
}: RiskCardProps) {
  const isHigh = riskFlag === 1;
  const [animatedDelay, setAnimatedDelay] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    // Animate count-up for delay days
    const target = Math.round(delayDays * 10) / 10;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setAnimatedDelay(target);
        clearInterval(timer);
      } else {
        setAnimatedDelay(Math.round(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [delayDays]);

  return (
    <div
      className="glass-card"
      style={{
        padding: "2rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.8rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#6B7280",
        }}
      >
        <TrendingUp size={14} />
        Prediction Result
      </div>

      {/* Risk Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div
          className={isHigh ? "risk-high" : "risk-low"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 2rem",
            borderRadius: 16,
            background: isHigh
              ? "linear-gradient(135deg, #FEF2F2, #FECACA)"
              : "linear-gradient(135deg, #ECFDF5, #A7F3D0)",
            border: `2px solid ${isHigh ? "#FCA5A5" : "#6EE7B7"}`,
          }}
        >
          {isHigh ? (
            <ShieldAlert
              size={32}
              color="#DC2626"
              strokeWidth={2.5}
            />
          ) : (
            <ShieldCheck
              size={32}
              color="#059669"
              strokeWidth={2.5}
            />
          )}
          <div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: isHigh ? "#DC2626" : "#059669",
                lineHeight: 1.1,
              }}
            >
              {riskLabel.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: isHigh ? "#B91C1C" : "#047857",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              Risk Classification
            </div>
          </div>
        </div>
      </div>

      {/* Delay Days Counter */}
      <div
        style={{
          textAlign: "center",
          padding: "1.25rem",
          borderRadius: 14,
          background:
            "linear-gradient(135deg, rgba(67,56,202,0.04), rgba(212,165,116,0.06))",
          border: "1px solid rgba(212,165,116,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <Clock size={18} color="#4338CA" />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#4338CA",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Predicted Delay
          </span>
        </div>
        <div
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            lineHeight: 1,
            color: "#1E1B4B",
            animation: "count-up 0.5s ease-out",
          }}
        >
          {animatedDelay.toFixed(1)}
        </div>
        <div
          style={{
            fontSize: "0.85rem",
            color: "#6B7280",
            marginTop: "0.25rem",
            fontWeight: 500,
          }}
        >
          days
        </div>
      </div>
    </div>
  );
}
