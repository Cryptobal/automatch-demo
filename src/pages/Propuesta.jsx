import { useNavigate } from "react-router-dom";

const bg = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #091B2A 0%, #0F2D44 50%, #091B2A 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
  padding: "40px 20px",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
};

export default function Propuesta() {
  const navigate = useNavigate();

  return (
    <div style={bg}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{
        width: 90, height: 90, borderRadius: 22,
        background: "linear-gradient(135deg, #0D9488, #06B6D4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 42, fontWeight: 800, color: "#fff",
        boxShadow: "0 8px 32px rgba(13,148,136,0.35)",
        marginBottom: 28,
        animation: "fadeIn 0.6s ease-out",
      }}>
        A
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 48, fontWeight: 800, color: "#F1F5F9",
        margin: "0 0 8px", letterSpacing: -1,
        animation: "fadeIn 0.6s ease-out 0.1s both",
      }}>
        AutoMatch
      </h1>

      <div style={{
        width: 60, height: 3, borderRadius: 2,
        background: "linear-gradient(90deg, #0D9488, #06B6D4)",
        margin: "0 auto 24px",
        animation: "fadeIn 0.6s ease-out 0.2s both",
      }} />

      {/* Subtitle */}
      <p style={{
        fontSize: 20, color: "#94A3B8", fontWeight: 400,
        margin: "0 0 8px", maxWidth: 500,
        animation: "fadeIn 0.6s ease-out 0.25s both",
      }}>
        Propuesta Comercial
      </p>
      <p style={{
        fontSize: 16, color: "#64748B", fontWeight: 400,
        margin: "0 0 48px", maxWidth: 500,
        animation: "fadeIn 0.6s ease-out 0.3s both",
      }}>
        para Gonzalo Blanco y socios
      </p>

      {/* CTA Button */}
      <button
        onClick={() => navigate("/demo")}
        style={{
          padding: "16px 40px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #0D9488, #06B6D4)",
          color: "#fff",
          fontSize: 18,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(13,148,136,0.4)",
          transition: "all 0.2s ease",
          animation: "fadeIn 0.6s ease-out 0.4s both",
          fontFamily: "inherit",
        }}
        onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(13,148,136,0.5)"; }}
        onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(13,148,136,0.4)"; }}
      >
        Ver Demo en Vivo &rarr;
      </button>

      {/* Feature pills */}
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
        marginTop: 40, animation: "fadeIn 0.6s ease-out 0.5s both",
      }}>
        {["CRM Automotriz", "Matching Inteligente", "Portal de Clientes", "Gestión de Repuestos"].map(f => (
          <span key={f} style={{
            padding: "6px 16px", borderRadius: 20,
            background: "rgba(13,148,136,0.12)", border: "1px solid rgba(13,148,136,0.25)",
            color: "#5EEAD4", fontSize: 13, fontWeight: 500,
          }}>{f}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 24, left: 0, right: 0,
        textAlign: "center", color: "#475569", fontSize: 12,
        animation: "fadeIn 0.6s ease-out 0.6s both",
      }}>
        Desarrollado por LX3.ai &middot; Software Studio + Tech Partner
      </div>
    </div>
  );
}
