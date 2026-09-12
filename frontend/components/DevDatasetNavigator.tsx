"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Dices,
  Table,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  fetchDevRecordById,
  fetchDevRecords,
  type DevRecordDetail,
  type GroundTruthData,
} from "@/lib/api";
import DevTableModal from "./DevTableModal";

interface DevDatasetNavigatorProps {
  currentRecord: DevRecordDetail | null;
  onSelectRecord: (record: DevRecordDetail) => void;
}

const TOTAL_RECORDS = 2908;

export default function DevDatasetNavigator({
  currentRecord,
  onSelectRecord,
}: DevDatasetNavigatorProps) {
  const [rowInput, setRowInput] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "delayed" | "ontime">("all");

  const currentRowId = currentRecord ? currentRecord.row_id : 1;

  // Sync rowInput with currentRecord
  useEffect(() => {
    if (currentRecord) {
      setRowInput(currentRecord.row_id.toString());
    }
  }, [currentRecord]);

  const loadRow = useCallback(
    async (rowId: number) => {
      if (rowId < 1 || rowId > TOTAL_RECORDS) return;
      setLoading(true);
      try {
        const detail = await fetchDevRecordById(rowId);
        onSelectRecord(detail);
      } catch (err) {
        console.error("Failed to load row:", err);
      } finally {
        setLoading(false);
      }
    },
    [onSelectRecord]
  );

  // Load first record on initial mount if not loaded
  useEffect(() => {
    if (!currentRecord) {
      loadRow(1);
    }
  }, [currentRecord, loadRow]);

  const handlePrev = () => {
    const nextId = Math.max(1, currentRowId - 1);
    loadRow(nextId);
  };

  const handleNext = () => {
    const nextId = Math.min(TOTAL_RECORDS, currentRowId + 1);
    loadRow(nextId);
  };

  const handleRandom = async () => {
    if (activeFilter === "all") {
      const randId = Math.floor(Math.random() * TOTAL_RECORDS) + 1;
      loadRow(randId);
    } else {
      // Pick a random record matching the filter
      setLoading(true);
      try {
        const randPage = Math.floor(Math.random() * 10) + 1;
        const res = await fetchDevRecords(randPage, 20, activeFilter);
        if (res.items.length > 0) {
          const picked = res.items[Math.floor(Math.random() * res.items.length)];
          const detail = await fetchDevRecordById(picked.row_id);
          onSelectRecord(detail);
        }
      } catch (err) {
        console.error("Failed to fetch random filtered record:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(rowInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_RECORDS) {
      loadRow(parsed);
    } else {
      setRowInput(currentRowId.toString());
    }
  };

  const handleFilterChange = async (filter: "all" | "delayed" | "ontime") => {
    setActiveFilter(filter);
    setLoading(true);
    try {
      const res = await fetchDevRecords(1, 1, filter);
      if (res.items.length > 0) {
        const detail = await fetchDevRecordById(res.items[0].row_id);
        onSelectRecord(detail);
      }
    } catch (err) {
      console.error("Failed to filter records:", err);
    } finally {
      setLoading(false);
    }
  };

  const gt: GroundTruthData | undefined = currentRecord?.ground_truth;
  const isDelayed = gt ? gt.actual_risk_flag === 1 : false;

  return (
    <>
      <div
        style={{
          borderRadius: 16,
          background: "linear-gradient(135deg, #0F172A, #1E1B4B)",
          border: "1px solid rgba(129, 140, 248, 0.35)",
          boxShadow:
            "0 10px 25px -5px rgba(30, 27, 75, 0.4), 0 0 20px rgba(99, 102, 241, 0.15)",
          color: "#F8FAFC",
          padding: "1.1rem 1.25rem",
          marginBottom: "1.25rem",
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.85rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 20,
                background: "rgba(99, 102, 241, 0.25)",
                color: "#A5B4FC",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
                border: "1px solid rgba(129, 140, 248, 0.4)",
              }}
            >
              <Sparkles size={11} /> DEV BENCHMARK MODE
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#E2E8F0",
              }}
            >
              SCMS Historical Ground Truth
            </span>
          </div>

          <button
            onClick={() => setIsTableModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "0.35rem 0.75rem",
              borderRadius: 8,
              border: "1px solid rgba(129, 140, 248, 0.3)",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#C7D2FE",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Table size={14} />
            <span>Open Table (2,908)</span>
          </button>
        </div>

        {/* Controls Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {/* Stepper controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              onClick={handlePrev}
              disabled={loading || currentRowId <= 1}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(30, 41, 59, 0.7)",
                color: currentRowId <= 1 ? "#475569" : "#F8FAFC",
                cursor: currentRowId <= 1 ? "not-allowed" : "pointer",
              }}
              title="Previous shipment"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Jump to row input */}
            <form
              onSubmit={handleInputSubmit}
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Row</span>
              <input
                type="text"
                value={rowInput}
                onChange={(e) => setRowInput(e.target.value)}
                onBlur={handleInputSubmit}
                style={{
                  width: 54,
                  padding: "0.3rem 0.4rem",
                  borderRadius: 6,
                  border: "1px solid rgba(129, 140, 248, 0.4)",
                  background: "rgba(15, 23, 42, 0.9)",
                  color: "#F8FAFC",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                / {TOTAL_RECORDS.toLocaleString()}
              </span>
            </form>

            <button
              onClick={handleNext}
              disabled={loading || currentRowId >= TOTAL_RECORDS}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(30, 41, 59, 0.7)",
                color: currentRowId >= TOTAL_RECORDS ? "#475569" : "#F8FAFC",
                cursor: currentRowId >= TOTAL_RECORDS ? "not-allowed" : "pointer",
              }}
              title="Next shipment"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={handleRandom}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "0.35rem 0.65rem",
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(30, 41, 59, 0.7)",
                color: "#E2E8F0",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: "0.2rem",
              }}
              title="Pick a random shipment"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Dices size={14} color="#A5B4FC" />
              )}
              <span>Random</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: "flex",
              background: "rgba(15, 23, 42, 0.7)",
              padding: 2,
              borderRadius: 8,
              border: "1px solid rgba(148, 163, 184, 0.15)",
            }}
          >
            {(["all", "delayed", "ontime"] as const).map((mode) => {
              const active = activeFilter === mode;
              const labels = {
                all: "All",
                delayed: "Delayed (201)",
                ontime: "On-Time (2,707)",
              };
              return (
                <button
                  key={mode}
                  onClick={() => handleFilterChange(mode)}
                  style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: 6,
                    border: "none",
                    background: active
                      ? "linear-gradient(135deg, #4338CA, #6366F1)"
                      : "transparent",
                    color: active ? "#FFFFFF" : "#94A3B8",
                    fontSize: "0.74rem",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Ground Truth Badge Preview */}
        {gt && (
          <div
            style={{
              marginTop: "0.85rem",
              padding: "0.6rem 0.85rem",
              borderRadius: 10,
              background: isDelayed
                ? "rgba(239, 68, 68, 0.12)"
                : "rgba(34, 197, 94, 0.12)",
              border: `1px solid ${
                isDelayed ? "rgba(239, 68, 68, 0.25)" : "rgba(34, 197, 94, 0.25)"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              fontSize: "0.78rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {isDelayed ? (
                <AlertTriangle size={15} color="#F87171" />
              ) : (
                <CheckCircle2 size={15} color="#4ADE80" />
              )}
              <span style={{ fontWeight: 700, color: "#F8FAFC" }}>
                Ground Truth Reality:
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: isDelayed ? "#F87171" : "#4ADE80",
                }}
              >
                {isDelayed
                  ? `Delayed (+${gt.actual_delay_days} days)`
                  : `On-Time (${gt.actual_delay_days} days)`}
              </span>
            </div>

            <div style={{ color: "#94A3B8", fontSize: "0.75rem" }}>
              Scheduled: <b style={{ color: "#E2E8F0" }}>{gt.scheduled_date}</b> | Delivered:{" "}
              <b style={{ color: "#E2E8F0" }}>{gt.delivered_date}</b>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Modal */}
      <DevTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onSelectRow={(record) => {
          onSelectRecord(record);
        }}
      />
    </>
  );
}
