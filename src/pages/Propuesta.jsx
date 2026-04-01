import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ─── Scroll-reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {}, className = "" }) {
  const [ref, vis] = useReveal(0.12);
  return (
    <div ref={ref} className={className} style={{ ...style, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

/* ─── Constants ─── */
const C = { bg: "#050d18", bg2: "#091B2A", card: "#0f1f30", border: "#1a2d42", teal: "#0D9488", tealL: "#14B8A6", mint: "#5EEAD4", white: "#f0fdf9", gray: "#94a3b8", dimGray: "#64748b", green: "#10b981", yellow: "#f59e0b", orange: "#f97316", red: "#ef4444", purple: "#8b5cf6", blue: "#3b82f6", lightBg: "#f0fdfa", offWhite: "#f8fafc" };

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:${C.bg};color:${C.white};font-family:'DM Sans',system-ui,sans-serif;overflow-x:hidden}
::selection{background:${C.teal};color:#fff}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
`;

/* ─── Reusable components ─── */
function Section({ children, dark = true, id = "", style = {} }) {
  return (
    <section id={id} style={{ padding: "80px 0", background: dark ? C.bg : C.offWhite, color: dark ? C.white : C.bg2, position: "relative", overflow: "hidden", ...style }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>{children}</div>
    </section>
  );
}

function SectionTitle({ tag, title, subtitle, dark = true }) {
  return (
    <Reveal>
      {tag && <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: C.teal, marginBottom: 12 }}>{tag}</div>}
      <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, lineHeight: 1.15, marginBottom: 16, color: dark ? C.white : C.bg2 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 16, color: dark ? C.gray : C.dimGray, maxWidth: 640, lineHeight: 1.6 }}>{subtitle}</p>}
    </Reveal>
  );
}

function Card({ children, dark = true, style = {}, hover = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: dark ? C.card : "#fff", border: `1px solid ${dark ? C.border : "#e2e8f0"}`, borderRadius: 16, padding: 28, transition: "all 0.3s ease", transform: hover && hovered ? "translateY(-4px)" : "none", boxShadow: hover && hovered ? `0 12px 40px rgba(13,148,136,0.15)` : dark ? "none" : "0 2px 8px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  );
}

function Badge({ text, color = C.teal, bg }) {
  return <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg || `${color}18`, color, letterSpacing: "0.02em" }}>{text}</span>;
}

function CTAButton({ to, children, primary = true, style = {} }) {
  const [h, setH] = useState(false);
  if (to?.startsWith("http") || to?.startsWith("#")) {
    return <a href={to} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: primary ? "16px 32px" : "14px 28px", borderRadius: 12, border: primary ? "none" : `2px solid ${C.teal}`, background: primary ? (h ? C.tealL : C.teal) : "transparent", color: primary ? "#fff" : C.teal, fontSize: 15, fontWeight: 600, cursor: "pointer", textDecoration: "none", transition: "all 0.25s ease", transform: h ? "translateY(-2px)" : "none", boxShadow: h && primary ? "0 8px 30px rgba(13,148,136,0.35)" : "none", ...style }}>{children}</a>;
  }
  return <Link to={to || "/demo"} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: primary ? "16px 32px" : "14px 28px", borderRadius: 12, border: primary ? "none" : `2px solid ${C.teal}`, background: primary ? (h ? C.tealL : C.teal) : "transparent", color: primary ? "#fff" : C.teal, fontSize: 15, fontWeight: 600, cursor: "pointer", textDecoration: "none", transition: "all 0.25s ease", transform: h ? "translateY(-2px)" : "none", boxShadow: h && primary ? "0 8px 30px rgba(13,148,136,0.35)" : "none", ...style }}>{children}</Link>;
}

/* ═══════════════════════════════════════════ */
/*               MAIN COMPONENT               */
/* ═══════════════════════════════════════════ */
export default function Propuesta() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ background: C.bg }}>
      <style>{globalStyles}</style>

      {/* ═══ FLOATING NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "12px 24px", background: scrollY > 60 ? "rgba(5,13,24,0.92)" : "transparent", backdropFilter: scrollY > 60 ? "blur(12px)" : "none", borderBottom: scrollY > 60 ? `1px solid ${C.border}` : "1px solid transparent", transition: "all 0.35s ease" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#fff" }}>A</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.white }}>AutoMatch</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <CTAButton to="/demo" primary={false} style={{ padding: "8px 18px", fontSize: 13 }}>Ver Demo</CTAButton>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px" }}>
        {/* Background effects */}
        <div style={{ position: "absolute", top: "20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}12 0%, transparent 70%)`, filter: "blur(60px)", animation: "float 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.teal}08 0%, transparent 70%)`, filter: "blur(40px)", animation: "float 6s ease-in-out infinite 2s" }} />

        <div style={{ maxWidth: 900, textAlign: "center", position: "relative", zIndex: 1 }}>
          <Reveal>
            <Badge text="PROPUESTA CONFIDENCIAL · ABRIL 2026" color={C.mint} />
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontSize: "clamp(40px, 7vw, 72px)", fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, lineHeight: 1.08, margin: "28px 0 24px", color: C.white }}>
              Convierte tu negocio<br />
              <span style={{ color: C.mint }}>en una máquina de ventas</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: C.gray, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
              Un sistema integral que conecta tu inventario de autos con compradores interesados, automáticamente.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <CTAButton to="/demo">Ver Demo en Vivo →</CTAButton>
              <CTAButton to="#solucion" primary={false}>Conocer la solución ↓</CTAButton>
            </div>
          </Reveal>
          <Reveal delay={0.5}>
            <p style={{ fontSize: 13, color: C.dimGray, marginTop: 40 }}>Preparado para <strong style={{ color: C.gray }}>Gonzalo Blanco y socios</strong></p>
          </Reveal>
        </div>
      </section>

      {/* ═══ FLUJO DEL NEGOCIO ═══ */}
      <Section dark={false}>
        <SectionTitle dark={false} tag="Tu negocio hoy" title="Entendemos cómo operas" subtitle="Compras autos chocados, los reparas con repuestos de desarmadurerías, y los vendes al 50-60% del valor de mercado. El 80% de tus clientes son desarmadurerías que compran recurrentemente." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 40 }}>
          {[{ e: "🚗", n: "Compra", d: "Auto chocado a bajo precio", c: C.red }, { e: "🔧", n: "Repara", d: "Restauración con repuestos", c: C.yellow }, { e: "🌐", n: "Publica", d: "Venta al 50-60% del mercado", c: C.teal }, { e: "💰", n: "Vende", d: "A desarmadurerías y personas", c: C.green }].map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <Card dark={false} hover style={{ textAlign: "center", borderTop: `3px solid ${s.c}` }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.e}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.bg2, marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: C.dimGray }}>{s.d}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ EL PROBLEMA ═══ */}
      <Section>
        <SectionTitle tag="El problema" title="El costo de no sistematizar" subtitle="Cada uno de estos problemas tiene un impacto directo en tus ingresos." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 40 }}>
          {[{ t: "Ventas perdidas por olvido", d: "Sin registro de interesados, cuando llega un auto nuevo no sabes a quién avisarle.", i: "~$10-15M/año", c: C.red }, { t: "Horas buscando repuestos", d: "Contactar desarmadurerías una a una por WhatsApp. 2-3 horas por auto.", i: "~60 hrs/año", c: C.orange }, { t: "Clientes que no vuelven", d: "Sin seguimiento post-venta ni alertas. Los compradores recurrentes podrían comprar más seguido.", i: "Recurrencia baja", c: C.yellow }, { t: "Costos no rastreados", d: "Sin registro de cuánto inviertes en compra + reparación. Difícil calcular el margen real.", i: "Margen ciego", c: C.purple }].map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <Card hover style={{ borderLeft: `3px solid ${p.c}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{p.t}</h3>
                <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.5, marginBottom: 16 }}>{p.d}</p>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: p.c }}>{p.i}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ LA SOLUCIÓN ═══ */}
      <Section dark={false} id="solucion">
        <SectionTitle dark={false} tag="La solución" title="AutoMatch: tu plataforma integral" subtitle="Un sistema web que conecta tu oferta con la demanda automáticamente. Tres componentes que trabajan juntos." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 48 }}>
          {[{ e: "🌐", t: "Sitio Web Público", s: "Tu vitrina online", c: C.teal, items: ["Catálogo de autos con fotos y filtros", "SEO posicionado en Google", "Diseño profesional responsivo", "Optimizado para móvil"] }, { e: "👥", t: "Portal del Cliente", s: "Tus compradores", c: C.yellow, items: ["Registro con preferencias y wishlist", "Notificaciones de match automáticas", "Acceso con login (PWA)", "Consultas por WhatsApp directo"] }, { e: "⚙️", t: "Panel Administrador", s: "Tu gestión completa", c: C.green, items: ["CRM + inventario + costos", "Pipeline de ventas Kanban", "Motor de matching automático", "Gestión de repuestos y proveedores"] }].map((p, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <Card dark={false} hover style={{ borderTop: `3px solid ${p.c}`, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>{p.e}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.bg2, marginBottom: 4 }}>{p.t}</h3>
                <div style={{ fontSize: 13, color: p.c, fontWeight: 600, marginBottom: 20 }}>{p.s}</div>
                <div style={{ textAlign: "left" }}>
                  {p.items.map((item, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14, color: C.dimGray }}><span style={{ color: p.c, fontSize: 14 }}>✓</span>{item}</div>)}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ PWA ═══ */}
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <SectionTitle tag="Tecnología" title={<>¿Qué es una <span style={{ color: C.mint }}>PWA</span>?</>} subtitle="Progressive Web App: tu sistema se instala como una app en el celular, sin pasar por App Store ni Google Play." />
            <Reveal delay={0.2}>
              <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, marginTop: 16, marginBottom: 24 }}>
                Tus clientes entran a tu página web desde el celular y les aparece la opción de "Agregar a pantalla de inicio". Con un toque, se instala con ícono propio, pantalla completa y carga rápida. Lo mismo aplica para tu panel de administración.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["Sin descarga", "Sin App Store", "Costo $0 extra", "Actualizaciones instantáneas", "Se comparte por link"].map((t, i) => <Badge key={i} text={t} />)}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.mint }}>PWA vs. App Nativa vs. Solo Web</span>
              </div>
              {[{ f: "Se instala en celular", a: "Sí", b: "Sí", c: "No" }, { f: "Notificaciones push", a: "Sí", b: "Sí", c: "No" }, { f: "Requiere App Store", a: "No", b: "Sí", c: "No" }, { f: "Costo desarrollo extra", a: "$0", b: "$3-8M+", c: "$0" }, { f: "Actualizaciones instantáneas", a: "Sí", b: "No", c: "Sí" }, { f: "Se comparte por link", a: "Sí", b: "No", c: "Sí" }].map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ color: C.gray }}>{r.f}</span>
                  <span style={{ color: r.a === "Sí" || r.a === "$0" || r.a === "No" && i === 2 ? C.green : C.gray, fontWeight: 700, textAlign: "center" }}>{r.a}</span>
                  <span style={{ color: r.b === "Sí" ? C.gray : r.b.includes("$3") ? C.red : C.yellow, textAlign: "center" }}>{r.b}</span>
                  <span style={{ color: r.c === "No" ? C.red : C.gray, textAlign: "center" }}>{r.c}</span>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", padding: "10px 20px", fontSize: 11, color: C.dimGray }}>
                <span></span><span style={{ textAlign: "center", fontWeight: 600, color: C.mint }}>PWA ✓</span><span style={{ textAlign: "center" }}>Nativa</span><span style={{ textAlign: "center" }}>Web</span>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* ═══ MÓDULOS DETALLADOS ═══ */}
      {/* Módulo 1: Inventario */}
      <Section dark={false}>
        <SectionTitle dark={false} tag="Módulo 1 · Fase 1" title="Inventario y Control de Costos" subtitle="Control total desde la compra del auto hasta la venta. Pipeline visual con cálculo automático de margen." />
        <Reveal delay={0.15}>
          <div style={{ display: "flex", gap: 8, marginTop: 32, marginBottom: 32, overflowX: "auto", paddingBottom: 8 }}>
            {[{ s: "Chocado", c: C.red }, { s: "En reparación", c: C.yellow }, { s: "Listo", c: C.green }, { s: "Publicado", c: C.blue }, { s: "Vendido", c: C.dimGray }].map((st, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ padding: "10px 20px", borderRadius: 10, background: st.c, color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>{st.s}</div>
                {i < 4 && <span style={{ color: C.dimGray, fontSize: 18 }}>→</span>}
              </div>
            ))}
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[{ t: "Ficha completa del vehículo", d: "Marca, modelo, año, chasis, color, motor, transmisión, kilometraje." }, { t: "Galería antes / después", d: "Fotos del estado original y del resultado final de la reparación." }, { t: "Control de costos y margen", d: "Precio de compra + reparación = invertido. El sistema calcula tu margen real." }, { t: "Historial de estados", d: "Timeline visual de cada auto: compra, reparación, publicación, venta." }].map((f, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <Card dark={false} hover><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ color: C.green }}>✓</span><h4 style={{ fontSize: 14, fontWeight: 600, color: C.bg2 }}>{f.t}</h4></div><p style={{ fontSize: 13, color: C.dimGray, lineHeight: 1.5 }}>{f.d}</p></Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Módulo 2: CRM + Matching */}
      <Section>
        <SectionTitle tag="Módulo 2 · Fase 1" title="CRM y Matching Automático" subtitle="El corazón de AutoMatch: conectar autos con compradores sin esfuerzo manual." />
        <div style={{ marginTop: 40 }}>
          {[{ n: "1", t: "Auto nuevo ingresa al sistema", d: "Completas la ficha con marca, modelo, tipo, precio y año" }, { n: "2", t: "Motor cruza con base de compradores", d: "Filtra por marca, tipo, presupuesto y año mínimo automáticamente" }, { n: "3", t: "Se generan matches con score", d: "Cada match tiene un porcentaje de compatibilidad según criterios" }, { n: "4", t: "Notificación automática", d: "WhatsApp + email al comprador: 'Tenemos un auto que te puede interesar'" }, { n: "5", t: "Seguimiento en pipeline", d: "Kanban: Notificado → Interesado → Negociación → Vendido" }].map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", padding: "18px 24px", borderRadius: 12, marginBottom: 8, background: i % 2 === 0 ? C.card : "transparent", borderLeft: `3px solid ${C.teal}` }}>
                <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: C.mint, minWidth: 36 }}>{s.n}</span>
                <div><div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{s.t}</div><div style={{ fontSize: 13, color: C.gray }}>{s.d}</div></div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.4}>
          <div style={{ marginTop: 24, padding: "16px 24px", borderRadius: 12, background: `${C.teal}12`, border: `1px solid ${C.teal}30` }}>
            <span style={{ fontWeight: 600, color: C.mint }}>Bidireccional: </span>
            <span style={{ color: C.gray }}>también se ejecuta cuando un comprador nuevo se registra. Cruza contra todos los autos disponibles.</span>
          </div>
        </Reveal>
      </Section>

      {/* Módulo 3: Portal + Notificaciones */}
      <Section dark={false}>
        <SectionTitle dark={false} tag="Módulo 3 · Fase 1" title="Portal del Cliente y Notificaciones" subtitle="Tus compradores se auto-registran y reciben alertas automáticas cuando hay un match." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 40 }}>
          <Reveal>
            <Card dark={false} hover style={{ borderTop: `3px solid ${C.teal}` }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.bg2, marginBottom: 16 }}>🌐 Lo que ve el comprador</h3>
              {["Catálogo público con todos los autos disponibles", "Filtros por tipo, marca, precio y año", "Botón directo de consulta por WhatsApp", "Registro de preferencias (qué auto busca)", "Wishlist personalizada con alertas activas", "Se instala como PWA en el celular"].map((it, j) => <div key={j} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 14, color: C.dimGray }}><span style={{ color: C.teal }}>✓</span>{it}</div>)}
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card dark={false} hover style={{ borderLeft: `3px solid #25D366` }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: C.bg2, marginBottom: 6 }}>💬 WhatsApp Business API</h4>
                <p style={{ fontSize: 13, color: C.dimGray, lineHeight: 1.5 }}>Mensaje directo al celular del comprador con foto del auto, specs y precio. El cliente responde directamente a tu WhatsApp.</p>
              </Card>
              <Card dark={false} hover style={{ borderLeft: `3px solid ${C.blue}` }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: C.bg2, marginBottom: 6 }}>📧 Email profesional (Resend)</h4>
                <p style={{ fontSize: 13, color: C.dimGray, lineHeight: 1.5 }}>Email con diseño profesional, fotos del auto, botón de acción. Alta entregabilidad, no cae en spam.</p>
              </Card>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Módulo 4: Repuestos */}
      <Section>
        <SectionTitle tag="Módulo 4 · Fase 2" title="Gestión de Repuestos" subtitle="Encuentra piezas en minutos, no en horas. Disparo masivo a tu base de proveedores." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 40 }}>
          <Reveal>
            <div>
              {[{ n: "1", t: "Seleccionas el auto que necesita piezas" }, { n: "2", t: "Eliges las piezas del catálogo predefinido" }, { n: "3", t: "Seleccionas proveedores destino" }, { n: "4", t: "Disparo masivo WhatsApp + Email" }, { n: "5", t: "Recibes cotizaciones y comparas" }].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 16px", borderRadius: 10, marginBottom: 6, background: i % 2 === 0 ? C.card : "transparent" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: C.yellow, minWidth: 28 }}>{s.n}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{s.t}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Card hover>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: C.yellow, marginBottom: 16 }}>Funcionalidades incluidas</h4>
              {["Base de datos de proveedores y desarmadurerías", "Catálogo de piezas por tipo de vehículo", "Disparo masivo WhatsApp + email simultáneo", "Historial de cotizaciones y respuestas", "Ranking de proveedores por velocidad y precio", "Prospección Google Maps para encontrar nuevas desarmadurerías"].map((it, j) => <div key={j} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 13, color: C.gray }}><span style={{ color: C.yellow }}>✓</span>{it}</div>)}
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Módulo 5: Canales */}
      <Section dark={false}>
        <SectionTitle dark={false} tag="Módulo 5 · Fase 3" title="Publicación Multicanal" subtitle="Publica tus autos en todas las plataformas desde un solo lugar." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 40 }}>
          {[{ t: "Mercado Libre", api: true, badge: "API OFICIAL", bc: C.green, d: "Tiene API pública excelente. Con un clic se publica el auto con fotos, specs y precio. Cuando se vende, se baja solo.", items: ["Automatización total", "Publicar, editar, pausar, eliminar", "Sincronización con inventario"] }, { t: "Facebook Marketplace", api: false, badge: "SIN API PÚBLICA", bc: C.yellow, d: "Meta no ofrece API para vendedores individuales. AutoMatch genera el aviso completo listo para copiar y pegar en 30 segundos.", items: ["Generador automático de avisos", "Texto optimizado para venta", "Copiar y pegar en 30 segundos"] }, { t: "Yapo.cl", api: false, badge: "SIN API PÚBLICA", bc: C.yellow, d: "Yapo (OLX/Adevinta) tampoco ofrece API. Misma solución: el sistema genera el aviso formateado. Solo copias y pegas.", items: ["Mismo generador de avisos", "Fotos pre-descargadas", "Proceso manual de 30 segundos"] }].map((ch, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <Card dark={false} hover style={{ borderTop: `3px solid ${ch.bc}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: C.bg2 }}>{ch.t}</h3>
                  <Badge text={ch.badge} color={ch.api ? C.green : C.yellow} />
                </div>
                <p style={{ fontSize: 13, color: C.dimGray, lineHeight: 1.6, marginBottom: 16 }}>{ch.d}</p>
                {ch.items.map((it, j) => <div key={j} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: C.dimGray }}><span style={{ color: ch.bc }}>✓</span>{it}</div>)}
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div style={{ marginTop: 24, padding: "16px 24px", borderRadius: 12, background: `${C.teal}10`, border: `1px solid ${C.teal}25` }}>
            <span style={{ fontWeight: 600, color: C.teal }}>Resumen: </span>
            <span style={{ color: C.dimGray }}>Mercado Libre se automatiza 100% vía API. Facebook y Yapo no tienen API, pero el sistema genera el aviso listo para copiar en segundos.</span>
          </div>
        </Reveal>
      </Section>

      {/* Módulo 6: Prospección */}
      <Section>
        <SectionTitle tag="Módulo 6 · Fase 3" title="Prospección Automática" subtitle="Encuentra nuevos clientes y desarmadurerías sin buscar manualmente." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 40 }}>
          {[{ e: "📍", t: "Búsqueda de desarmadurerías", c: C.orange, items: ["Google Maps API busca por región/ciudad", "Nombre, dirección, teléfono y web", "Agregar directo a tu base de proveedores", "Costo bajo: ~$5-10 USD por mil consultas"] }, { e: "🎯", t: "Prospección de clientes", c: C.purple, items: ["Apollo.io encuentra empresas con flotas", "Emails verificados con alta entregabilidad", "Secuencias automáticas de correo frío", "Seguimiento de aperturas y respuestas"] }].map((m, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <Card hover style={{ borderTop: `3px solid ${m.c}` }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{m.e}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{m.t}</h3>
                {m.items.map((it, j) => <div key={j} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 14, color: C.gray }}><span style={{ color: m.c }}>✓</span>{it}</div>)}
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ ROI ═══ */}
      <Section dark={false}>
        <SectionTitle dark={false} tag="Retorno de inversión" title="¿Cuánto te va a generar AutoMatch?" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>
          {[{ t: "Ventas adicionales por matching", v: "+2 autos/mes", d: "Clientes que hoy se pierden por falta de seguimiento", m: "+$16M - $24M / año", c: C.green }, { t: "Horas ahorradas en repuestos", v: "-3 hrs/auto", d: "Disparo masivo vs. contactar uno a uno", m: "~60 hrs/año liberadas", c: C.teal }, { t: "Clientes nuevos por prospección", v: "+5-10/mes", d: "Desarmadurerías encontradas vía Google Maps", m: "Base creciente de leads", c: C.yellow }].map((r, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <Card dark={false} hover style={{ borderTop: `3px solid ${r.c}`, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: C.dimGray, marginBottom: 8 }}>{r.t}</div>
                <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: r.c, marginBottom: 8 }}>{r.v}</div>
                <div style={{ fontSize: 13, color: C.dimGray, marginBottom: 16 }}>{r.d}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.bg2 }}>{r.m}</div>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div style={{ marginTop: 32, padding: "20px 28px", borderRadius: 14, background: C.teal, textAlign: "center" }}>
            <span style={{ fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 600, color: "#fff" }}>Si AutoMatch genera solo 2 ventas extra al mes → <strong>se paga solo en 2-3 meses</strong></span>
          </div>
        </Reveal>
      </Section>

      {/* ═══ INVERSIÓN ═══ */}
      <Section>
        <SectionTitle tag="Inversión" title="Plan de implementación y costos" subtitle="Desarrollo por fases: resultados rápidos, escalamiento gradual." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>
          {[{ f: "Fase 1 · MVP", p: "$2.500.000", d: "Web + CRM + Matching + Portal + Notificaciones + Pipeline", t: "4-5 semanas", c: C.teal }, { f: "Fase 2 · Repuestos", p: "$1.200.000", d: "Proveedores + disparo masivo + prospección Google Maps", t: "2-3 semanas", c: C.yellow }, { f: "Fase 3 · Canales", p: "$1.500.000", d: "Mercado Libre API + SEO + prospección Apollo", t: "2-3 semanas", c: C.green }].map((ph, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <Card hover style={{ borderTop: `3px solid ${ph.c}`, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ph.c, marginBottom: 8 }}>{ph.f}</div>
                <div style={{ fontSize: 34, fontWeight: 700, fontFamily: "'DM Serif Display', serif", marginBottom: 8 }}>{ph.p}</div>
                <div style={{ fontSize: 13, color: C.gray, marginBottom: 12, lineHeight: 1.5 }}>{ph.d}</div>
                <Badge text={ph.t} color={ph.c} />
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Payment options */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 48 }}>
          <Reveal>
            <Card style={{ border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.teal, marginBottom: 4 }}>OPCIÓN A</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>Solo Fase 1 (MVP)</h3>
              <p style={{ fontSize: 13, color: C.gray, marginBottom: 20 }}>Empieza con lo esencial y escala cuando quieras</p>
              <div style={{ fontSize: 14, marginBottom: 8 }}><strong>Pago inicial (50%):</strong> $1.250.000</div>
              <div style={{ fontSize: 14, marginBottom: 16 }}><strong>Al entregar MVP:</strong> $1.250.000</div>
              <div style={{ fontSize: 13, color: C.gray, marginBottom: 4 }}>Mantención desde mes 2: $250.000/mes</div>
              <div style={{ fontSize: 13, color: C.gray }}>Fases 2 y 3 se cotizan por separado</div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.teal }}>Total: $2.500.000</span>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.12}>
            <Card style={{ border: `2px solid ${C.green}`, position: "relative" }}>
              <div style={{ position: "absolute", top: -1, right: 20, background: C.green, color: "#fff", padding: "4px 14px", borderRadius: "0 0 8px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>RECOMENDADA</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 4 }}>OPCIÓN B</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>Sistema Completo</h3>
              <p style={{ fontSize: 13, color: C.gray, marginBottom: 20 }}>3 fases con descuento por compromiso total</p>
              <div style={{ fontSize: 14, marginBottom: 8 }}><strong>Pago inicial (40%):</strong> $1.900.000</div>
              <div style={{ fontSize: 14, marginBottom: 8 }}><strong>Al entregar Fase 1:</strong> $1.500.000</div>
              <div style={{ fontSize: 14, marginBottom: 16 }}><strong>Al entregar Fases 2+3:</strong> $1.400.000</div>
              <div style={{ fontSize: 13, color: C.gray }}>Mantención: $250.000/mes</div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.green }}>Total: $4.800.000</span>
                <span style={{ fontSize: 13, color: C.green, marginLeft: 8 }}>(ahorras $400.000)</span>
              </div>
            </Card>
          </Reveal>
        </div>
        <Reveal delay={0.2}>
          <p style={{ fontSize: 12, color: C.dimGray, marginTop: 16, textAlign: "center" }}>Mantención incluye: hosting Vercel, soporte técnico, actualizaciones, mejoras menores, SEO continuo y monitoreo 24/7.</p>
        </Reveal>
      </Section>

      {/* ═══ POR QUÉ LX3.ai ═══ */}
      <Section dark={false}>
        <SectionTitle dark={false} tag="Sobre nosotros" title="¿Por qué LX3.ai?" subtitle="No somos una fábrica de software. Somos tu socio tecnológico." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 40 }}>
          {[{ e: "🛡️", t: "Experiencia comprobada", d: "Desarrollamos OPAI, un ERP con +15 módulos y 6 portales PWA para Gard Security, empresa con 15+ años en el mercado." }, { e: "🤝", t: "Socio, no proveedor", d: "Nos involucramos en tu negocio. Entendemos tus procesos y proponemos soluciones. No desaparecemos." }, { e: "🚀", t: "Desarrollo ágil", d: "Ves avance cada semana. Participas del proceso y ajustamos en tiempo real según tu feedback." }, { e: "🎧", t: "Soporte continuo", d: "Mantención incluye soporte, mejoras, SEO y monitoreo. Tu sistema evoluciona contigo." }].map((w, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <Card dark={false} hover>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{w.e}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: C.bg2, marginBottom: 8 }}>{w.t}</h4>
                <p style={{ fontSize: 13, color: C.dimGray, lineHeight: 1.6 }}>{w.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══ CTA FINAL ═══ */}
      <section style={{ padding: "100px 24px", background: C.bg2, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.teal}, ${C.mint}, ${C.teal})`, backgroundSize: "200% 100%", animation: "gradientShift 4s ease infinite" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontFamily: "'DM Serif Display', serif", fontWeight: 700, color: "#fff" }}>A</div>
              <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>AutoMatch</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>
              Hagamos crecer tu negocio<br />
              <span style={{ color: C.mint }}>con tecnología que trabaja para ti</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
              <CTAButton to="/demo">Ver Demo en Vivo →</CTAButton>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 32 }}>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Carlos Irigoyen · Fundador</p>
              <p style={{ color: C.gray, fontSize: 14, marginBottom: 4 }}>carlos.irigoyen@lx3.ai</p>
              <p style={{ color: C.gray, fontSize: 14, marginBottom: 4 }}>+56 9 8230 7771</p>
              <p style={{ color: C.tealL, fontSize: 14, fontWeight: 600 }}>lx3.ai</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "20px 24px", background: C.bg, textAlign: "center", borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, color: C.dimGray }}>Desarrollado por <span style={{ color: C.tealL, fontWeight: 600 }}>LX3.ai</span> · Software Studio + Tech Partner</span>
      </footer>
    </div>
  );
}