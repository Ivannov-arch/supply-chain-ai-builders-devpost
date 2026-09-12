"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Lock, Eye, EyeOff, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useDevMode } from "@/context/DevModeContext";

export default function DevAuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useDevMode();
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setPasscode("");
      setError(null);
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAuthModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Please enter the passcode.");
      return;
    }

    const res = login(passcode);
    if (res.success) {
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 600);
    } else {
      setError(res.error || "Incorrect passcode.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAuthModalOpen(false);
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#0F172A",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)",
          padding: "2rem",
          color: "#F8FAFC",
          position: "relative",
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "transparent",
            border: "none",
            color: "#94A3B8",
            cursor: "pointer",
            padding: 4,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))",
              border: "1px solid rgba(129, 140, 248, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#818CF8",
            }}
          >
            <Terminal size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              Developer Mode
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#94A3B8", margin: 0 }}>
              Model Benchmarking & Ground Truth Inspector
            </p>
          </div>
        </div>

        <p style={{ fontSize: "0.85rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Enter developer passcode to inspect and validate all 2,908 real SCMS historical shipments against model predictions.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="dev-passcode"
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#94A3B8",
                marginBottom: "0.5rem",
              }}
            >
              Developer Passcode
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                color="#64748B"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="dev-passcode"
                ref={inputRef}
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                style={{
                  width: "100%",
                  padding: "0.75rem 2.75rem 0.75rem 2.5rem",
                  background: "rgba(15, 23, 42, 0.8)",
                  border: error ? "1px solid #EF4444" : "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 10,
                  color: "#F8FAFC",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPasscode ? "Hide password" : "Show password"}
              >
                {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 0.8rem",
                borderRadius: 8,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#F87171",
                fontSize: "0.8rem",
                marginBottom: "1.25rem",
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 0.8rem",
                borderRadius: 8,
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#4ADE80",
                fontSize: "0.8rem",
                marginBottom: "1.25rem",
              }}
            >
              <CheckCircle2 size={15} />
              <span>Developer mode unlocked successfully!</span>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: 10,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                background: "transparent",
                color: "#94A3B8",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: "0.75rem",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #4338CA, #6366F1)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              }}
            >
              Unlock Dev Mode
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(148, 163, 184, 0.1)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "#64748B", margin: 0 }}>
            Demo passcode: <code style={{ color: "#A5B4FC", background: "rgba(99, 102, 241, 0.15)", padding: "2px 6px", borderRadius: 4 }}>devpost2026</code>
          </p>
        </div>
      </div>
    </div>
  );
}
