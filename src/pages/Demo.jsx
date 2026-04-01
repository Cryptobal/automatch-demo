import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataProvider } from "../DataContext.jsx";
import PortalCliente from "../components/PortalCliente.jsx";
import AdminCRM from "../components/AdminCRM.jsx";

const shell = {
  position: "relative",
  minHeight: "100vh",
  background: "#e5e5e2",
  paddingTop: 52,
};

const bar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  background: "rgba(250, 250, 248, 0.92)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
};

function tabBtn(active) {
  return {
    padding: "8px 18px",
    borderRadius: 10,
    border: active ? "1.5px solid #0e7490" : "1.5px solid #e2e8f0",
    background: active ? "linear-gradient(135deg, #0e7490, #06b6d4)" : "transparent",
    color: active ? "#fff" : "#64748b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    boxShadow: active ? "0 2px 8px rgba(14,116,144,0.25)" : "none",
    transition: "all 0.2s ease",
  };
}

const demoBadge = {
  padding: "3px 10px",
  borderRadius: 6,
  background: "linear-gradient(135deg, #f59e0b, #d97706)",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.5,
  textTransform: "uppercase",
};

const backBtn = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "transparent",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
  transition: "all 0.2s ease",
};

export default function Demo() {
  const [view, setView] = useState("cliente");
  const navigate = useNavigate();

  return (
    <DataProvider>
      <div style={shell}>
        <div style={bar} role="tablist" aria-label="Vista demo">
          <button type="button" style={backBtn} onClick={() => navigate("/")}>
            &larr; Propuesta
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "cliente"}
            style={tabBtn(view === "cliente")}
            onClick={() => setView("cliente")}
          >
            Portal Cliente
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "admin"}
            style={tabBtn(view === "admin")}
            onClick={() => setView("admin")}
          >
            Panel Admin
          </button>
          <span style={demoBadge}>DEMO</span>
        </div>
        {view === "cliente" ? <PortalCliente /> : <AdminCRM />}
      </div>
    </DataProvider>
  );
}
