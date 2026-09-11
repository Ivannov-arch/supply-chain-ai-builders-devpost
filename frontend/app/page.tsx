"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Box,
  Brain,
  Sparkles,
  ShieldCheck,
  Ship,
  BarChart3,
  FileSpreadsheet,
  Zap,
  Globe,
  TrendingUp,
  Package,
} from "lucide-react";

// ── Floating cargo box component ────────────────────────────────
function FloatingBox({
  size,
  left,
  top,
  delay,
  color,
}: {
  size: number;
  left: string;
  top: string;
  delay: number;
  color: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: color,
        opacity: 0.12,
        animation: `float-slow ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Feature card ────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400 + delay * 150);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="glass-card"
      style={{
        padding: "1.75rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "linear-gradient(135deg, #EEF2FF, #C7D2FE)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <Icon size={22} color="#4338CA" strokeWidth={2} />
      </div>
      <h3
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#1E1B4B",
          marginBottom: "0.4rem",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.85rem",
          color: "#6B7280",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

// ── Stat ticker item ────────────────────────────────────────────
function StatItem({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800 + delay * 200);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="text-gradient"
        style={{
          fontSize: "2.25rem",
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "#6B7280",
          marginTop: "0.25rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Tech badge ──────────────────────────────────────────────────
function TechBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        padding: "0.35rem 0.85rem",
        borderRadius: 8,
        fontSize: "0.78rem",
        fontWeight: 600,
        background: color,
        color: "#374151",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Landing Page
// ═══════════════════════════════════════════════════════════════

export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  return (
    <div style={{ paddingTop: 64 }}>
      {/* ── Hero Section ───────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Kraft gradient background */}
        <div
          className="kraft-surface"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.35,
          }}
        />

        {/* Floating cargo boxes */}
        <FloatingBox size={80} left="8%" top="15%" delay={0} color="#4338CA" />
        <FloatingBox size={50} left="85%" top="20%" delay={1.5} color="#D4A574" />
        <FloatingBox size={65} left="75%" top="65%" delay={3} color="#6366F1" />
        <FloatingBox size={40} left="15%" top="72%" delay={2} color="#C48B52" />
        <FloatingBox size={55} left="50%" top="10%" delay={4} color="#818CF8" />
        <FloatingBox size={35} left="30%" top="80%" delay={1} color="#D4A574" />

        <div
          className="section-container"
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "4rem 1.5rem",
          }}
        >
          {/* Tag line */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.6s ease 0.1s",
              marginBottom: "1.5rem",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0.4rem 1rem",
                borderRadius: 100,
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(212,165,116,0.2)",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#4338CA",
              }}
            >
              <Zap size={14} />
              AI-Powered Supply Chain Intelligence
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="text-gradient"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              marginBottom: "1.25rem",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.7s ease 0.2s",
            }}
          >
            Predict. Protect.
            <br />
            Prosper.
          </h1>

          {/* Sub-headline */}
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#6B7280",
              maxWidth: 580,
              margin: "0 auto 2.5rem",
              lineHeight: 1.65,
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.7s ease 0.35s",
            }}
          >
            Anticipate customs delays, decode risk drivers with explainable AI,
            and get AI-generated mitigation plans — before your shipment leaves
            the dock.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.7s ease 0.5s",
            }}
          >
            <Link href="/predict" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}>
                <BarChart3 size={18} />
                Single Prediction
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/bulk" style={{ textDecoration: "none" }}>
              <button className="btn-secondary" style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}>
                <FileSpreadsheet size={18} />
                Bulk Upload
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Ticker ───────────────────────────────────────── */}
      <section
        style={{
          padding: "3rem 0",
          borderTop: "1px solid rgba(212,165,116,0.12)",
          borderBottom: "1px solid rgba(212,165,116,0.12)",
          background: "rgba(255,255,255,0.5)",
        }}
      >
        <div
          className="section-container"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4rem",
            flexWrap: "wrap",
          }}
        >
          <StatItem value="3" label="AI Models" delay={0} />
          <StatItem value="18" label="Risk Features" delay={1} />
          <StatItem value="<2s" label="Prediction Time" delay={2} />
          <StatItem value="200" label="Bulk Row Limit" delay={3} />
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────── */}
      <section style={{ padding: "5rem 0" }}>
        <div className="section-container">
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#1E1B4B",
                marginBottom: "0.5rem",
              }}
            >
              How It Works
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#6B7280",
                maxWidth: 500,
                margin: "0 auto",
              }}
            >
              Three AI engines working together to protect your supply chain
            </p>
          </div>

          {/* Feature cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <FeatureCard
              icon={TrendingUp}
              title="XGBoost Prediction"
              description="Dual-head gradient boosting model predicts exact delay days (regression) and risk classification (binary) from 18 supply chain features."
              delay={0}
            />
            <FeatureCard
              icon={Sparkles}
              title="SHAP Explainability"
              description="Understand exactly which factors — freight cost, shipment mode, vendor — drive each prediction with ranked feature contribution scores."
              delay={1}
            />
            <FeatureCard
              icon={Brain}
              title="Gemini Action Plan"
              description="Google Gemini AI analyzes the prediction context and generates actionable, customs-specific mitigation strategies in seconds."
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* ── Pipeline Flow ──────────────────────────────────────── */}
      <section
        style={{
          padding: "4rem 0 5rem",
          background: "linear-gradient(180deg, rgba(238,242,255,0.3) 0%, rgba(245,230,211,0.2) 100%)",
        }}
      >
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#1E1B4B",
                marginBottom: "0.4rem",
              }}
            >
              End-to-End Pipeline
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#6B7280" }}>
              From raw shipment data to actionable intelligence
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: Package, label: "Shipment Data" },
              { icon: Box, label: "Feature Engineering" },
              { icon: TrendingUp, label: "XGBoost" },
              { icon: Sparkles, label: "SHAP" },
              { icon: Brain, label: "Gemini AI" },
              { icon: ShieldCheck, label: "Risk Report" },
            ].map((step, i) => (
              <div
                key={step.label}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  className="glass-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "1rem 1.25rem",
                    minWidth: 100,
                    cursor: "default",
                  }}
                >
                  <step.icon size={22} color="#4338CA" />
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#374151",
                      textAlign: "center",
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < 5 && (
                  <ArrowRight
                    size={16}
                    color="#D4A574"
                    style={{ flexShrink: 0 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────── */}
      <section style={{ padding: "4rem 0" }}>
        <div className="section-container" style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#1E1B4B",
              marginBottom: "1.5rem",
            }}
          >
            Built With
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <TechBadge label="Next.js 16" color="rgba(30,27,75,0.06)" />
            <TechBadge label="FastAPI" color="rgba(16,185,129,0.08)" />
            <TechBadge label="XGBoost" color="rgba(99,102,241,0.08)" />
            <TechBadge label="SHAP" color="rgba(212,165,116,0.15)" />
            <TechBadge label="Google Gemini" color="rgba(67,56,202,0.08)" />
            <TechBadge label="Supabase" color="rgba(16,185,129,0.08)" />
            <TechBadge label="Tailwind CSS v4" color="rgba(56,189,248,0.08)" />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        style={{
          padding: "2rem 0",
          borderTop: "1px solid rgba(212,165,116,0.12)",
          textAlign: "center",
        }}
      >
        <div className="section-container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <Ship size={16} color="#4338CA" />
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "#1E1B4B",
              }}
            >
              ShipSafe AI
            </span>
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#9CA3AF",
              margin: 0,
            }}
          >
            Cross-Border Supply Chain Risk Predictor · Hackathon 2026
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              marginTop: "0.75rem",
            }}
          >
            <Link
              href="/predict"
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
                textDecoration: "none",
              }}
            >
              Predict
            </Link>
            <Link
              href="/bulk"
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
                textDecoration: "none",
              }}
            >
              Bulk Upload
            </Link>
            <span
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
              }}
            >
              <Globe size={12} style={{ display: "inline", marginRight: 4 }} />
              v1.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
