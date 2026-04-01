import { createContext, useContext, useState, useCallback, useMemo } from "react";

const fmt = (n) => "$" + new Intl.NumberFormat("es-CL").format(n);

const AUTOS_INIT = [
  { id: 1, marca: "Toyota", modelo: "Hilux", año: 2021, tipo: "Pickup", precio: 14500000, km: 78000, color: "Blanco", trans: "Automática", estado: "Publicado", icon: "🛻", grad: "linear-gradient(135deg,#1e3a5f,#0e7490)", costoCompra: 7200000, costoRep: 2800000, desc: "Excelente estado, reparación completa de chasis y pintura. Motor original revisado. Neumáticos nuevos Bridgestone.", fechaIngreso: "2025-12-15", repuestos: [{ nombre: "Capó", estado: "Recibido" }, { nombre: "Parachoques delantero", estado: "Recibido" }, { nombre: "Faro izquierdo", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "Publicado", fecha: "2026-01-20" }, { canal: "Facebook", estado: "Publicado", fecha: "2026-01-18" }, { canal: "Yapo", estado: "Pendiente", fecha: null }] },
  { id: 2, marca: "Hyundai", modelo: "Tucson", año: 2020, tipo: "SUV", precio: 12800000, km: 92000, color: "Gris", trans: "Automática", estado: "Publicado", icon: "🚙", grad: "linear-gradient(135deg,#374151,#6b7280)", costoCompra: 6100000, costoRep: 2200000, desc: "Restauración premium. Tapiz nuevo, mecánica al día, neumáticos nuevos. Pintura completa.", fechaIngreso: "2025-11-28", repuestos: [{ nombre: "Puerta trasera derecha", estado: "Recibido" }, { nombre: "Espejo lateral derecho", estado: "Recibido" }, { nombre: "Moldura lateral", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "Publicado", fecha: "2026-01-10" }, { canal: "Facebook", estado: "Publicado", fecha: "2026-01-10" }, { canal: "Yapo", estado: "Publicado", fecha: "2026-01-12" }] },
  { id: 3, marca: "Chevrolet", modelo: "Spark GT", año: 2022, tipo: "Hatchback", precio: 6200000, km: 35000, color: "Rojo", trans: "Manual", estado: "Listo para venta", icon: "🚗", grad: "linear-gradient(135deg,#dc2626,#f87171)", costoCompra: 2800000, costoRep: 900000, desc: "Bajo kilometraje. Reparación menor de parachoques. Ideal ciudad. Revisión técnica al día.", fechaIngreso: "2026-01-05", repuestos: [{ nombre: "Parachoques trasero", estado: "Recibido" }, { nombre: "Foco trasero izquierdo", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "Pendiente", fecha: null }, { canal: "Facebook", estado: "Pendiente", fecha: null }, { canal: "Yapo", estado: "Pendiente", fecha: null }] },
  { id: 4, marca: "Kia", modelo: "Sportage", año: 2019, tipo: "SUV", precio: 11500000, km: 110000, color: "Negro", trans: "Automática", estado: "En reparación", icon: "🚙", grad: "linear-gradient(135deg,#0f172a,#334155)", costoCompra: 5500000, costoRep: 1800000, desc: "En proceso de restauración. Daño frontal reparado, pintura en proceso. Disponible en 2 semanas.", fechaIngreso: "2026-02-20", repuestos: [{ nombre: "Capó", estado: "Recibido" }, { nombre: "Radiador", estado: "Pendiente" }, { nombre: "Faro derecho", estado: "Pendiente" }, { nombre: "Parachoques delantero", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "No publicado", fecha: null }, { canal: "Facebook", estado: "No publicado", fecha: null }, { canal: "Yapo", estado: "No publicado", fecha: null }] },
  { id: 5, marca: "Suzuki", modelo: "Swift", año: 2021, tipo: "Hatchback", precio: 7800000, km: 45000, color: "Azul", trans: "Manual", estado: "Publicado", icon: "🚗", grad: "linear-gradient(135deg,#1e40af,#3b82f6)", costoCompra: 3500000, costoRep: 1100000, desc: "Restauración completa. Pintura original retocada, mecánica 100%. Aire acondicionado funcionando.", fechaIngreso: "2025-12-01", repuestos: [{ nombre: "Guardabarro delantero", estado: "Recibido" }, { nombre: "Espejo izquierdo", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "Publicado", fecha: "2026-01-15" }, { canal: "Facebook", estado: "Publicado", fecha: "2026-01-14" }, { canal: "Yapo", estado: "Publicado", fecha: "2026-01-16" }] },
  { id: 6, marca: "Nissan", modelo: "Navara", año: 2020, tipo: "Pickup", precio: 15200000, km: 88000, color: "Plata", trans: "Automática", estado: "En reparación", icon: "🛻", grad: "linear-gradient(135deg,#6b7280,#9ca3af)", costoCompra: 7800000, costoRep: 3200000, desc: "En restauración. Daño lateral reparado, pintura en proceso. Motor excelente.", fechaIngreso: "2026-03-01", repuestos: [{ nombre: "Puerta delantera izquierda", estado: "Pendiente" }, { nombre: "Espejo izquierdo", estado: "Pendiente" }, { nombre: "Moldura lateral izquierda", estado: "Recibido" }, { nombre: "Faro antiniebla", estado: "Pendiente" }], publicaciones: [{ canal: "MercadoLibre", estado: "No publicado", fecha: null }, { canal: "Facebook", estado: "No publicado", fecha: null }, { canal: "Yapo", estado: "No publicado", fecha: null }] },
  { id: 7, marca: "Mazda", modelo: "CX-5", año: 2019, tipo: "SUV", precio: 13200000, km: 95000, color: "Rojo", trans: "Automática", estado: "Vendido", icon: "🚙", grad: "linear-gradient(135deg,#991b1b,#dc2626)", costoCompra: 6500000, costoRep: 1900000, desc: "Vendido. Restauración completa exitosa. Cliente satisfecho.", fechaIngreso: "2025-10-10", repuestos: [{ nombre: "Parachoques delantero", estado: "Recibido" }, { nombre: "Capó", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "Vendido", fecha: "2025-11-20" }, { canal: "Facebook", estado: "Vendido", fecha: "2025-11-18" }, { canal: "Yapo", estado: "No publicado", fecha: null }] },
  { id: 8, marca: "Mitsubishi", modelo: "L200", año: 2020, tipo: "Pickup", precio: 16800000, km: 72000, color: "Blanco", trans: "Automática", estado: "Chocado", icon: "🛻", grad: "linear-gradient(135deg,#e2e8f0,#94a3b8)", costoCompra: 8200000, costoRep: 0, desc: "Recién ingresado. Daño frontal por colisión. Pendiente evaluación de reparación.", fechaIngreso: "2026-03-28", repuestos: [], publicaciones: [{ canal: "MercadoLibre", estado: "No publicado", fecha: null }, { canal: "Facebook", estado: "No publicado", fecha: null }, { canal: "Yapo", estado: "No publicado", fecha: null }] },
  { id: 9, marca: "Toyota", modelo: "Yaris", año: 2022, tipo: "Sedán", precio: 8900000, km: 28000, color: "Blanco", trans: "Automática", estado: "Listo para venta", icon: "🚗", grad: "linear-gradient(135deg,#f0f9ff,#0ea5e9)", costoCompra: 4200000, costoRep: 1300000, desc: "Restauración completa. Bajo kilometraje, ideal para uso diario. Transmisión CVT.", fechaIngreso: "2026-01-20", repuestos: [{ nombre: "Guardabarro trasero", estado: "Recibido" }, { nombre: "Foco trasero", estado: "Recibido" }, { nombre: "Tapa maleta", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "Pendiente", fecha: null }, { canal: "Facebook", estado: "Pendiente", fecha: null }, { canal: "Yapo", estado: "Pendiente", fecha: null }] },
  { id: 10, marca: "Hyundai", modelo: "Accent", año: 2021, tipo: "Sedán", precio: 8200000, km: 52000, color: "Gris", trans: "Manual", estado: "Publicado", icon: "🚗", grad: "linear-gradient(135deg,#4b5563,#9ca3af)", costoCompra: 3800000, costoRep: 1000000, desc: "Reparación completa de costado derecho. Pintura nueva. Mecánica impecable.", fechaIngreso: "2025-12-20", repuestos: [{ nombre: "Puerta delantera derecha", estado: "Recibido" }, { nombre: "Puerta trasera derecha", estado: "Recibido" }, { nombre: "Espejo derecho", estado: "Recibido" }], publicaciones: [{ canal: "MercadoLibre", estado: "Publicado", fecha: "2026-02-01" }, { canal: "Facebook", estado: "Publicado", fecha: "2026-02-01" }, { canal: "Yapo", estado: "Pendiente", fecha: null }] },
];

const COMPRADORES_INIT = [
  { id: 1, nombre: "Juan Pérez", tel: "+56 9 8765 4321", email: "juan.perez@gmail.com", marcas: ["Toyota", "Nissan"], tipos: ["Pickup"], presMin: 12000000, presMax: 17000000, añoMin: 2018, fechaRegistro: "2026-01-15", fuente: "Portal", notifWhatsapp: true, notifEmail: true },
  { id: 2, nombre: "María González", tel: "+56 9 1234 5678", email: "maria.gonzalez@gmail.com", marcas: ["Hyundai", "Kia"], tipos: ["SUV"], presMin: 10000000, presMax: 14000000, añoMin: 2019, fechaRegistro: "2026-03-28", fuente: "Portal", notifWhatsapp: true, notifEmail: true },
  { id: 3, nombre: "Pedro Soto", tel: "+56 9 5555 1234", email: "pedro.soto@hotmail.com", marcas: ["Chevrolet", "Suzuki"], tipos: ["Hatchback", "Sedán"], presMin: 5000000, presMax: 9000000, añoMin: 2020, fechaRegistro: "2026-01-08", fuente: "Manual", notifWhatsapp: true, notifEmail: false },
  { id: 4, nombre: "Andrea Muñoz", tel: "+56 9 7777 8888", email: "andrea.munoz@gmail.com", marcas: ["Toyota", "Kia", "Mazda"], tipos: ["SUV", "Pickup"], presMin: 11000000, presMax: 17000000, añoMin: 2018, fechaRegistro: "2026-03-22", fuente: "Portal", notifWhatsapp: true, notifEmail: true },
  { id: 5, nombre: "Roberto Díaz", tel: "+56 9 3333 2222", email: "roberto.diaz@yahoo.com", marcas: ["Hyundai", "Kia", "Mazda"], tipos: ["SUV"], presMin: 10000000, presMax: 14000000, añoMin: 2018, fechaRegistro: "2026-03-31", fuente: "Portal", notifWhatsapp: true, notifEmail: false },
  { id: 6, nombre: "Claudia Ríos", tel: "+56 9 6666 4444", email: "claudia.rios@gmail.com", marcas: ["Toyota", "Hyundai"], tipos: ["Sedán", "Hatchback"], presMin: 6000000, presMax: 10000000, añoMin: 2020, fechaRegistro: "2026-02-14", fuente: "WhatsApp", notifWhatsapp: true, notifEmail: false },
  { id: 7, nombre: "Felipe Contreras", tel: "+56 9 9999 1111", email: "felipe.c@gmail.com", marcas: ["Mitsubishi", "Toyota", "Nissan"], tipos: ["Pickup"], presMin: 14000000, presMax: 18000000, añoMin: 2019, fechaRegistro: "2026-03-10", fuente: "Portal", notifWhatsapp: true, notifEmail: true },
  { id: 8, nombre: "Carolina Vera", tel: "+56 9 2222 3333", email: "caro.vera@hotmail.com", marcas: ["Suzuki", "Chevrolet", "Hyundai"], tipos: ["Hatchback"], presMin: 5000000, presMax: 8500000, añoMin: 2020, fechaRegistro: "2026-03-05", fuente: "Manual", notifWhatsapp: false, notifEmail: true },
];

const PROVEEDORES_INIT = [
  { id: 1, nombre: "Desarmadería El Rey", tel: "+56 9 4444 5555", email: "elrey@gmail.com", especialidad: ["Toyota", "Nissan", "Mitsubishi"], ubicacion: "San Bernardo, Santiago", rating: 5, tiempoResp: "2h" },
  { id: 2, nombre: "Repuestos Japoneses Ltda.", tel: "+56 9 6666 7777", email: "repjaponeses@gmail.com", especialidad: ["Toyota", "Suzuki", "Mazda"], ubicacion: "Lo Espejo, Santiago", rating: 4, tiempoResp: "4h" },
  { id: 3, nombre: "AutoPartes del Sur", tel: "+56 9 8888 9999", email: "autopartessur@gmail.com", especialidad: ["Hyundai", "Kia"], ubicacion: "Puente Alto, Santiago", rating: 5, tiempoResp: "1h" },
  { id: 4, nombre: "Desarmadería Coreana", tel: "+56 9 1111 2222", email: "descoreana@gmail.com", especialidad: ["Hyundai", "Kia", "Chevrolet"], ubicacion: "Maipú, Santiago", rating: 4, tiempoResp: "3h" },
  { id: 5, nombre: "Chasis y Más", tel: "+56 9 3333 4444", email: "chasisymas@gmail.com", especialidad: ["Chevrolet", "Nissan"], ubicacion: "La Cisterna, Santiago", rating: 3, tiempoResp: "6h" },
  { id: 6, nombre: "Full Repuestos Camionetas", tel: "+56 9 5555 6666", email: "fullrepuestos@gmail.com", especialidad: ["Toyota", "Nissan", "Mitsubishi"], ubicacion: "Quilicura, Santiago", rating: 4, tiempoResp: "2h" },
  { id: 7, nombre: "Desarmadería La Ruta", tel: "+56 9 7777 0000", email: "laruta@gmail.com", especialidad: ["Mazda", "Suzuki", "Hyundai"], ubicacion: "Rancagua", rating: 3, tiempoResp: "8h" },
];

const SOLICITUDES_INIT = [
  { id: 1, autoId: 4, piezas: [{ nombre: "Radiador", cotizado: false, comprado: false }, { nombre: "Faro derecho", cotizado: true, comprado: false }], proveedoresIds: [3, 4], estado: "Cotizada", fecha: "2026-03-25" },
  { id: 2, autoId: 6, piezas: [{ nombre: "Puerta delantera izquierda", cotizado: true, comprado: false }, { nombre: "Espejo izquierdo", cotizado: false, comprado: false }, { nombre: "Faro antiniebla", cotizado: false, comprado: false }], proveedoresIds: [1, 5, 6], estado: "Enviada", fecha: "2026-03-29" },
  { id: 3, autoId: 8, piezas: [{ nombre: "Capó", cotizado: false, comprado: false }, { nombre: "Radiador", cotizado: false, comprado: false }, { nombre: "Parachoques delantero", cotizado: false, comprado: false }, { nombre: "Faro izquierdo", cotizado: false, comprado: false }, { nombre: "Faro derecho", cotizado: false, comprado: false }], proveedoresIds: [1, 2, 6], estado: "Enviada", fecha: "2026-03-30" },
];

const SOLICITUDES_HISTORIAL = [
  { id: 100, autoId: 1, piezas: ["Capó", "Parachoques delantero", "Faro izquierdo"], proveedor: "Desarmadería El Rey", costo: 820000, fecha: "2025-12-18" },
  { id: 101, autoId: 2, piezas: ["Puerta trasera derecha", "Espejo lateral derecho"], proveedor: "AutoPartes del Sur", costo: 450000, fecha: "2025-12-02" },
  { id: 102, autoId: 5, piezas: ["Guardabarro delantero", "Espejo izquierdo"], proveedor: "Repuestos Japoneses Ltda.", costo: 280000, fecha: "2025-12-10" },
  { id: 103, autoId: 7, piezas: ["Parachoques delantero", "Capó"], proveedor: "Repuestos Japoneses Ltda.", costo: 520000, fecha: "2025-10-20" },
  { id: 104, autoId: 9, piezas: ["Guardabarro trasero", "Foco trasero", "Tapa maleta"], proveedor: "Repuestos Japoneses Ltda.", costo: 380000, fecha: "2026-01-25" },
  { id: 105, autoId: 10, piezas: ["Puerta delantera derecha", "Puerta trasera derecha", "Espejo derecho"], proveedor: "AutoPartes del Sur", costo: 620000, fecha: "2025-12-28" },
];

const PIPELINE_INIT = {
  Notificado: [
    { id: "p1", compradorId: 5, autoId: 2, dias: 1 },
    { id: "p2", compradorId: 4, autoId: 1, dias: 2 },
    { id: "p3", compradorId: 7, autoId: 1, dias: 1 },
    { id: "p4", compradorId: 6, autoId: 9, dias: 3 },
  ],
  Interesado: [
    { id: "p5", compradorId: 2, autoId: 2, dias: 3 },
    { id: "p6", compradorId: 3, autoId: 3, dias: 5 },
    { id: "p7", compradorId: 8, autoId: 5, dias: 2 },
  ],
  "En negociación": [
    { id: "p8", compradorId: 1, autoId: 1, dias: 4 },
    { id: "p9", compradorId: 4, autoId: 4, dias: 6 },
  ],
  Reservado: [
    { id: "p10", compradorId: 2, autoId: 10, dias: 2 },
  ],
  Vendido: [
    { id: "p11", compradorId: 0, autoId: 7, dias: 0, nombreOverride: "Carlos Rojas" },
  ],
};

const CAMPAÑAS = [
  { id: 1, nombre: "Prospección Desarmadurerías RM", fecha: "2026-03-15", enviados: 45, abiertos: 28, respondidos: 8 },
  { id: 2, nombre: "Nuevos vehículos disponibles - Marzo", fecha: "2026-03-20", enviados: 32, abiertos: 22, respondidos: 12 },
  { id: 3, nombre: "Ofertas especiales Pickup", fecha: "2026-02-28", enviados: 18, abiertos: 14, respondidos: 6 },
];

const CATALOGO_REPUESTOS = [
  "Capó", "Parachoques delantero", "Parachoques trasero", "Faro izquierdo", "Faro derecho",
  "Foco trasero izquierdo", "Foco trasero derecho", "Espejo izquierdo", "Espejo derecho",
  "Puerta delantera izquierda", "Puerta delantera derecha", "Puerta trasera izquierda", "Puerta trasera derecha",
  "Guardabarro delantero", "Guardabarro trasero", "Radiador", "Moldura lateral",
  "Tapa maleta", "Faro antiniebla", "Vidrio parabrisas", "Vidrio trasero",
];

const TIPOS = ["SUV", "Pickup", "Sedán", "Hatchback"];
const MARCAS = ["Toyota", "Hyundai", "Chevrolet", "Kia", "Suzuki", "Nissan", "Mazda", "Mitsubishi"];

function calcMatches(autos, compradores) {
  const matches = [];
  const disponibles = autos.filter(a => ["Listo para venta", "Publicado"].includes(a.estado));
  for (const auto of disponibles) {
    for (const comp of compradores) {
      let score = 0;
      let reasons = [];
      if (comp.marcas.includes(auto.marca)) { score += 35; reasons.push("Marca"); }
      if (comp.tipos.includes(auto.tipo)) { score += 25; reasons.push("Tipo"); }
      if (auto.precio >= comp.presMin && auto.precio <= comp.presMax) { score += 25; reasons.push("Precio"); }
      else if (auto.precio >= comp.presMin * 0.9 && auto.precio <= comp.presMax * 1.1) { score += 12; reasons.push("Precio~"); }
      if (auto.año >= comp.añoMin) { score += 15; reasons.push("Año"); }
      if (score >= 50) {
        matches.push({ autoId: auto.id, compradorId: comp.id, score, reasons, fecha: new Date().toISOString().split("T")[0] });
      }
    }
  }
  return matches.sort((a, b) => b.score - a.score);
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [autos, setAutos] = useState(AUTOS_INIT);
  const [compradores, setCompradores] = useState(COMPRADORES_INIT);
  const [proveedores, setProveedores] = useState(PROVEEDORES_INIT);
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INIT);
  const [pipeline, setPipeline] = useState(PIPELINE_INIT);
  const [loggedInBuyer, setLoggedInBuyer] = useState(null);

  const matches = useMemo(() => calcMatches(autos, compradores), [autos, compradores]);

  const addAuto = useCallback((auto) => {
    setAutos(prev => [...prev, { ...auto, id: Math.max(...prev.map(a => a.id)) + 1 }]);
  }, []);

  const updateAutoEstado = useCallback((id, estado) => {
    setAutos(prev => prev.map(a => a.id === id ? { ...a, estado } : a));
  }, []);

  const toggleRepuesto = useCallback((autoId, repNombre) => {
    setAutos(prev => prev.map(a => {
      if (a.id !== autoId) return a;
      return { ...a, repuestos: a.repuestos.map(r => r.nombre === repNombre ? { ...r, estado: r.estado === "Recibido" ? "Pendiente" : "Recibido" } : r) };
    }));
  }, []);

  const updatePublicacion = useCallback((autoId, canal, nuevoEstado) => {
    setAutos(prev => prev.map(a => {
      if (a.id !== autoId) return a;
      return { ...a, publicaciones: a.publicaciones.map(p => p.canal === canal ? { ...p, estado: nuevoEstado, fecha: nuevoEstado === "Publicado" ? "2026-04-01" : p.fecha } : p) };
    }));
  }, []);

  const addComprador = useCallback((comp) => {
    const newComp = { ...comp, id: Math.max(...compradores.map(c => c.id)) + 1, fechaRegistro: "2026-04-01", fuente: "Portal" };
    setCompradores(prev => [...prev, newComp]);
    setLoggedInBuyer(newComp.id);
    return newComp;
  }, [compradores]);

  const addProveedor = useCallback((prov) => {
    setProveedores(prev => [...prev, { ...prov, id: Math.max(...prev.map(p => p.id)) + 1 }]);
  }, []);

  const addSolicitud = useCallback((sol) => {
    setSolicitudes(prev => [...prev, { ...sol, id: Math.max(0, ...prev.map(s => s.id)) + 1 }]);
  }, []);

  const movePipeline = useCallback((itemId, fromCol, toCol) => {
    setPipeline(prev => {
      const item = prev[fromCol]?.find(i => i.id === itemId);
      if (!item) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(i => i.id !== itemId),
        [toCol]: [...(prev[toCol] || []), { ...item, dias: 0 }],
      };
    });
  }, []);

  const value = {
    autos, compradores, proveedores, solicitudes, solicitudesHistorial: SOLICITUDES_HISTORIAL,
    pipeline, matches, campañas: CAMPAÑAS, loggedInBuyer,
    addAuto, updateAutoEstado, toggleRepuesto, updatePublicacion,
    addComprador, addProveedor, addSolicitud, movePipeline,
    setLoggedInBuyer,
    TIPOS, MARCAS, CATALOGO_REPUESTOS, fmt,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
