import { Routes, Route } from "react-router-dom";
import Propuesta from "./pages/Propuesta";
import Demo from "./pages/Demo";
import PortalCliente from "./components/PortalCliente";
import AdminCRM from "./components/AdminCRM";
import { DataProvider } from "./DataContext";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Propuesta />} />
      <Route path="/demo" element={<Demo />} />
      <Route
        path="/demo/cliente"
        element={
          <DataProvider>
            <PortalCliente />
          </DataProvider>
        }
      />
      <Route
        path="/demo/admin"
        element={
          <DataProvider>
            <AdminCRM />
          </DataProvider>
        }
      />
    </Routes>
  );
}
