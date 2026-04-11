import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LEAD_STATUSES, STATUS_LABELS } from "../types";
import type { Lead, LeadStatus } from "../types";
import StatusBadge from "../components/StatusBadge";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<LeadStatus | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, [filtroStatus]);

  async function fetchLeads() {
    setLoading(true);
    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (filtroStatus !== "todos") {
      query = query.eq("status", filtroStatus);
    }

    const { data } = await query;
    setLeads(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: LeadStatus) {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  }

  const filtered = leads.filter((l) => {
    const term = busca.toLowerCase();
    return (
      l.instagram.toLowerCase().includes(term) ||
      (l.nome_loja ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Leads</h2>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por nome ou @instagram..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:border-gray-500"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as LeadStatus | "todos")}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
        >
          <option value="todos">Todos os status</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="pb-3 pr-4">Loja</th>
                <th className="pb-3 pr-4">Instagram</th>
                <th className="pb-3 pr-4">Site</th>
                <th className="pb-3 pr-4">Seguidores</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigate(`/lead/${lead.id}`)}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 pr-4 font-medium">{lead.nome_loja ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-400">@{lead.instagram}</td>
                  <td className="py-3 pr-4">
                    <a
                      href={lead.site ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:underline"
                    >
                      {lead.site ? new URL(lead.site).hostname : "—"}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {lead.seguidores.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge
                      status={lead.status}
                      onChange={(s) => updateStatus(lead.id, s)}
                    />
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum lead encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
