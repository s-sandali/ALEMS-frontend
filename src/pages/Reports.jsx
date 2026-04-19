import ReportForm from "../components/ReportForm";
import { useRole } from "../context/RoleContext";

export default function Reports() {
  const role = useRole();

  if (role !== "Admin") {
    return (
      <div style={{ padding: 32 }}>
        <div
          style={{
            border: "1px solid var(--db-border)",
            borderRadius: 12,
            padding: 20,
            background: "var(--surface)",
            color: "var(--text-secondary)",
          }}
        >
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px 0" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
        Admin Reports
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
        Export performance reports for the selected date range.
      </p>
      <ReportForm />
    </div>
  );
}