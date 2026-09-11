"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, Copy, Check } from "lucide-react";

interface ActionPlanProps {
  plan: string;
}

export default function ActionPlan({ plan }: ActionPlanProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Typewriter effect — reveals text in chunks
  useEffect(() => {
    if (!visible || !plan) return;

    let i = 0;
    const chunkSize = 3;
    intervalRef.current = setInterval(() => {
      i += chunkSize;
      if (i >= plan.length) {
        setDisplayedText(plan);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedText(plan.slice(0, i));
      }
    }, 12);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, plan]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-ish rendering: bold, bullet points, numbered lists
  const renderText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold markers
      let rendered = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong style="color:#1E1B4B;font-weight:700">$1</strong>'
      );

      // Bullet points
      if (/^\s*[-•]\s/.test(rendered)) {
        rendered = rendered.replace(/^\s*[-•]\s/, "");
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "0.4rem",
              paddingLeft: "0.25rem",
            }}
          >
            <span
              style={{
                color: "#4338CA",
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              ▸
            </span>
            <span dangerouslySetInnerHTML={{ __html: rendered }} />
          </div>
        );
      }

      // Numbered lists
      const numMatch = rendered.match(/^\s*(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "0.4rem",
              paddingLeft: "0.25rem",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #4338CA, #6366F1)",
                color: "white",
                width: 20,
                height: 20,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {numMatch[1]}
            </span>
            <span
              dangerouslySetInnerHTML={{ __html: numMatch[2] }}
            />
          </div>
        );
      }

      // Empty lines → spacer
      if (!rendered.trim()) {
        return <div key={i} style={{ height: "0.5rem" }} />;
      }

      return (
        <p
          key={i}
          style={{ marginBottom: "0.4rem" }}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      );
    });
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "2rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative corner gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background:
            "radial-gradient(circle at top right, rgba(67,56,202,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #4338CA, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={14} color="white" />
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
              AI Action Plan
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#6B7280",
                  margin: 0,
                }}
              >
                Powered by Google Gemini
              </p>
              <span
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "#4338CA",
                  background: "rgba(99,102,241,0.08)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                AI
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.4rem 0.75rem",
            borderRadius: 8,
            border: "1px solid rgba(212,165,116,0.2)",
            background: copied
              ? "rgba(16,185,129,0.08)"
              : "rgba(255,255,255,0.6)",
            color: copied ? "#059669" : "#6B7280",
            cursor: "pointer",
            fontSize: "0.78rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: "0.88rem",
          lineHeight: 1.65,
          color: "#374151",
          padding: "1rem 1.25rem",
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(238,242,255,0.4), rgba(245,230,211,0.2))",
          border: "1px solid rgba(212,165,116,0.1)",
          borderLeft: "3px solid #4338CA",
          minHeight: 60,
        }}
      >
        {displayedText ? (
          renderText(displayedText)
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#9CA3AF",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#4338CA",
                animation: "pulse-glow-green 1s ease-in-out infinite",
              }}
            />
            Generating action plan...
          </div>
        )}
      </div>
    </div>
  );
}
