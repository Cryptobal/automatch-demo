import { useState } from "react";
import { useMediaQuery } from "../useMediaQuery.js";
import { useData } from "../DataContext.jsx";

const LIGHT = { bg: "#FAFAF9", card: "#fff", accent: "#0E7490", whatsapp: "#25D366", text: "#111827", textSec: "#6B7280", border: "#E5E7EB", shadow: "0 1px 4px rgba(0,0,0,0.05)", pillBg: "#F3F4F6", inputBg: "#fff" };
const DARK = { bg: "#0a0e17", card: "#111827", accent: "#06B6D4", whatsapp: "#25D366", text: "#F9FAFB", textSec: "#9CA3AF", border: "#1F2937", shadow: "0 1px 4px rgba(0,0,0,0.2)", pillBg: "#1F2937", inputBg: "#1F2937" };

const PRICE_RANGES = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Hasta $7M", min: 0, max: 7000000 },
  { label: "$7M - $10M", min: 7000000, max: 10000000 },
  { label: "$10M - $15M", min: 10000000, max: 15000000 },
  { label: "Sobre $15M", min: 15000000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Precio menor", fn: (a, b) => a.precio - b.precio },
  { label: "Precio mayor", fn: (a, b) => b.precio - a.precio },
  { label: "Más reciente", fn: (a, b) => (b.fechaIngreso || "").localeCompare(a.fechaIngreso || "") },
];

const ESTADO_COLORS = { Publicado: "#3B82F6", "Listo para venta": "#22C55E", "En reparación": "#EAB308" };

export default function PortalCliente() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const data = useData();
  const { autos, compradores, matches, loggedInBuyer, addComprador, setLoggedInBuyer, TIPOS, MARCAS, fmt } = data;

  const [dark, setDark] = useState(false);
  const t = dark ? DARK : LIGHT;

  const [screen, setScreen] = useState("catalogo");
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [toast, setToast] = useState(null);

  // Catalogo filters
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [priceRange, setPriceRange] = useState(0);
  const [sortIdx, setSortIdx] = useState(0);

  // Registration form
  const [regForm, setRegForm] = useState({ nombre: "", tel: "", email: "", tipos: [], marcas: [], presMin: "", presMax: "", añoMin: "2020", notifWhatsapp: true, notifEmail: true });
  const [showRegForm, setShowRegForm] = useState(false);

  // Edit mode for profile
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Hidden matches (dismissed)
  const [hiddenMatches, setHiddenMatches] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const buyer = loggedInBuyer ? compradores.find(c => c.id === loggedInBuyer) : null;

  // Filtered autos for catalog
  const visibleAutos = autos.filter(a => ["Publicado", "Listo para venta"].includes(a.estado));
  const filtered = visibleAutos
    .filter(a => {
      if (search && !(a.marca + " " + a.modelo).toLowerCase().includes(search.toLowerCase())) return false;
      if (tipoFilter !== "Todos" && a.tipo !== tipoFilter) return false;
      const r = PRICE_RANGES[priceRange];
      if (a.precio < r.min || a.precio > r.max) return false;
      return true;
    })
    .sort(SORT_OPTIONS[sortIdx].fn);

  // My matches
  const myMatches = buyer ? matches.filter(m => m.compradorId === buyer.id && !hiddenMatches.includes(m.autoId)) : [];

  const openDetail = (auto) => { setSelectedAuto(auto); setScreen("detalle"); };
  const backToCatalog = () => { setSelectedAuto(null); setScreen("catalogo"); };

  const handleRegister = () => {
    if (!regForm.nombre || !regForm.tel || !regForm.email) { showToast("Completa nombre, teléfono y email"); return; }
    if (regForm.tipos.length === 0) { showToast("Selecciona al menos un tipo de vehículo"); return; }
    const newComp = {
      nombre: regForm.nombre,
      tel: regForm.tel,
      email: regForm.email,
      tipos: regForm.tipos,
      marcas: regForm.marcas.length > 0 ? regForm.marcas : ["Toyota"],
      presMin: parseInt(regForm.presMin) || 5000000,
      presMax: parseInt(regForm.presMax) || 18000000,
      añoMin: parseInt(regForm.añoMin) || 2020,
      notifWhatsapp: regForm.notifWhatsapp,
      notifEmail: regForm.notifEmail,
    };
    addComprador(newComp);
    setShowRegForm(false);
    showToast("Perfil creado exitosamente. ¡Bienvenido/a!");
    setScreen("matches");
  };

  const handleSaveEdit = () => {
    setEditMode(false);
    showToast("Preferencias actualizadas");
  };

  // --- Styles ---
  const font = "'DM Sans', system-ui, -apple-system, sans-serif";
  const s = {
    root: { fontFamily: font, background: t.bg, color: t.text, minHeight: "100vh", display: "flex", flexDirection: "column", transition: "background 0.3s, color 0.3s" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${t.border}`, background: t.card, position: "sticky", top: 0, zIndex: 50 },
    headerTitle: { fontSize: 20, fontWeight: 700, color: t.accent, margin: 0 },
    toggleBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 },
    body: { display: "flex", flex: 1, minHeight: 0 },
    sidebar: { width: 200, borderRight: `1px solid ${t.border}`, background: t.card, padding: "24px 0", flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 },
    sideItem: (active) => ({ padding: "10px 20px", cursor: "pointer", background: active ? (dark ? "rgba(6,182,212,0.1)" : "rgba(14,116,144,0.08)") : "transparent", color: active ? t.accent : t.text, fontWeight: active ? 600 : 400, fontSize: 14, border: "none", textAlign: "left", width: "100%", fontFamily: font, borderLeft: active ? `3px solid ${t.accent}` : "3px solid transparent", transition: "all 0.2s" }),
    main: { flex: 1, overflowY: "auto", padding: isDesktop ? 24 : 16 },
    bottomNav: { display: "flex", borderTop: `1px solid ${t.border}`, background: t.card, position: "sticky", bottom: 0, zIndex: 50 },
    bottomItem: (active) => ({ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: active ? 700 : 400, color: active ? t.accent : t.textSec, background: "none", border: "none", cursor: "pointer", fontFamily: font, borderTop: active ? `2px solid ${t.accent}` : "2px solid transparent", transition: "all 0.2s" }),
    card: { background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: t.shadow, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", animation: "fadeIn 0.3s ease" },
    input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 14, outline: "none", fontFamily: font },
    select: { padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.inputBg, color: t.text, fontSize: 13, outline: "none", fontFamily: font },
    btn: (bg, color) => ({ padding: "10px 20px", borderRadius: 8, border: "none", background: bg, color: color || "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: font, transition: "opacity 0.2s" }),
    pill: (active) => ({ padding: "6px 14px", borderRadius: 20, border: active ? `2px solid ${t.accent}` : `1px solid ${t.border}`, background: active ? (dark ? "rgba(6,182,212,0.15)" : "rgba(14,116,144,0.1)") : t.pillBg, color: active ? t.accent : t.textSec, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", fontFamily: font }),
    badge: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: "#fff", background: color }),
    footer: { padding: "12px 16px", textAlign: "center", fontSize: 12, color: t.textSec, borderTop: `1px solid ${t.border}`, background: t.card },
    toast: { position: "fixed", bottom: isDesktop ? 32 : 80, left: "50%", transform: "translateX(-50%)", background: dark ? "#1F2937" : "#111827", color: "#fff", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 999, animation: "slideUp 0.3s ease", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", maxWidth: "90vw", textAlign: "center" },
  };

  // --- Catalog Screen ---
  const renderCatalog = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Search */}
      <input style={s.input} placeholder="Buscar marca o modelo..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Type pills */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 0", WebkitOverflowScrolling: "touch" }}>
        {["Todos", ...TIPOS].map(tp => (
          <button key={tp} style={s.pill(tipoFilter === tp)} onClick={() => setTipoFilter(tp)}>{tp}</button>
        ))}
      </div>

      {/* Price + Sort row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <select style={s.select} value={priceRange} onChange={e => setPriceRange(Number(e.target.value))}>
          {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
        </select>
        <select style={s.select} value={sortIdx} onChange={e => setSortIdx(Number(e.target.value))}>
          {SORT_OPTIONS.map((o, i) => <option key={i} value={i}>{o.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: t.textSec, marginLeft: "auto" }}>{filtered.length} {filtered.length === 1 ? "vehículo encontrado" : "vehículos encontrados"}</span>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr", gap: 16 }}>
        {filtered.map(auto => (
          <div key={auto.id} style={s.card} onClick={() => openDetail(auto)} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadow; }}>
            {/* Image placeholder */}
            <div style={{ height: 120, background: auto.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative" }}>
              {auto.icon}
              <span style={{ ...s.badge(ESTADO_COLORS[auto.estado] || "#6B7280"), position: "absolute", top: 8, right: 8 }}>{auto.estado}</span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{auto.marca} {auto.modelo} {auto.año}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.accent, marginBottom: 8 }}>{fmt(auto.precio)}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: t.pillBg, color: t.textSec }}>{auto.km.toLocaleString("es-CL")} km</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: t.pillBg, color: t.textSec }}>{auto.trans}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: dark ? "rgba(6,182,212,0.12)" : "rgba(14,116,144,0.08)", color: t.accent }}>{auto.tipo}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: dark ? "rgba(6,182,212,0.12)" : "rgba(14,116,144,0.08)", color: t.accent }}>{auto.color}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 16px", color: t.textSec }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p>No se encontraron vehículos con esos filtros</p>
        </div>
      )}

      {/* CTA Banner */}
      {!buyer && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: `linear-gradient(135deg, ${t.accent}, ${dark ? "#0891B2" : "#155E75"})`, color: "#fff", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>¿No encuentras lo que buscas?</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>Regístrate y te avisamos cuando llegue tu auto ideal</div>
          <button style={{ ...s.btn("#fff", t.accent), fontWeight: 700 }} onClick={() => { setScreen("perfil"); setShowRegForm(true); }}>Registrarme</button>
        </div>
      )}
    </div>
  );

  // --- Detail Screen ---
  const renderDetail = () => {
    if (!selectedAuto) return null;
    const auto = selectedAuto;
    return (
      <div style={{ animation: "slideInRight 0.3s ease", maxWidth: 600, margin: "0 auto" }}>
        {/* Back */}
        <button style={{ ...s.btn("transparent", t.accent), padding: "6px 0", marginBottom: 12, fontSize: 14 }} onClick={backToCatalog}>
          ← Volver al catálogo
        </button>

        {/* Large image */}
        <div style={{ height: 220, background: auto.grad, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative", marginBottom: 8 }}>
          {auto.icon}
        </div>
        {/* Carousel dots (visual only) */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? t.accent : t.border }} />
          ))}
        </div>

        {/* Title + badge */}
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>{auto.marca} {auto.modelo} {auto.año}</h2>
        <span style={s.badge(ESTADO_COLORS[auto.estado] || "#6B7280")}>{auto.estado}</span>

        {/* Specs grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
          {[
            { label: "Kilometraje", value: auto.km.toLocaleString("es-CL") + " km" },
            { label: "Transmisión", value: auto.trans },
            { label: "Color", value: auto.color },
            { label: "Año", value: auto.año },
          ].map(sp => (
            <div key={sp.label} style={{ padding: 12, borderRadius: 8, background: t.pillBg, border: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 11, color: t.textSec, marginBottom: 2 }}>{sp.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{sp.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <p style={{ fontSize: 14, lineHeight: 1.6, color: t.textSec, margin: "12px 0" }}>{auto.desc}</p>

        {/* Price */}
        <div style={{ fontSize: 28, fontWeight: 800, color: t.accent, margin: "16px 0" }}>{fmt(auto.precio)}</div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            style={{ ...s.btn(t.whatsapp, "#fff"), display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 16, padding: "14px 20px", borderRadius: 12 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            onClick={() => window.open(`https://wa.me/56912345678?text=${encodeURIComponent(`Hola, me interesa el ${auto.marca} ${auto.modelo} ${auto.año}`)}`, "_blank")}
          >
            Consultar por WhatsApp
          </button>
          <button
            style={{ ...s.btn(dark ? "#1F2937" : "#F3F4F6", t.accent), border: `1px solid ${t.accent}`, borderRadius: 12, padding: "12px 20px" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            onClick={() => showToast("¡Listo! Te contactaremos pronto con más información.")}
          >
            Me interesa, quiero más info
          </button>
        </div>

        {buyer && (
          <p style={{ fontSize: 13, color: t.textSec, marginTop: 16, textAlign: "center", fontStyle: "italic" }}>
            ¿Te interesa este tipo de auto? Lo agregaremos a tus matches automáticamente.
          </p>
        )}
      </div>
    );
  };

  // --- Matches Screen ---
  const renderMatches = () => {
    if (!buyer) {
      return (
        <div style={{ textAlign: "center", padding: "40px 16px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚗💡</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Tus Matches Inteligentes</h2>
          <p style={{ fontSize: 14, color: t.textSec, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 8px" }}>
            Nuestro sistema analiza tu perfil y tus preferencias para conectarte automáticamente con los vehículos que más se ajustan a lo que buscas.
          </p>
          <p style={{ fontSize: 14, color: t.textSec, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 24px" }}>
            Recibirás notificaciones por WhatsApp y email cada vez que ingrese un auto que haga match contigo.
          </p>
          <button style={s.btn(t.accent, "#fff")} onClick={() => { setScreen("perfil"); setShowRegForm(true); }}>Registrarme ahora</button>
        </div>
      );
    }

    if (myMatches.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px 16px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Sin matches por ahora</h3>
          <p style={{ fontSize: 14, color: t.textSec }}>Cuando ingrese un vehículo que coincida con tus preferencias, aparecerá aquí.</p>
        </div>
      );
    }

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Mis Matches</h2>
        <p style={{ fontSize: 13, color: t.textSec, marginBottom: 16 }}>Vehículos que coinciden con tu perfil</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {myMatches.map(match => {
            const auto = autos.find(a => a.id === match.autoId);
            if (!auto) return null;
            const today = new Date().toISOString().split("T")[0];
            const isNew = match.fecha === today;
            return (
              <div key={match.autoId} style={{ ...s.card, cursor: "default", display: "flex", alignItems: isDesktop ? "center" : "flex-start", gap: 14, padding: 14, flexDirection: isDesktop ? "row" : "column", animation: "slideInRight 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                  {/* Circular score */}
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${match.score >= 75 ? "#22C55E" : match.score >= 50 ? "#EAB308" : "#EF4444"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{match.score}%</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{auto.marca} {auto.modelo} {auto.año}</span>
                      {isNew && <span style={s.badge("#EF4444")}>NUEVO</span>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.accent, marginBottom: 4 }}>{fmt(auto.precio)}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {match.reasons.map(r => (
                        <span key={r} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: t.pillBg, color: t.textSec }}>{r}</span>
                      ))}
                    </div>
                    {/* Notification indicator */}
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      {buyer.notifWhatsapp && <span style={{ fontSize: 10, color: t.whatsapp, fontWeight: 500 }}>WhatsApp activo</span>}
                      {buyer.notifEmail && <span style={{ fontSize: 10, color: t.accent, fontWeight: 500 }}>Email activo</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                  <button
                    style={{ ...s.btn(t.whatsapp, "#fff"), padding: "6px 10px", fontSize: 11, borderRadius: 6 }}
                    onClick={() => window.open(`https://wa.me/56912345678?text=${encodeURIComponent(`Hola, me interesa el ${auto.marca} ${auto.modelo}`)}`, "_blank")}
                  >WhatsApp</button>
                  <button style={{ ...s.btn(t.accent, "#fff"), padding: "6px 10px", fontSize: 11, borderRadius: 6 }} onClick={() => openDetail(auto)}>Ver detalle</button>
                  <button style={{ ...s.btn("transparent", t.textSec), padding: "6px 10px", fontSize: 11, border: `1px solid ${t.border}`, borderRadius: 6 }} onClick={() => { setHiddenMatches(prev => [...prev, match.autoId]); showToast("Match descartado"); }}>No me interesa</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Profile / Register Screen ---
  const renderProfile = () => {
    // Logged in view
    if (buyer && !showRegForm) {
      const buyerMatches = matches.filter(m => m.compradorId === buyer.id);
      return (
        <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Mi Perfil</h2>

          <div style={{ ...s.card, cursor: "default", padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{buyer.nombre}</div>
            <div style={{ fontSize: 13, color: t.textSec, marginBottom: 2 }}>{buyer.tel}</div>
            <div style={{ fontSize: 13, color: t.textSec, marginBottom: 12 }}>{buyer.email}</div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 12, borderRadius: 8, background: t.pillBg, flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>{buyerMatches.length}</div>
                <div style={{ fontSize: 11, color: t.textSec }}>Matches</div>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: t.pillBg, flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{buyer.fechaRegistro}</div>
                <div style={{ fontSize: 11, color: t.textSec }}>Registro</div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: t.textSec, marginBottom: 6 }}>Preferencias</div>
              {editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4 }}>Tipos de vehículo</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {TIPOS.map(tp => (
                        <button key={tp} style={s.pill((editForm?.tipos || buyer.tipos).includes(tp))} onClick={() => {
                          setEditForm(prev => {
                            const current = prev?.tipos || [...buyer.tipos];
                            return { ...(prev || {}), tipos: current.includes(tp) ? current.filter(x => x !== tp) : [...current, tp] };
                          });
                        }}>{tp}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4 }}>Marcas de interés</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {MARCAS.map(m => (
                        <button key={m} style={s.pill((editForm?.marcas || buyer.marcas).includes(m))} onClick={() => {
                          setEditForm(prev => {
                            const current = prev?.marcas || [...buyer.marcas];
                            return { ...(prev || {}), marcas: current.includes(m) ? current.filter(x => x !== m) : [...current, m] };
                          });
                        }}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ ...s.btn(t.accent, "#fff"), flex: 1 }} onClick={handleSaveEdit}>Guardar cambios</button>
                    <button style={{ ...s.btn("transparent", t.textSec), border: `1px solid ${t.border}`, flex: 1 }} onClick={() => { setEditMode(false); setEditForm(null); }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: t.textSec, marginBottom: 4 }}>Tipos</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {buyer.tipos.map(tp => <span key={tp} style={s.pill(true)}>{tp}</span>)}
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: t.textSec, marginBottom: 4 }}>Marcas</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {buyer.marcas.map(m => <span key={m} style={s.pill(false)}>{m}</span>)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: t.textSec, marginBottom: 4 }}>Presupuesto: {fmt(buyer.presMin)} - {fmt(buyer.presMax)}</div>
                  <div style={{ fontSize: 13, color: t.textSec, marginBottom: 8 }}>Año mínimo: {buyer.añoMin}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {buyer.notifWhatsapp && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(37,211,102,0.15)", color: t.whatsapp, fontWeight: 500 }}>WhatsApp</span>}
                    {buyer.notifEmail && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: dark ? "rgba(6,182,212,0.15)" : "rgba(14,116,144,0.1)", color: t.accent, fontWeight: 500 }}>Email</span>}
                  </div>
                </>
              )}
            </div>

            {!editMode && (
              <button style={{ ...s.btn("transparent", t.accent), border: `1px solid ${t.accent}`, width: "100%", marginTop: 8 }} onClick={() => { setEditMode(true); setEditForm({ tipos: [...buyer.tipos], marcas: [...buyer.marcas] }); }}>
                Editar preferencias
              </button>
            )}
          </div>

          <button
            style={{ ...s.btn("transparent", "#EF4444"), border: "1px solid #EF4444", width: "100%", fontSize: 13 }}
            onClick={() => { setLoggedInBuyer(null); showToast("Sesión cerrada"); setScreen("catalogo"); }}
          >
            Cerrar sesión
          </button>
        </div>
      );
    }

    // Registration form
    return (
      <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 500, margin: "0 auto" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Crear mi Perfil</h2>
        <p style={{ fontSize: 13, color: t.textSec, marginBottom: 20 }}>Regístrate para recibir matches automáticos y notificaciones</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Nombre */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Nombre completo *</label>
            <input style={{ ...s.input, borderColor: regForm.nombre ? "#22C55E" : t.border }} value={regForm.nombre} onChange={e => setRegForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Juan Pérez" />
          </div>

          {/* Teléfono */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Teléfono WhatsApp *</label>
            <input style={{ ...s.input, borderColor: regForm.tel ? "#22C55E" : t.border }} value={regForm.tel} onChange={e => setRegForm(p => ({ ...p, tel: e.target.value }))} placeholder="+56 9 XXXX XXXX" />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Email *</label>
            <input style={{ ...s.input, borderColor: regForm.email ? "#22C55E" : t.border }} value={regForm.email} onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))} placeholder="tu@email.com" type="email" />
          </div>

          {/* Tipo vehículo */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Tipo de vehículo que buscas *</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TIPOS.map(tp => (
                <button key={tp} style={s.pill(regForm.tipos.includes(tp))} onClick={() => setRegForm(p => ({ ...p, tipos: p.tipos.includes(tp) ? p.tipos.filter(x => x !== tp) : [...p.tipos, tp] }))}>
                  {tp}
                </button>
              ))}
            </div>
          </div>

          {/* Marcas */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block" }}>Marcas de interés</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {MARCAS.map(m => (
                <button key={m} style={{ ...s.pill(regForm.marcas.includes(m)), fontSize: 12 }} onClick={() => setRegForm(p => ({ ...p, marcas: p.marcas.includes(m) ? p.marcas.filter(x => x !== m) : [...p.marcas, m] }))}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Presupuesto */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Presupuesto mín (CLP)</label>
              <input style={s.input} value={regForm.presMin} onChange={e => setRegForm(p => ({ ...p, presMin: e.target.value.replace(/\D/g, "") }))} placeholder="5.000.000" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Presupuesto máx (CLP)</label>
              <input style={s.input} value={regForm.presMax} onChange={e => setRegForm(p => ({ ...p, presMax: e.target.value.replace(/\D/g, "") }))} placeholder="15.000.000" />
            </div>
          </div>

          {/* Año mínimo */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Año mínimo</label>
            <select style={{ ...s.select, width: "100%" }} value={regForm.añoMin} onChange={e => setRegForm(p => ({ ...p, añoMin: e.target.value }))}>
              {Array.from({ length: 11 }, (_, i) => 2015 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Notificaciones */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "block" }}>Canales de notificación</label>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...s.pill(regForm.notifWhatsapp), display: "flex", alignItems: "center", gap: 6 }} onClick={() => setRegForm(p => ({ ...p, notifWhatsapp: !p.notifWhatsapp }))}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: regForm.notifWhatsapp ? t.whatsapp : t.border, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, lineHeight: 1 }}>{regForm.notifWhatsapp ? "✓" : ""}</span>
                WhatsApp
              </button>
              <button style={{ ...s.pill(regForm.notifEmail), display: "flex", alignItems: "center", gap: 6 }} onClick={() => setRegForm(p => ({ ...p, notifEmail: !p.notifEmail }))}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: regForm.notifEmail ? t.accent : t.border, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, lineHeight: 1 }}>{regForm.notifEmail ? "✓" : ""}</span>
                Email
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            style={{ ...s.btn(t.accent, "#fff"), width: "100%", padding: "14px 20px", fontSize: 16, borderRadius: 12, marginTop: 8 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            onClick={handleRegister}
          >
            Crear mi perfil
          </button>

          {/* Demo login shortcut */}
          <div style={{ textAlign: "center", marginTop: 8, paddingBottom: 16 }}>
            <span style={{ fontSize: 12, color: t.textSec }}>Demo: </span>
            <button style={{ background: "none", border: "none", color: t.accent, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: font }} onClick={() => { setLoggedInBuyer(2); showToast("Sesión iniciada como María González"); setShowRegForm(false); }}>
              Entrar como María González
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Navigation items ---
  const navItems = [
    { key: "catalogo", label: "Catálogo", icon: "🏪" },
    { key: "matches", label: "Mis Matches", icon: "💡" },
    { key: "perfil", label: "Perfil", icon: "👤" },
  ];

  const renderScreen = () => {
    switch (screen) {
      case "catalogo": return renderCatalog();
      case "detalle": return renderDetail();
      case "matches": return renderMatches();
      case "perfil": return renderProfile();
      default: return renderCatalog();
    }
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <h1 style={s.headerTitle}>AutoMatch</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {buyer && <span style={{ fontSize: 12, color: t.textSec }}>Hola, {buyer.nombre.split(" ")[0]}</span>}
          <button style={s.toggleBtn} onClick={() => setDark(d => !d)} title={dark ? "Modo claro" : "Modo oscuro"}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={s.body}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <nav style={s.sidebar}>
            {navItems.map(item => (
              <button key={item.key} style={s.sideItem(screen === item.key || (screen === "detalle" && item.key === "catalogo"))} onClick={() => { setScreen(item.key); if (item.key === "catalogo") setSelectedAuto(null); }}>
                {item.icon}  {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Main content */}
        <main style={s.main}>
          {renderScreen()}
        </main>
      </div>

      {/* Footer */}
      <footer style={s.footer}>Desarrollado por LX3.ai · Software Studio + Tech Partner</footer>

      {/* Mobile bottom nav */}
      {!isDesktop && (
        <nav style={s.bottomNav}>
          {navItems.map(item => (
            <button key={item.key} style={s.bottomItem(screen === item.key || (screen === "detalle" && item.key === "catalogo"))} onClick={() => { setScreen(item.key); if (item.key === "catalogo") setSelectedAuto(null); }}>
              <div style={{ fontSize: 18 }}>{item.icon}</div>
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Toast */}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
