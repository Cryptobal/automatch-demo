import { useState } from "react";
import { useMediaQuery } from "../useMediaQuery.js";
import { useData } from "../DataContext.jsx";

/* ───────────────── THEMES ───────────────── */
const DARK = {
  bg: "#0a0e17", card: "#111827", border: "#1e293b",
  accent: "#06B6D4", green: "#10B981", yellow: "#F59E0B", red: "#EF4444",
  text: "#f1f5f9", textSec: "#94a3b8", blue: "#3b82f6", gray: "#6b7280",
};
const LIGHT = {
  bg: "#f8fafc", card: "#fff", border: "#e2e8f0",
  accent: "#0e7490", green: "#15803d", yellow: "#92400e", red: "#dc2626",
  text: "#0f172a", textSec: "#64748b", blue: "#2563eb", gray: "#9ca3af",
};

const TABS = [
  { key: "inicio", label: "Inicio", icon: "\u25C8" },
  { key: "inventario", label: "Inventario", icon: "\uD83D\uDE97" },
  { key: "clientes", label: "Clientes", icon: "\uD83D\uDC65" },
  { key: "matches", label: "Matches", icon: "\u26A1" },
  { key: "pipeline", label: "Pipeline", icon: "\u25B8" },
  { key: "repuestos", label: "Repuestos", icon: "\uD83D\uDD27" },
  { key: "canales", label: "Canales", icon: "\uD83D\uDCE1" },
];

const PIPELINE_COLS = ["Notificado", "Interesado", "En negociaci\u00f3n", "Reservado", "Vendido"];
const ESTADO_COLORS = (t) => ({
  Chocado: t.red, "En reparaci\u00f3n": t.yellow, "Listo para venta": t.green, Publicado: t.blue, Vendido: t.gray,
});

const FONT = "'DM Sans', system-ui, -apple-system, sans-serif";

/* helper */
const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));

export default function AdminCRM() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [dark, setDark] = useState(true);
  const t = dark ? DARK : LIGHT;
  const data = useData();
  const {
    autos, compradores, proveedores, solicitudes, solicitudesHistorial,
    pipeline, matches, campa\u00f1as, addAuto, updateAutoEstado, toggleRepuesto,
    updatePublicacion, addComprador, addProveedor, addSolicitud, movePipeline,
    TIPOS, MARCAS, CATALOGO_REPUESTOS, fmt,
  } = data;

  const [tab, setTab] = useState("inicio");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedAutoId, setSelectedAutoId] = useState(null);
  const [selectedClienteId, setSelectedClienteId] = useState(null);
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(null);
  const [inventarioView, setInventarioView] = useState("grid");
  const [repSubTab, setRepSubTab] = useState("solicitudes");
  const [canSubTab, setCanSubTab] = useState("publicaciones");
  const [pipeCol, setPipeCol] = useState("Notificado");
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingPub, setLoadingPub] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // filters
  const [fCliFuente, setFCliFuente] = useState("all");
  const [fCliTipo, setFCliTipo] = useState("all");
  const [fCliPresMin, setFCliPresMin] = useState("");
  const [fCliPresMax, setFCliPresMax] = useState("");
  const [fMatchScoreMin, setFMatchScoreMin] = useState(0);
  const [fMatchAuto, setFMatchAuto] = useState("all");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* ─── styles ─── */
  const s = {
    root: { fontFamily: FONT, background: t.bg, color: t.text, minHeight: "100vh", display: "flex", flexDirection: "column" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${t.border}`, background: t.card, position: "sticky", top: 0, zIndex: 50 },
    headerTitle: { fontSize: 18, fontWeight: 700, color: t.accent, letterSpacing: "-0.02em" },
    toggle: { background: "none", border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: t.text, fontSize: 14 },
    body: { display: "flex", flex: 1, overflow: "hidden" },
    sidebar: { width: 210, borderRight: `1px solid ${t.border}`, background: t.card, padding: "16px 0", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, overflowY: "auto" },
    sideItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", cursor: "pointer", background: active ? (dark ? "rgba(6,182,212,0.12)" : "rgba(14,116,144,0.08)") : "transparent", color: active ? t.accent : t.textSec, fontWeight: active ? 600 : 400, fontSize: 14, border: "none", width: "100%", textAlign: "left", borderRight: active ? `3px solid ${t.accent}` : "3px solid transparent", transition: "all .15s", fontFamily: FONT }),
    main: { flex: 1, overflowY: "auto", padding: isDesktop ? 24 : 16, paddingBottom: isDesktop ? 24 : 90 },
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", background: t.card, borderTop: `1px solid ${t.border}`, zIndex: 50, padding: "6px 0 env(safe-area-inset-bottom, 4px) 0" },
    bottomItem: (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 0", cursor: "pointer", background: "none", border: "none", color: active ? t.accent : t.textSec, fontSize: 10, fontWeight: active ? 600 : 400, fontFamily: FONT }),
    card: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, animation: "fadeIn .3s ease" },
    btn: (color = t.accent) => ({ background: color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: FONT }),
    btnOutline: (color = t.accent) => ({ background: "transparent", color, border: `1px solid ${color}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: FONT }),
    pill: (active, color = t.accent) => ({ background: active ? color : "transparent", color: active ? "#fff" : color, border: `1px solid ${color}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: FONT }),
    badge: (color) => ({ display: "inline-block", background: color + "22", color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }),
    input: { background: dark ? "#1a2332" : "#f1f5f9", border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px", color: t.text, fontSize: 13, fontFamily: FONT, width: "100%" },
    select: { background: dark ? "#1a2332" : "#f1f5f9", border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 12px", color: t.text, fontSize: 13, fontFamily: FONT },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" },
    modalBox: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, width: "90%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", animation: "slideUp .3s ease" },
    footer: { textAlign: "center", padding: "16px 20px", fontSize: 12, color: t.textSec, borderTop: `1px solid ${t.border}`, background: t.card },
    toastStyle: { position: "fixed", bottom: isDesktop ? 32 : 100, left: "50%", transform: "translateX(-50%)", background: t.accent, color: "#fff", padding: "10px 24px", borderRadius: 10, fontWeight: 600, fontSize: 13, zIndex: 200, animation: "slideUp .3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", whiteSpace: "nowrap" },
    grid2: { display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12 },
    grid4: { display: "grid", gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 12 },
    sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12, marginTop: 20, color: t.text },
    label: { fontSize: 12, fontWeight: 600, color: t.textSec, marginBottom: 4, display: "block" },
  };

  /* ───────────── LOOKUP HELPERS ───────────── */
  const autoById = (id) => autos.find((a) => a.id === id);
  const compById = (id) => compradores.find((c) => c.id === id);
  const provById = (id) => proveedores.find((p) => p.id === id);
  const autoName = (a) => a ? `${a.icon} ${a.marca} ${a.modelo} ${a.a\u00f1o}` : "---";

  /* ───────────── MODAL: ADD AUTO ───────────── */
  const AddAutoModal = () => {
    const [f, setF] = useState({ marca: MARCAS[0], modelo: "", a\u00f1o: 2023, tipo: TIPOS[0], precio: "", km: "", color: "", trans: "Autom\u00e1tica", costoCompra: "" });
    const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const submit = () => {
      if (!f.modelo || !f.precio) { showToast("Completa los campos requeridos"); return; }
      addAuto({
        marca: f.marca, modelo: f.modelo, a\u00f1o: Number(f.a\u00f1o), tipo: f.tipo,
        precio: Number(f.precio), km: Number(f.km) || 0, color: f.color || "Blanco",
        trans: f.trans, estado: "Chocado", icon: f.tipo === "Pickup" ? "\uD83D\uDEFB" : "\uD83D\uDE97",
        grad: "linear-gradient(135deg,#374151,#6b7280)", costoCompra: Number(f.costoCompra) || 0,
        costoRep: 0, desc: "Reci\u00e9n ingresado.", fechaIngreso: "2026-04-01",
        repuestos: [], publicaciones: [
          { canal: "MercadoLibre", estado: "No publicado", fecha: null },
          { canal: "Facebook", estado: "No publicado", fecha: null },
          { canal: "Yapo", estado: "No publicado", fecha: null },
        ],
      });
      setModal(null);
      showToast("Auto agregado correctamente");
    };
    return (
      <div style={s.overlay} onClick={() => setModal(null)}>
        <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: "0 0 16px", color: t.accent }}>Agregar Auto</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={s.label}>Marca</label><select style={{ ...s.select, width: "100%" }} value={f.marca} onChange={(e) => up("marca", e.target.value)}>{MARCAS.map((m) => <option key={m}>{m}</option>)}</select></div>
            <div><label style={s.label}>Modelo *</label><input style={s.input} value={f.modelo} onChange={(e) => up("modelo", e.target.value)} /></div>
            <div><label style={s.label}>A\u00f1o</label><input style={s.input} type="number" value={f.a\u00f1o} onChange={(e) => up("a\u00f1o", e.target.value)} /></div>
            <div><label style={s.label}>Tipo</label><select style={{ ...s.select, width: "100%" }} value={f.tipo} onChange={(e) => up("tipo", e.target.value)}>{TIPOS.map((tp) => <option key={tp}>{tp}</option>)}</select></div>
            <div><label style={s.label}>Precio venta *</label><input style={s.input} type="number" value={f.precio} onChange={(e) => up("precio", e.target.value)} /></div>
            <div><label style={s.label}>Kil\u00f3metros</label><input style={s.input} type="number" value={f.km} onChange={(e) => up("km", e.target.value)} /></div>
            <div><label style={s.label}>Color</label><input style={s.input} value={f.color} onChange={(e) => up("color", e.target.value)} /></div>
            <div><label style={s.label}>Transmisi\u00f3n</label><select style={{ ...s.select, width: "100%" }} value={f.trans} onChange={(e) => up("trans", e.target.value)}><option>Autom\u00e1tica</option><option>Manual</option></select></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={s.label}>Costo compra</label><input style={s.input} type="number" value={f.costoCompra} onChange={(e) => up("costoCompra", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <button style={s.btnOutline(t.textSec)} onClick={() => setModal(null)}>Cancelar</button>
            <button style={s.btn(t.accent)} onClick={submit}>Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  /* ───────────── MODAL: ADD PROVEEDOR ───────────── */
  const AddProvModal = () => {
    const [f, setF] = useState({ nombre: "", tel: "", email: "", ubicacion: "", especialidad: [], rating: 4, tiempoResp: "4h" });
    const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const toggleEsp = (m) => setF((p) => ({ ...p, especialidad: p.especialidad.includes(m) ? p.especialidad.filter((x) => x !== m) : [...p.especialidad, m] }));
    const submit = () => {
      if (!f.nombre) { showToast("Ingresa el nombre"); return; }
      addProveedor({ ...f });
      setModal(null);
      showToast("Proveedor agregado");
    };
    return (
      <div style={s.overlay} onClick={() => setModal(null)}>
        <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: "0 0 16px", color: t.accent }}>Agregar Proveedor</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><label style={s.label}>Nombre *</label><input style={s.input} value={f.nombre} onChange={(e) => up("nombre", e.target.value)} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={s.label}>Tel\u00e9fono</label><input style={s.input} value={f.tel} onChange={(e) => up("tel", e.target.value)} /></div>
              <div><label style={s.label}>Email</label><input style={s.input} value={f.email} onChange={(e) => up("email", e.target.value)} /></div>
            </div>
            <div><label style={s.label}>Ubicaci\u00f3n</label><input style={s.input} value={f.ubicacion} onChange={(e) => up("ubicacion", e.target.value)} /></div>
            <div><label style={s.label}>Especialidad (marcas)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {MARCAS.map((m) => <button key={m} style={s.pill(f.especialidad.includes(m), t.accent)} onClick={() => toggleEsp(m)}>{m}</button>)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={s.label}>Rating (1-5)</label><input style={s.input} type="number" min={1} max={5} value={f.rating} onChange={(e) => up("rating", Number(e.target.value))} /></div>
              <div><label style={s.label}>Tiempo resp.</label><input style={s.input} value={f.tiempoResp} onChange={(e) => up("tiempoResp", e.target.value)} /></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <button style={s.btnOutline(t.textSec)} onClick={() => setModal(null)}>Cancelar</button>
            <button style={s.btn(t.accent)} onClick={submit}>Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  /* ───────────── MODAL: NUEVA SOLICITUD ───────────── */
  const NuevaSolModal = () => {
    const autosRepair = autos.filter((a) => ["Chocado", "En reparaci\u00f3n"].includes(a.estado));
    const [selAuto, setSelAuto] = useState(autosRepair[0]?.id || "");
    const [selPiezas, setSelPiezas] = useState([]);
    const [selProvs, setSelProvs] = useState([]);
    const toggleP = (p) => setSelPiezas((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
    const togglePr = (id) => setSelProvs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const submit = () => {
      if (!selAuto || selPiezas.length === 0 || selProvs.length === 0) { showToast("Selecciona auto, piezas y proveedores"); return; }
      addSolicitud({
        autoId: Number(selAuto),
        piezas: selPiezas.map((p) => ({ nombre: p, cotizado: false, comprado: false })),
        proveedoresIds: selProvs,
        estado: "Enviada",
        fecha: "2026-04-01",
      });
      setModal(null);
      showToast(`WhatsApp enviado a ${selProvs.length} proveedores`);
    };
    return (
      <div style={s.overlay} onClick={() => setModal(null)}>
        <div style={{ ...s.modalBox, maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: "0 0 16px", color: t.accent }}>Nueva Solicitud de Repuestos</h3>
          <div><label style={s.label}>Auto</label>
            <select style={{ ...s.select, width: "100%", marginBottom: 12 }} value={selAuto} onChange={(e) => setSelAuto(e.target.value)}>
              {autosRepair.map((a) => <option key={a.id} value={a.id}>{autoName(a)}</option>)}
            </select>
          </div>
          <div><label style={s.label}>Piezas</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {CATALOGO_REPUESTOS.map((p) => <button key={p} style={s.pill(selPiezas.includes(p), t.accent)} onClick={() => toggleP(p)}>{p}</button>)}
            </div>
          </div>
          <div><label style={s.label}>Proveedores</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {proveedores.map((p) => <button key={p.id} style={s.pill(selProvs.includes(p.id), t.green)} onClick={() => togglePr(p.id)}>{p.nombre}</button>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={s.btnOutline(t.textSec)} onClick={() => setModal(null)}>Cancelar</button>
            <button style={s.btn(t.green)} onClick={submit}>Disparar a todos</button>
          </div>
        </div>
      </div>
    );
  };

  /* ───────────── MODAL: GENERAR AVISO ───────────── */
  const GenAvisoModal = ({ auto, canal }) => {
    const txt = `${auto.marca} ${auto.modelo} ${auto.a\u00f1o} - ${auto.tipo}\n\nPrecio: ${fmt(auto.precio)}\nKm: ${new Intl.NumberFormat("es-CL").format(auto.km)} km\nColor: ${auto.color}\nTransmisi\u00f3n: ${auto.trans}\n\n${auto.desc}\n\nAutoMatch - Autos semi-nuevos a 50-60% del valor de mercado\nCont\u00e1ctanos por WhatsApp`;
    return (
      <div style={s.overlay} onClick={() => setModal(null)}>
        <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: "0 0 16px", color: t.accent }}>Aviso para {canal}</h3>
          <div style={{ background: dark ? "#1a2332" : "#f1f5f9", borderRadius: 8, padding: 16, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6, color: t.text, marginBottom: 12 }}>{txt}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={s.btnOutline(t.textSec)} onClick={() => setModal(null)}>Cerrar</button>
            <button style={s.btn(t.accent)} onClick={() => { navigator.clipboard?.writeText(txt); showToast("Copiado al portapapeles"); }}>Copiar</button>
          </div>
        </div>
      </div>
    );
  };

  /* ───────────── MODAL: NUEVA CAMPA\u00d1A ───────────── */
  const NuevaCampModal = () => {
    const emailTpl = `Estimado/a,\n\nLe escribimos de AutoMatch, su proveedor de confianza en veh\u00edculos semi-nuevos restaurados.\n\nTenemos nuevas unidades disponibles a precios de 50-60% del valor de mercado:\n\n${autos.filter(a => ["Publicado", "Listo para venta"].includes(a.estado)).map(a => `- ${a.marca} ${a.modelo} ${a.a\u00f1o}: ${fmt(a.precio)}`).join("\n")}\n\nCont\u00e1ctenos para m\u00e1s informaci\u00f3n.\n\nSaludos,\nEquipo AutoMatch`;
    return (
      <div style={s.overlay} onClick={() => setModal(null)}>
        <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: "0 0 16px", color: t.accent }}>Plantilla de Campa\u00f1a</h3>
          <div style={{ background: dark ? "#1a2332" : "#f1f5f9", borderRadius: 8, padding: 16, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6, color: t.text, marginBottom: 12 }}>{emailTpl}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={s.btnOutline(t.textSec)} onClick={() => setModal(null)}>Cerrar</button>
            <button style={s.btn(t.accent)} onClick={() => { navigator.clipboard?.writeText(emailTpl); showToast("Plantilla copiada"); }}>Copiar</button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     SCREEN: DASHBOARD (Inicio)
     ═══════════════════════════════════════════════════════════ */
  const Dashboard = () => {
    const stockCount = autos.filter((a) => a.estado !== "Vendido").length;
    const portalCompradores = compradores.filter((c) => c.fuente === "Portal");
    const top5 = matches.slice(0, 5);
    const today = "2026-04-01";
    const alertAutos = autos.filter((a) => a.estado !== "Vendido" && daysBetween(a.fechaIngreso, today) > 30);
    const pipelineCounts = PIPELINE_COLS.map((col) => ({ col, count: (pipeline[col] || []).length }));

    return (
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Dashboard</h2>
        {/* stat cards */}
        <div style={s.grid4}>
          {[
            { label: "Autos en stock", val: stockCount, color: t.accent },
            { label: "Compradores activos", val: compradores.length, color: t.blue },
            { label: "Matches activos", val: matches.length, color: t.yellow },
            { label: "Venta del mes", val: fmt(13200000), color: t.green },
          ].map((c, i) => (
            <div key={i} style={{ ...s.card, borderTop: `3px solid ${c.color}` }}>
              <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        {/* Nuevos del portal */}
        <h3 style={s.sectionTitle}>Nuevos del Portal</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {portalCompradores.slice(-4).reverse().map((c) => (
            <div key={c.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{c.nombre[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: t.textSec }}>{c.marcas.join(", ")} &middot; {fmt(c.presMin)} - {fmt(c.presMax)}</div>
              </div>
              <span style={s.badge(t.green)}>Portal</span>
            </div>
          ))}
        </div>

        {/* Ultimos matches */}
        <h3 style={s.sectionTitle}>{"\u00DA"}ltimos Matches</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {top5.map((m, i) => {
            const auto = autoById(m.autoId);
            const comp = compById(m.compradorId);
            return (
              <div key={i} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.score >= 80 ? t.green : m.score >= 60 ? t.yellow : t.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{m.score}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{auto ? autoName(auto) : "---"}</div>
                  <div style={{ fontSize: 12, color: t.textSec }}>{comp?.nombre} &middot; {m.reasons.join(", ")}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mini pipeline */}
        <h3 style={s.sectionTitle}>Pipeline</h3>
        <div style={s.card}>
          {pipelineCounts.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 120, fontSize: 12, color: t.textSec, flexShrink: 0 }}>{p.col}</div>
              <div style={{ flex: 1, height: 18, background: dark ? "#1a2332" : "#e2e8f0", borderRadius: 9, overflow: "hidden" }}>
                <div style={{ width: `${Math.max(p.count * 20, 8)}%`, height: "100%", background: t.accent, borderRadius: 9, transition: "width .3s" }} />
              </div>
              <div style={{ width: 24, textAlign: "right", fontSize: 13, fontWeight: 700 }}>{p.count}</div>
            </div>
          ))}
        </div>

        {/* Alertas */}
        <h3 style={s.sectionTitle}>Alertas</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alertAutos.map((a) => (
            <div key={a.id} style={{ ...s.card, borderLeft: `3px solid ${t.red}`, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{autoName(a)}</div>
              <div style={{ fontSize: 12, color: t.red }}>M{"\u00E1"}s de 30 d{"\u00ED"}as en estado &ldquo;{a.estado}&rdquo; (ingreso: {a.fechaIngreso})</div>
            </div>
          ))}
          {matches.filter((m) => {
            const inPipe = PIPELINE_COLS.some((col) => (pipeline[col] || []).some((p) => p.autoId === m.autoId && p.compradorId === m.compradorId));
            return !inPipe;
          }).slice(0, 3).map((m, i) => (
            <div key={`ma${i}`} style={{ ...s.card, borderLeft: `3px solid ${t.yellow}`, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Match sin gestionar</div>
              <div style={{ fontSize: 12, color: t.yellow }}>{autoName(autoById(m.autoId))} {"\u2194"} {compById(m.compradorId)?.nombre} (Score: {m.score})</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     SCREEN: INVENTARIO
     ═══════════════════════════════════════════════════════════ */
  const Inventario = () => {
    const selAuto = selectedAutoId ? autoById(selectedAutoId) : null;
    const estadoC = ESTADO_COLORS(t);

    /* ── Detail view ── */
    if (selAuto) {
      const totalInv = selAuto.costoCompra + selAuto.costoRep;
      const margen = selAuto.precio - totalInv;
      const autoMatches = matches.filter((m) => m.autoId === selAuto.id);
      const estados = ["Chocado", "En reparaci\u00f3n", "Listo para venta", "Publicado", "Vendido"];
      const currIdx = estados.indexOf(selAuto.estado);

      return (
        <div>
          <button style={{ ...s.btnOutline(t.textSec), marginBottom: 16 }} onClick={() => setSelectedAutoId(null)}>{"\u2190"} Volver</button>
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={{ background: selAuto.grad, borderRadius: 8, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, marginBottom: 16 }}>{selAuto.icon}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{selAuto.marca} {selAuto.modelo} {selAuto.a\u00f1o}</h2>
              <span style={s.badge(estadoC[selAuto.estado] || t.gray)}>{selAuto.estado}</span>
            </div>
            <div style={{ fontSize: 13, color: t.textSec, lineHeight: 1.6 }}>{selAuto.desc}</div>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10, marginTop: 12, fontSize: 13 }}>
              <div><span style={{ color: t.textSec }}>Precio:</span> <b>{fmt(selAuto.precio)}</b></div>
              <div><span style={{ color: t.textSec }}>Km:</span> <b>{new Intl.NumberFormat("es-CL").format(selAuto.km)}</b></div>
              <div><span style={{ color: t.textSec }}>Color:</span> <b>{selAuto.color}</b></div>
              <div><span style={{ color: t.textSec }}>Trans:</span> <b>{selAuto.trans}</b></div>
              <div><span style={{ color: t.textSec }}>Tipo:</span> <b>{selAuto.tipo}</b></div>
              <div><span style={{ color: t.textSec }}>Ingreso:</span> <b>{selAuto.fechaIngreso}</b></div>
            </div>
          </div>

          {/* Costos */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>Costos</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
              <div>Precio compra</div><div style={{ textAlign: "right", fontWeight: 600 }}>{fmt(selAuto.costoCompra)}</div>
              <div>Costo reparaci{"\u00F3"}n</div><div style={{ textAlign: "right", fontWeight: 600 }}>{fmt(selAuto.costoRep)}</div>
              <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 6, fontWeight: 700 }}>Total invertido</div>
              <div style={{ textAlign: "right", borderTop: `1px solid ${t.border}`, paddingTop: 6, fontWeight: 700 }}>{fmt(totalInv)}</div>
              <div>Precio venta</div><div style={{ textAlign: "right", fontWeight: 600 }}>{fmt(selAuto.precio)}</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>MARGEN</div>
              <div style={{ textAlign: "right", fontWeight: 800, fontSize: 14, color: margen >= 0 ? t.green : t.red }}>{fmt(margen)}</div>
            </div>
          </div>

          {/* Repuestos */}
          {selAuto.repuestos.length > 0 && (
            <div style={{ ...s.card, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>Repuestos necesarios</h3>
              {selAuto.repuestos.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < selAuto.repuestos.length - 1 ? `1px solid ${t.border}` : "none" }}>
                  <input type="checkbox" checked={r.estado === "Recibido"} onChange={() => toggleRepuesto(selAuto.id, r.nombre)} style={{ accentColor: t.green, cursor: "pointer" }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{r.nombre}</span>
                  <span style={s.badge(r.estado === "Recibido" ? t.green : t.yellow)}>{r.estado === "Recibido" ? "Recibido" : "Pendiente"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matches compatibles */}
          {autoMatches.length > 0 && (
            <div style={{ ...s.card, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>Matches compatibles</h3>
              {autoMatches.map((m, i) => {
                const comp = compById(m.compradorId);
                return comp ? (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < autoMatches.length - 1 ? `1px solid ${t.border}` : "none", flexWrap: "wrap" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.score >= 80 ? t.green : m.score >= 60 ? t.yellow : t.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{m.score}</div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{comp.nombre}</div>
                      <div style={{ fontSize: 11, color: t.textSec }}>{m.reasons.join(", ")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ ...s.btn(t.green), padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`WhatsApp enviado a ${comp.nombre}`)}>WhatsApp</button>
                      <button style={{ ...s.btn(t.blue), padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Email enviado a ${comp.nombre}`)}>Email</button>
                      <button style={{ ...s.btn(t.yellow), padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Llamando a ${comp.nombre}...`)}>Llamar</button>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {/* Publicaciones */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>Publicaciones</h3>
            {selAuto.publicaciones.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < selAuto.publicaciones.length - 1 ? `1px solid ${t.border}` : "none" }}>
                <span style={{ fontSize: 16 }}>{p.estado === "Publicado" || p.estado === "Vendido" ? "\u2705" : p.estado === "Pendiente" ? "\u23F3" : "\u274C"}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{p.canal}</span>
                <span style={{ fontSize: 12, color: t.textSec }}>{p.estado}</span>
                {p.fecha && <span style={{ fontSize: 11, color: t.textSec }}>{p.fecha}</span>}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>Timeline de estados</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {estados.map((est, i) => {
                const reached = i <= currIdx;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: reached ? (estadoC[est] || t.accent) : (dark ? "#1a2332" : "#e2e8f0"), display: "flex", alignItems: "center", justifyContent: "center", color: reached ? "#fff" : t.textSec, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{reached ? "\u2713" : i + 1}</div>
                    {i < estados.length - 1 && <div style={{ flex: 1, height: 3, background: reached && i < currIdx ? (estadoC[est] || t.accent) : (dark ? "#1a2332" : "#e2e8f0") }} />}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", marginTop: 6 }}>
              {estados.map((est, i) => <div key={i} style={{ flex: 1, fontSize: 9, textAlign: "center", color: i <= currIdx ? t.text : t.textSec }}>{est}</div>)}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={s.btn(t.accent)} onClick={() => showToast("Publicaci\u00f3n iniciada en todos los canales")}>Publicar</button>
            <button style={s.btn(t.green)} onClick={() => showToast(`Notificaci\u00f3n enviada a ${autoMatches.length} matches`)}>Notificar matches</button>
          </div>
        </div>
      );
    }

    /* ── List / Grid view ── */
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Inventario</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.pill(inventarioView === "grid")} onClick={() => setInventarioView("grid")}>{"\u25A6"} Grid</button>
            <button style={s.pill(inventarioView === "list")} onClick={() => setInventarioView("list")}>{"\u2630"} Lista</button>
            <button style={s.btn(t.accent)} onClick={() => setModal("addAuto")}>+ Agregar Auto</button>
          </div>
        </div>
        <div style={inventarioView === "grid" ? { display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: 12 } : { display: "flex", flexDirection: "column", gap: 10 }}>
          {autos.map((a) => (
            <div key={a.id} style={{ ...s.card, cursor: "pointer", transition: "transform .15s", padding: inventarioView === "list" ? 12 : 16 }} onClick={() => setSelectedAutoId(a.id)}>
              {inventarioView === "grid" && (
                <div style={{ background: a.grad, borderRadius: 8, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {inventarioView === "list" && <span style={{ fontSize: 24 }}>{a.icon}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.marca} {a.modelo} {a.a\u00f1o}</div>
                  <div style={{ fontSize: 12, color: t.textSec }}>{fmt(a.precio)} &middot; {new Intl.NumberFormat("es-CL").format(a.km)} km</div>
                </div>
                <span style={s.badge(estadoC[a.estado] || t.gray)}>{a.estado}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     SCREEN: CLIENTES
     ═══════════════════════════════════════════════════════════ */
  const Clientes = () => {
    const fuenteColors = { Portal: t.green, Manual: t.blue, WhatsApp: "#166534" };
    let filtered = [...compradores];
    if (fCliFuente !== "all") filtered = filtered.filter((c) => c.fuente === fCliFuente);
    if (fCliTipo !== "all") filtered = filtered.filter((c) => c.tipos.includes(fCliTipo));
    if (fCliPresMin) filtered = filtered.filter((c) => c.presMax >= Number(fCliPresMin));
    if (fCliPresMax) filtered = filtered.filter((c) => c.presMin <= Number(fCliPresMax));

    const interactions = [
      "Consult\u00f3 por Tucson 2020 - hace 3 d\u00edas",
      "Respondi\u00f3 WhatsApp sobre Hilux - hace 5 d\u00edas",
      "Abri\u00f3 email de nuevos veh\u00edculos - hace 1 semana",
    ];

    /* ── Detail view ── */
    if (selectedClienteId) {
      const cli = compById(selectedClienteId);
      if (!cli) { setSelectedClienteId(null); return null; }
      const cliMatches = matches.filter((m) => m.compradorId === cli.id);
      return (
        <div>
          <button style={{ ...s.btnOutline(t.textSec), marginBottom: 16 }} onClick={() => setSelectedClienteId(null)}>{"\u2190"} Volver</button>
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20, flexShrink: 0 }}>{cli.nombre[0]}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>{cli.nombre}</h2>
                <span style={s.badge(fuenteColors[cli.fuente] || t.gray)}>{cli.fuente}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 8, fontSize: 13, marginBottom: 16 }}>
              <div><span style={{ color: t.textSec }}>Tel{"\u00E9"}fono:</span> {cli.tel}</div>
              <div><span style={{ color: t.textSec }}>Email:</span> {cli.email}</div>
              <div><span style={{ color: t.textSec }}>Presupuesto:</span> {fmt(cli.presMin)} - {fmt(cli.presMax)}</div>
              <div><span style={{ color: t.textSec }}>A{"\u00F1"}o m{"\u00ED"}n:</span> {cli.a\u00f1oMin}</div>
              <div><span style={{ color: t.textSec }}>Registro:</span> {cli.fechaRegistro}</div>
              <div><span style={{ color: t.textSec }}>Notif:</span> {[cli.notifWhatsapp && "WhatsApp", cli.notifEmail && "Email"].filter(Boolean).join(", ")}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Preferencias</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cli.marcas.map((m) => <span key={m} style={s.badge(t.accent)}>{m}</span>)}
                {cli.tipos.map((tp) => <span key={tp} style={s.badge(t.blue)}>{tp}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <button style={s.btn(t.green)} onClick={() => showToast(`WhatsApp enviado a ${cli.nombre}`)}>WhatsApp</button>
              <button style={s.btn(t.blue)} onClick={() => showToast(`Email enviado a ${cli.nombre}`)}>Email</button>
              <button style={s.btn(t.yellow)} onClick={() => showToast(`Llamando a ${cli.nombre}...`)}>Llamar</button>
            </div>
          </div>

          {cliMatches.length > 0 && (
            <div style={{ ...s.card, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>Matches</h3>
              {cliMatches.map((m, i) => {
                const auto = autoById(m.autoId);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < cliMatches.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.score >= 80 ? t.green : m.score >= 60 ? t.yellow : t.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{m.score}</div>
                    <div style={{ flex: 1, fontSize: 13 }}>{auto ? autoName(auto) : "---"}</div>
                    <div style={{ fontSize: 11, color: t.textSec }}>{m.reasons.join(", ")}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={s.card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>{"\u00DA"}ltimas interacciones</h3>
            {interactions.map((it, i) => (
              <div key={i} style={{ padding: "6px 0", borderBottom: i < interactions.length - 1 ? `1px solid ${t.border}` : "none", fontSize: 13, color: t.textSec }}>{it}</div>
            ))}
          </div>
        </div>
      );
    }

    /* ── List view ── */
    return (
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Clientes</h2>
        <div style={{ ...s.card, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <div><label style={s.label}>Fuente</label><select style={s.select} value={fCliFuente} onChange={(e) => setFCliFuente(e.target.value)}><option value="all">Todas</option><option>Portal</option><option>Manual</option><option>WhatsApp</option></select></div>
          <div><label style={s.label}>Tipo buscado</label><select style={s.select} value={fCliTipo} onChange={(e) => setFCliTipo(e.target.value)}><option value="all">Todos</option>{TIPOS.map((tp) => <option key={tp}>{tp}</option>)}</select></div>
          <div><label style={s.label}>Pres. m{"\u00ED"}n</label><input style={{ ...s.input, width: 120 }} type="number" placeholder="Min" value={fCliPresMin} onChange={(e) => setFCliPresMin(e.target.value)} /></div>
          <div><label style={s.label}>Pres. m{"\u00E1"}x</label><input style={{ ...s.input, width: 120 }} type="number" placeholder="Max" value={fCliPresMax} onChange={(e) => setFCliPresMax(e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, padding: 12, cursor: "pointer" }} onClick={() => setSelectedClienteId(c.id)}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{c.nombre[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: t.textSec }}>{c.tel} &middot; {c.marcas.join(", ")} &middot; {fmt(c.presMin)}-{fmt(c.presMax)}</div>
              </div>
              <span style={s.badge(fuenteColors[c.fuente] || t.gray)}>{c.fuente}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     SCREEN: MATCHES
     ═══════════════════════════════════════════════════════════ */
  const MatchesScreen = () => {
    let filtered = [...matches];
    if (fMatchScoreMin > 0) filtered = filtered.filter((m) => m.score >= fMatchScoreMin);
    if (fMatchAuto !== "all") filtered = filtered.filter((m) => m.autoId === Number(fMatchAuto));

    /* ── Detail view ── */
    if (selectedMatchIdx !== null) {
      const m = matches[selectedMatchIdx];
      if (!m) { setSelectedMatchIdx(null); return null; }
      const auto = autoById(m.autoId);
      const comp = compById(m.compradorId);
      return (
        <div>
          <button style={{ ...s.btnOutline(t.textSec), marginBottom: 16 }} onClick={() => setSelectedMatchIdx(null)}>{"\u2190"} Volver</button>
          <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Detalle de Match</h2>
          <div style={s.grid2}>
            <div style={s.card}>
              <h3 style={{ margin: "0 0 10px", fontSize: 15, color: t.accent }}>Auto</h3>
              {auto && <>
                <div style={{ background: auto.grad, borderRadius: 8, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 10 }}>{auto.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{auto.marca} {auto.modelo} {auto.a\u00f1o}</div>
                <div style={{ fontSize: 13, color: t.textSec }}>{auto.tipo} &middot; {fmt(auto.precio)} &middot; {new Intl.NumberFormat("es-CL").format(auto.km)} km</div>
              </>}
            </div>
            <div style={s.card}>
              <h3 style={{ margin: "0 0 10px", fontSize: 15, color: t.accent }}>Comprador</h3>
              {comp && <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{comp.nombre[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{comp.nombre}</div>
                    <div style={{ fontSize: 12, color: t.textSec }}>{comp.tel}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: t.textSec }}>Busca: {comp.marcas.join(", ")} &middot; {comp.tipos.join(", ")}</div>
                <div style={{ fontSize: 13, color: t.textSec }}>Presupuesto: {fmt(comp.presMin)} - {fmt(comp.presMax)}</div>
              </>}
            </div>
          </div>
          <div style={{ ...s.card, marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: m.score >= 80 ? t.green : m.score >= 60 ? t.yellow : t.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{m.score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Score: {m.score}%</div>
              <div style={{ fontSize: 13, color: t.textSec }}>Razones: {m.reasons.join(", ")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button style={s.btn(t.green)} onClick={() => showToast(`WhatsApp enviado a ${comp?.nombre}`)}>WhatsApp</button>
            <button style={s.btn(t.blue)} onClick={() => showToast(`Email enviado a ${comp?.nombre}`)}>Email</button>
            <button style={s.btn(t.yellow)} onClick={() => showToast(`Llamando a ${comp?.nombre}...`)}>Llamar</button>
          </div>
        </div>
      );
    }

    /* ── List view ── */
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Matches</h2>
          <button style={s.btn(t.accent)} disabled={loadingMatch} onClick={() => {
            setLoadingMatch(true);
            setTimeout(() => { setLoadingMatch(false); showToast(`${matches.length} matches encontrados`); }, 2000);
          }}>{loadingMatch ? "\u23F3 Ejecutando..." : "\u26A1 Ejecutar Matching"}</button>
        </div>
        <div style={{ ...s.card, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <div><label style={s.label}>Score m{"\u00ED"}nimo</label>
            <select style={s.select} value={fMatchScoreMin} onChange={(e) => setFMatchScoreMin(Number(e.target.value))}>
              <option value={0}>Todos</option><option value={50}>50+</option><option value={60}>60+</option><option value={70}>70+</option><option value={80}>80+</option><option value={90}>90+</option>
            </select>
          </div>
          <div><label style={s.label}>Auto</label>
            <select style={s.select} value={fMatchAuto} onChange={(e) => setFMatchAuto(e.target.value)}>
              <option value="all">Todos</option>
              {autos.filter((a) => a.estado !== "Vendido").map((a) => <option key={a.id} value={a.id}>{a.marca} {a.modelo}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((m, i) => {
            const auto = autoById(m.autoId);
            const comp = compById(m.compradorId);
            const origIdx = matches.indexOf(m);
            return (
              <div key={i} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, padding: 12, cursor: "pointer" }} onClick={() => setSelectedMatchIdx(origIdx)}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.score >= 80 ? t.green : m.score >= 60 ? t.yellow : t.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{m.score}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{auto ? `${auto.marca} ${auto.modelo} ${auto.a\u00f1o}` : "---"}</div>
                  <div style={{ fontSize: 12, color: t.textSec }}>{comp?.nombre} &middot; {m.reasons.join(", ")}</div>
                </div>
                <span style={{ fontSize: 12, color: t.textSec }}>{m.fecha}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     SCREEN: PIPELINE (Kanban)
     ═══════════════════════════════════════════════════════════ */
  const PipelineScreen = () => {
    const colsToShow = isDesktop ? PIPELINE_COLS : [pipeCol];
    const allItems = PIPELINE_COLS.flatMap((col) => (pipeline[col] || []).map((item) => ({ ...item, col })));
    const totalPrecio = allItems.reduce((sum, item) => { const a = autoById(item.autoId); return sum + (a ? a.precio : 0); }, 0);
    const totalDias = allItems.reduce((sum, item) => sum + item.dias, 0);
    const avgDias = allItems.length > 0 ? Math.round(totalDias / allItems.length) : 0;

    return (
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Pipeline</h2>
        {!isDesktop && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {PIPELINE_COLS.map((col) => (
              <button key={col} style={s.pill(pipeCol === col)} onClick={() => setPipeCol(col)}>{col} ({(pipeline[col] || []).length})</button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, overflowX: isDesktop ? "auto" : "visible" }}>
          {colsToShow.map((col) => (
            <div key={col} style={{ flex: isDesktop ? 1 : "none", width: isDesktop ? "auto" : "100%", minWidth: isDesktop ? 180 : "auto" }}>
              <div style={{ background: t.accent + "18", borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: t.accent }}>{col}</span>
                <span style={s.badge(t.accent)}>{(pipeline[col] || []).length}</span>
              </div>
              {(pipeline[col] || []).map((item) => {
                const auto = autoById(item.autoId);
                const comp = item.nombreOverride ? { nombre: item.nombreOverride } : compById(item.compradorId);
                const nextIdx = PIPELINE_COLS.indexOf(col) + 1;
                const nextCol = nextIdx < PIPELINE_COLS.length ? PIPELINE_COLS[nextIdx] : null;
                return (
                  <div key={item.id} style={{ ...s.card, marginBottom: 8, padding: 12, animation: "slideInRight .3s ease" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{comp?.nombre || "---"}</div>
                    <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4 }}>{auto ? `${auto.marca} ${auto.modelo}` : "---"}</div>
                    <div style={{ fontSize: 12, color: t.textSec, marginBottom: 6 }}>{auto ? fmt(auto.precio) : ""} &middot; {item.dias} d{"\u00ED"}as</div>
                    {nextCol && <button style={{ ...s.btn(t.accent), width: "100%", padding: "5px 0", fontSize: 11 }} onClick={() => movePipeline(item.id, col, nextCol)}>Mover a {nextCol}</button>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ ...s.card, marginTop: 16, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div><div style={{ fontSize: 12, color: t.textSec }}>Total en pipeline</div><div style={{ fontSize: 18, fontWeight: 800, color: t.accent }}>{fmt(totalPrecio)}</div></div>
          <div><div style={{ fontSize: 12, color: t.textSec }}>Promedio d{"\u00ED"}as</div><div style={{ fontSize: 18, fontWeight: 800, color: t.accent }}>{avgDias}</div></div>
          <div><div style={{ fontSize: 12, color: t.textSec }}>Total items</div><div style={{ fontSize: 18, fontWeight: 800, color: t.accent }}>{allItems.length}</div></div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     SCREEN: REPUESTOS
     ═══════════════════════════════════════════════════════════ */
  const RepuestosScreen = () => (
    <div>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Repuestos</h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["solicitudes", "Solicitudes"], ["proveedores", "Proveedores"], ["historial", "Historial"]].map(([k, l]) => (
          <button key={k} style={s.pill(repSubTab === k)} onClick={() => setRepSubTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── Solicitudes ── */}
      {repSubTab === "solicitudes" && (
        <div>
          <button style={{ ...s.btn(t.accent), marginBottom: 16 }} onClick={() => setModal("nuevaSol")}>+ Nueva Solicitud</button>
          {solicitudes.map((sol) => {
            const auto = autoById(sol.autoId);
            return (
              <div key={sol.id} style={{ ...s.card, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{auto ? autoName(auto) : `Auto #${sol.autoId}`}</div>
                  <span style={s.badge(sol.estado === "Enviada" ? t.yellow : sol.estado === "Cotizada" ? t.blue : t.green)}>{sol.estado}</span>
                </div>
                <div style={{ fontSize: 12, color: t.textSec, marginBottom: 6 }}>Fecha: {sol.fecha}</div>
                <div style={{ marginBottom: 6 }}>
                  {sol.piezas.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, padding: "3px 0" }}>
                      <span>{p.cotizado ? "\u2705" : "\u23F3"}</span>
                      <span style={{ flex: 1 }}>{p.nombre}</span>
                      <span style={{ fontSize: 11, color: t.textSec }}>{p.cotizado ? "Cotizado" : "Pendiente"}{p.comprado ? " \u00b7 Comprado" : ""}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: t.textSec }}>
                  Proveedores: {sol.proveedoresIds.map((id) => provById(id)?.nombre || `#${id}`).join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Proveedores ── */}
      {repSubTab === "proveedores" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button style={s.btn(t.accent)} onClick={() => setModal("addProv")}>+ Agregar Proveedor</button>
            <button style={s.btn(t.blue)} disabled={loadingSearch} onClick={() => {
              setLoadingSearch(true);
              setShowSearchResults(false);
              setTimeout(() => { setLoadingSearch(false); setShowSearchResults(true); }, 2000);
            }}>{loadingSearch ? "\u23F3 Buscando..." : "Buscar Proveedores"}</button>
          </div>
          {showSearchResults && (
            <div style={{ ...s.card, marginBottom: 16, borderLeft: `3px solid ${t.accent}` }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 14, color: t.accent }}>Resultados de b{"\u00FA"}squeda</h4>
              {[
                { nombre: "Desarmadur\u00eda Lo Prado", ubicacion: "Lo Prado, Santiago", especialidad: ["Toyota", "Hyundai"] },
                { nombre: "Repuestos R\u00e1pidos SpA", ubicacion: "San Miguel, Santiago", especialidad: ["Kia", "Chevrolet"] },
                { nombre: "Japan Parts Chile", ubicacion: "Santiago Centro", especialidad: ["Suzuki", "Mazda", "Nissan"] },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${t.border}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.nombre}</div>
                    <div style={{ fontSize: 12, color: t.textSec }}>{r.ubicacion} &middot; {r.especialidad.join(", ")}</div>
                  </div>
                  <button style={{ ...s.btn(t.green), padding: "4px 10px", fontSize: 11 }} onClick={() => {
                    addProveedor({ nombre: r.nombre, tel: "+56 9 0000 0000", email: "", especialidad: r.especialidad, ubicacion: r.ubicacion, rating: 3, tiempoResp: "6h" });
                    showToast(`${r.nombre} agregado`);
                  }}>Agregar a mi base</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {proveedores.map((p) => (
              <div key={p.id} style={{ ...s.card, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nombre}</div>
                  <div style={{ color: t.yellow, fontSize: 14, letterSpacing: 2 }}>{"★".repeat(p.rating)}{"☆".repeat(5 - p.rating)}</div>
                </div>
                <div style={{ fontSize: 13, color: t.textSec, marginBottom: 4 }}>{p.ubicacion} &middot; {p.tel}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                  {p.especialidad.map((esp) => <span key={esp} style={s.badge(t.accent)}>{esp}</span>)}
                </div>
                <div style={{ fontSize: 12, color: t.textSec }}>Tiempo resp: {p.tiempoResp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Historial ── */}
      {repSubTab === "historial" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${t.border}` }}>
                {["Auto", "Piezas", "Proveedor", "Costo", "Fecha"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: t.textSec, fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {solicitudesHistorial.map((sh) => {
                const auto = autoById(sh.autoId);
                return (
                  <tr key={sh.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: "8px 10px", fontWeight: 600 }}>{auto ? `${auto.marca} ${auto.modelo}` : `#${sh.autoId}`}</td>
                    <td style={{ padding: "8px 10px", color: t.textSec }}>{sh.piezas.join(", ")}</td>
                    <td style={{ padding: "8px 10px" }}>{sh.proveedor}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: t.accent }}>{fmt(sh.costo)}</td>
                    <td style={{ padding: "8px 10px", color: t.textSec }}>{sh.fecha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     SCREEN: CANALES
     ═══════════════════════════════════════════════════════════ */
  const CanalesScreen = () => {
    const pubStatusIcon = { Publicado: "\u2705", Pendiente: "\u23F3", "No publicado": "\u274C", Vendido: "\u2705" };

    return (
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Canales</h2>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button style={s.pill(canSubTab === "publicaciones")} onClick={() => setCanSubTab("publicaciones")}>Publicaciones</button>
          <button style={s.pill(canSubTab === "prospeccion")} onClick={() => setCanSubTab("prospeccion")}>Prospecci{"\u00F3"}n</button>
        </div>

        {/* ── Publicaciones ── */}
        {canSubTab === "publicaciones" && (
          <div>
            {autos.filter((a) => a.estado !== "Vendido").map((auto) => (
              <div key={auto.id} style={{ ...s.card, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span>{auto.icon} {auto.marca} {auto.modelo} {auto.a\u00f1o}</span>
                  <span style={s.badge(ESTADO_COLORS(t)[auto.estado] || t.gray)}>{auto.estado}</span>
                </div>
                {auto.publicaciones.map((pub, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < auto.publicaciones.length - 1 ? `1px solid ${t.border}` : "none", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14 }}>{pubStatusIcon[pub.estado] || "\u274C"}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 80 }}>{pub.canal}</span>
                    <span style={{ fontSize: 12, color: t.textSec }}>{pub.estado}</span>
                    {pub.canal === "MercadoLibre" && pub.estado !== "Publicado" && (
                      <button style={{ ...s.btn(t.blue), padding: "4px 10px", fontSize: 11 }} disabled={loadingPub === `${auto.id}-ML`} onClick={(e) => {
                        e.stopPropagation();
                        setLoadingPub(`${auto.id}-ML`);
                        setTimeout(() => {
                          updatePublicacion(auto.id, "MercadoLibre", "Publicado");
                          setLoadingPub(null);
                          showToast(`Publicado en MercadoLibre: ${auto.marca} ${auto.modelo}`);
                        }, 2000);
                      }}>{loadingPub === `${auto.id}-ML` ? "\u23F3..." : "Publicar en ML"}</button>
                    )}
                    {(pub.canal === "Facebook" || pub.canal === "Yapo") && pub.estado !== "Publicado" && (
                      <button style={{ ...s.btnOutline(t.accent), padding: "4px 10px", fontSize: 11 }} onClick={(e) => {
                        e.stopPropagation();
                        setModal({ type: "genAviso", auto, canal: pub.canal });
                      }}>Generar aviso</button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── Prospecci\u00f3n ── */}
        {canSubTab === "prospeccion" && (
          <div>
            <div style={{ ...s.card, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: t.accent }}>Buscar Desarmadurerías</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <input style={{ ...s.input, flex: 1, minWidth: 180 }} placeholder="Buscar por nombre, ubicaci\u00f3n..." />
                <button style={s.btn(t.accent)} disabled={loadingSearch} onClick={() => {
                  setLoadingSearch(true);
                  setShowSearchResults(false);
                  setTimeout(() => { setLoadingSearch(false); setShowSearchResults(true); }, 2000);
                }}>{loadingSearch ? "\u23F3 Buscando..." : "Buscar"}</button>
              </div>
              {showSearchResults && (
                <div>
                  {[
                    { nombre: "Desarmadur\u00eda Los Leones", ubicacion: "Providencia, Santiago", tel: "+56 9 4455 6677" },
                    { nombre: "RepuestosYa.cl", ubicacion: "\u00d1u\u00f1oa, Santiago", tel: "+56 9 8899 0011" },
                    { nombre: "Desarmadur\u00eda Camino Real", ubicacion: "La Florida, Santiago", tel: "+56 9 2233 4455" },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${t.border}` : "none" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.nombre}</div>
                        <div style={{ fontSize: 12, color: t.textSec }}>{r.ubicacion} &middot; {r.tel}</div>
                      </div>
                      <button style={{ ...s.btn(t.green), padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`${r.nombre} agregado a clientes`)}>Agregar a base de clientes</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 style={s.sectionTitle}>Campa{"\u00F1"}as</h3>
            <button style={{ ...s.btn(t.accent), marginBottom: 12 }} onClick={() => setModal("nuevaCamp")}>+ Nueva campa{"\u00F1"}a</button>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {campa\u00f1as.map((c) => (
                <div key={c.id} style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.nombre}</div>
                    <span style={{ fontSize: 12, color: t.textSec }}>{c.fecha}</span>
                  </div>
                  {[
                    { label: "Enviados", val: c.enviados, max: c.enviados, color: t.accent },
                    { label: "Abiertos", val: c.abiertos, max: c.enviados, color: t.blue },
                    { label: "Respondidos", val: c.respondidos, max: c.enviados, color: t.green },
                  ].map((bar, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: t.textSec, marginBottom: 2 }}>
                        <span>{bar.label}</span><span>{bar.val}/{bar.max}</span>
                      </div>
                      <div style={{ height: 8, background: dark ? "#1a2332" : "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${(bar.val / bar.max) * 100}%`, height: "100%", background: bar.color, borderRadius: 4, transition: "width .3s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  const screens = {
    inicio: Dashboard,
    inventario: Inventario,
    clientes: Clientes,
    matches: MatchesScreen,
    pipeline: PipelineScreen,
    repuestos: RepuestosScreen,
    canales: CanalesScreen,
  };
  const Screen = screens[tab] || Dashboard;

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTitle}>{"\u25C8"} AutoMatch CRM</div>
        <button style={s.toggle} onClick={() => setDark(!dark)}>{dark ? "\u2600\uFE0F Claro" : "\uD83C\uDF19 Oscuro"}</button>
      </div>

      <div style={s.body}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <nav style={s.sidebar}>
            {TABS.map((tb) => (
              <button key={tb.key} style={s.sideItem(tab === tb.key)} onClick={() => { setTab(tb.key); setSelectedAutoId(null); setSelectedClienteId(null); setSelectedMatchIdx(null); }}>
                <span style={{ fontSize: 16 }}>{tb.icon}</span>{tb.label}
              </button>
            ))}
          </nav>
        )}

        {/* Main content */}
        <main style={s.main}>
          <Screen />
        </main>
      </div>

      {/* Footer */}
      <div style={s.footer}>Desarrollado por LX3.ai &middot; Software Studio + Tech Partner</div>

      {/* Mobile bottom nav */}
      {!isDesktop && (
        <nav style={s.bottomNav}>
          {TABS.map((tb) => (
            <button key={tb.key} style={s.bottomItem(tab === tb.key)} onClick={() => { setTab(tb.key); setSelectedAutoId(null); setSelectedClienteId(null); setSelectedMatchIdx(null); }}>
              <span style={{ fontSize: 18 }}>{tb.icon}</span>{tb.label}
            </button>
          ))}
        </nav>
      )}

      {/* Toast */}
      {toast && <div style={s.toastStyle}>{toast}</div>}

      {/* Modals */}
      {modal === "addAuto" && <AddAutoModal />}
      {modal === "addProv" && <AddProvModal />}
      {modal === "nuevaSol" && <NuevaSolModal />}
      {modal === "nuevaCamp" && <NuevaCampModal />}
      {modal?.type === "genAviso" && <GenAvisoModal auto={modal.auto} canal={modal.canal} />}
    </div>
  );
}
