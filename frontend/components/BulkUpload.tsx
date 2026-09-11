"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";

interface BulkUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function BulkUpload({ onUpload, isLoading }: BulkUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      setSelectedFile(file);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "2rem",
        animation: "fadeInUp 0.6s ease-out",
      }}
    >
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        style={{
          padding: selectedFile ? "1.5rem" : "3rem 2rem",
          borderRadius: 14,
          border: `2px dashed ${
            isDragOver
              ? "#4338CA"
              : selectedFile
              ? "#D4A574"
              : "rgba(212,165,116,0.35)"
          }`,
          background: isDragOver
            ? "rgba(99,102,241,0.04)"
            : selectedFile
            ? "rgba(245,230,211,0.3)"
            : "rgba(253,248,240,0.5)",
          cursor: selectedFile ? "default" : "pointer",
          transition: "all 0.3s ease",
          textAlign: "center",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={handleSelect}
          style={{ display: "none" }}
        />

        {selectedFile ? (
          /* File selected state */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #D4A574, #C48B52)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileSpreadsheet size={22} color="white" />
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#1E1B4B",
                    wordBreak: "break-all",
                  }}
                >
                  {selectedFile.name}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#6B7280",
                    marginTop: 2,
                  }}
                >
                  {formatSize(selectedFile.size)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.2)",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#EF4444",
                  transition: "all 0.2s ease",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Empty drop zone state */
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: isDragOver
                  ? "linear-gradient(135deg, #4338CA, #6366F1)"
                  : "linear-gradient(135deg, #F5E6D3, #ECDCC8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                transition: "all 0.3s ease",
              }}
            >
              <Upload
                size={24}
                color={isDragOver ? "white" : "#8B6914"}
                style={{
                  transition: "all 0.3s ease",
                  transform: isDragOver ? "translateY(-4px)" : "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1E1B4B",
                marginBottom: "0.35rem",
              }}
            >
              {isDragOver
                ? "Drop your file here"
                : "Drag & drop your CSV or XLSX"}
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "#9CA3AF",
              }}
            >
              or{" "}
              <span
                style={{
                  color: "#4338CA",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                click to browse
              </span>{" "}
              · Max 200 rows
            </div>
          </>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "0.85rem",
          }}
        >
          {isLoading ? (
            <>
              <Loader2
                size={18}
                style={{ animation: "spin-slow 1s linear infinite" }}
              />
              Processing...
            </>
          ) : (
            <>
              <Upload size={18} />
              Analyze {selectedFile.name}
            </>
          )}
        </button>
      )}
    </div>
  );
}
