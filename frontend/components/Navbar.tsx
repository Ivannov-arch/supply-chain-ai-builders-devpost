"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Ship,
  Menu,
  X,
  BarChart3,
  FileSpreadsheet,
  Home,
  Terminal,
} from "lucide-react";
import { useRef } from "react";
import { useDevMode } from "@/context/DevModeContext";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/predict", label: "Predict", icon: BarChart3 },
  { href: "/bulk", label: "Bulk Upload", icon: FileSpreadsheet },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDevMode, setIsAuthModalOpen, logout } = useDevMode();

  // Easter egg: 5-click counter
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2500);

    if (nextCount >= 5) {
      e.preventDefault();
      setClickCount(0);
      setIsAuthModalOpen(true);
    }
  };

  // Keyboard shortcut: Ctrl + Shift + D
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsAuthModalOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setIsAuthModalOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        background: scrolled
          ? "rgba(255,255,255,0.82)"
          : "rgba(254,252,249,0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(212,165,116,0.18)"
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 4px 24px -4px rgba(180,140,80,0.10)"
          : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textDecoration: "none",
            cursor: "pointer",
          }}
          title="SupplyPulse (Click 5 times for Developer Mode)"
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, #4338CA, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(67,56,202,0.3)",
            }}
          >
            <Ship size={20} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#1E1B4B",
            }}
          >
            Ship
            <span
              style={{
                background:
                  "linear-gradient(135deg, #4338CA, #818CF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Safe
            </span>
            <span style={{ color: "#D4A574", fontWeight: 600 }}>
              {" "}
              AI
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          className="desktop-nav"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: 10,
                  fontSize: "0.88rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#4338CA" : "#6B7280",
                  background: active
                    ? "rgba(99,102,241,0.08)"
                    : "transparent",
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background =
                      "rgba(212,165,116,0.1)";
                    e.currentTarget.style.color = "#4338CA";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#6B7280";
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          {isDevMode && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "linear-gradient(135deg, rgba(30, 27, 75, 0.92), rgba(67, 56, 202, 0.92))",
                border: "1px solid rgba(129, 140, 248, 0.4)",
                borderRadius: 20,
                padding: "0.35rem 0.75rem",
                color: "#FFFFFF",
                fontSize: "0.75rem",
                fontWeight: 600,
                boxShadow: "0 2px 10px rgba(67, 56, 202, 0.25)",
                marginLeft: "0.5rem",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <Terminal size={13} color="#818CF8" />
              <span>DEV BENCHMARK</span>
              <button
                onClick={logout}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "#FFFFFF",
                  borderRadius: 8,
                  padding: "1px 6px",
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  marginLeft: "0.25rem",
                  transition: "background 0.2s",
                }}
                title="Exit Developer Mode"
              >
                Exit
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            color: "#4338CA",
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="mobile-nav"
          style={{
            padding: "0.5rem 1.5rem 1.5rem",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(212,165,116,0.12)",
            animation: "fadeInDown 0.25s ease-out",
          }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  fontSize: "0.95rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#4338CA" : "#6B7280",
                  background: active
                    ? "rgba(99,102,241,0.08)"
                    : "transparent",
                  textDecoration: "none",
                  marginBottom: "0.25rem",
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
