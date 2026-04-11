import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Pipeline from "./pages/Pipeline";
import Leads from "./pages/Leads";
import LeadDetalhe from "./pages/LeadDetalhe";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Pipeline />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/lead/:id" element={<LeadDetalhe />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
