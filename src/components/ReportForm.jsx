import { useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { LoaderCircle } from "lucide-react";
import { downloadReport } from "../services/reportService";

function parseFileName(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return fallback;
}

const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE;

export default function ReportForm() {
  const { getToken } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);

  const isInvalidRange = useMemo(() => {
    if (!startDate || !endDate) return false;
    return new Date(startDate) > new Date(endDate);
  }, [startDate, endDate]);

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      globalThis.alert("Please select date range");
      return;
    }

    if (isInvalidRange) {
      globalThis.alert("Start date must be before or equal to end date");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken(CLERK_JWT_TEMPLATE ? { template: CLERK_JWT_TEMPLATE } : undefined);
      if (!token) {
        globalThis.alert("Your session has expired. Please sign in again.");
        return;
      }

      const res = await downloadReport({
        startDate,
        endDate,
        format,
        token,
      });

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = globalThis.URL.createObjectURL(blob);

      const suggestedName = parseFileName(
        res.headers?.["content-disposition"],
        `report-${startDate}-to-${endDate}.${format}`
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", suggestedName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      globalThis.alert("Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 460,
        background: "var(--surface)",
        padding: 24,
        borderRadius: 12,
        border: "1px solid var(--db-border)",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
        Generate Report
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
        Choose a date range and export report data in CSV or PDF format.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="report-start-date" style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
          Start Date
        </label>
        <input
          id="report-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid var(--db-border)",
            borderRadius: 10,
            padding: "10px 12px",
            background: "var(--surface-2)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="report-end-date" style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
          End Date
        </label>
        <input
          id="report-end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid var(--db-border)",
            borderRadius: 10,
            padding: "10px 12px",
            background: "var(--surface-2)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label htmlFor="report-format" style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
          Format
        </label>
        <select
          id="report-format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid var(--db-border)",
            borderRadius: 10,
            padding: "10px 12px",
            background: "var(--surface-2)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        >
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      {loading && (
        <p
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--text-secondary)",
            fontSize: 13,
          }}
        >
          <LoaderCircle size={14} style={{ animation: "spin 1s linear infinite" }} />
          Generating report...
        </p>
      )}

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          width: "100%",
          background: "var(--primary)",
          color: "#fff",
          padding: "10px 12px",
          border: "none",
          borderRadius: 10,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.65 : 1,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {loading ? "Downloading..." : "Download Report"}
      </button>

      {isInvalidRange && (
        <p style={{ color: "var(--red)", marginTop: 10, fontSize: 12 }}>
          Start date must be before or equal to end date.
        </p>
      )}
    </div>
  );
}