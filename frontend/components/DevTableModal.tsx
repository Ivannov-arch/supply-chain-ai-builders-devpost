"use client";

import { useState, useEffect } from "react";
import {
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Table,
} from "lucide-react";
import {
  fetchDevRecords,
  fetchDevRecordById,
  type DevRecordListItem,
  type DevRecordDetail,
} from "@/lib/api";

interface DevTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRow: (record: DevRecordDetail) => void;
}

export default function DevTableModal({
  isOpen,
  onClose,
  onSelectRow,
}: DevTableModalProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DevRecordListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "delayed" | "ontime">("all");
  const [search, setSearch] = useState("");
  const [loadingRowId, setLoadingRowId] = useState<number | null>(null);

  // Load records whenever page, filter, or search changes
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchDevRecords(page, 15, filter, search);
        if (active) {
          setItems(res.items);
          setTotalPages(res.total_pages);
          setTotal(res.total);
        }
      } catch (err) {
        console.error("Failed to load dev records:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadData, search ? 300 : 0);
    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [isOpen, page, filter, search]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = async (rowId: number) => {
    setLoadingRowId(rowId);
    try {
      const detail = await fetchDevRecordById(rowId);
      onSelectRow(detail);
      onClose();
    } catch (err) {
      console.error("Failed to fetch row detail:", err);
    } finally {
      setLoadingRowId(null);
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
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        padding: "1rem",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "#0F172A",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: 20,
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)",
          color: "#F8FAFC",
          overflow: "hidden",
          animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(99, 102, 241, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818CF8",
              }}
            >
              <Table size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                Historical SCMS Benchmark Dataset
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#94A3B8", margin: 0 }}>
                Browse & select any of the {total.toLocaleString()} shipments to inspect 1-by-1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
            }}
            aria-label="Close table modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(30, 41, 59, 0.5)",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              position: "relative",
              flex: "1 1 240px",
              maxWidth: 360,
            }}
          >
            <Search
              size={15}
              color="#64748B"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search country, vendor, mode..."
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem 0.55rem 2.2rem",
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: 8,
                color: "#F8FAFC",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>

          {/* Outcome Filter Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(15, 23, 42, 0.8)",
              padding: 3,
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            {(["all", "delayed", "ontime"] as const).map((tab) => {
              const active = filter === tab;
              const labels = {
                all: "All Shipments",
                delayed: "Delayed Only (⚠️)",
                ontime: "On-Time Only (✓)",
              };
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setFilter(tab);
                    setPage(1);
                  }}
                  style={{
                    padding: "0.4rem 0.75rem",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.78rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#FFFFFF" : "#94A3B8",
                    background: active
                      ? "linear-gradient(135deg, #4338CA, #6366F1)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 1.5rem" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 1rem",
                gap: "0.75rem",
                color: "#94A3B8",
              }}
            >
              <Loader2 size={28} className="animate-spin text-indigo-400" />
              <span style={{ fontSize: "0.85rem" }}>Loading benchmark records...</span>
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3.5rem 1rem",
                color: "#94A3B8",
                fontSize: "0.88rem",
              }}
            >
              No shipments found matching your search.
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.82rem",
                marginTop: "0.5rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                    color: "#94A3B8",
                    textAlign: "left",
                    fontSize: "0.74rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "0.75rem 0.5rem" }}>Row #</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Country</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Mode</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Vendor</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Scheduled</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Delivered</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Real Delay</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Actual Status</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const isDelayed = row.actual_risk_flag === 1;
                  return (
                    <tr
                      key={row.row_id}
                      style={{
                        borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "0.65rem 0.5rem", fontWeight: 700, color: "#818CF8" }}>
                        #{row.row_id}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem", color: "#F1F5F9", fontWeight: 600 }}>
                        {row.country}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem", color: "#CBD5E1" }}>
                        {row.shipment_mode}
                      </td>
                      <td
                        style={{
                          padding: "0.65rem 0.5rem",
                          color: "#94A3B8",
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={row.vendor}
                      >
                        {row.vendor}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem", color: "#94A3B8" }}>
                        {row.scheduled_date}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem", color: "#94A3B8" }}>
                        {row.delivered_date}
                      </td>
                      <td
                        style={{
                          padding: "0.65rem 0.5rem",
                          fontWeight: 700,
                          color: isDelayed ? "#F87171" : "#4ADE80",
                        }}
                      >
                        {row.actual_delay_days > 0 ? `+${row.actual_delay_days}d` : `${row.actual_delay_days}d`}
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: isDelayed
                              ? "rgba(239, 68, 68, 0.18)"
                              : "rgba(34, 197, 94, 0.18)",
                            color: isDelayed ? "#F87171" : "#4ADE80",
                            border: `1px solid ${isDelayed ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
                          }}
                        >
                          {isDelayed ? (
                            <>
                              <AlertTriangle size={11} /> Delayed
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={11} /> On-Time
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ padding: "0.65rem 0.5rem", textAlign: "right" }}>
                        <button
                          onClick={() => handleSelect(row.row_id)}
                          disabled={loadingRowId === row.row_id}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: 6,
                            border: "none",
                            background: "linear-gradient(135deg, #4338CA, #6366F1)",
                            color: "#FFFFFF",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "opacity 0.2s",
                          }}
                        >
                          {loadingRowId === row.row_id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            "Inspect ➔"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with Pagination */}
        <div
          style={{
            padding: "0.85rem 1.5rem",
            borderTop: "1px solid rgba(148, 163, 184, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(15, 23, 42, 0.95)",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
            Showing page {page} of {totalPages} ({total} shipments)
          </span>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "0.4rem 0.75rem",
                borderRadius: 6,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                background: "transparent",
                color: page <= 1 ? "#475569" : "#F8FAFC",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "0.4rem 0.75rem",
                borderRadius: 6,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                background: "transparent",
                color: page >= totalPages ? "#475569" : "#F8FAFC",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
