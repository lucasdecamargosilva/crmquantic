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
    <div className="p-8">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">Leads</h2>
        <p className="text-muted text-sm mt-1">{leads.length} leads coletados</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou @instagram..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-surface border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm w-80 focus:outline-none focus:border-accent-dim/50 focus:ring-1 focus:ring-accent-dim/20 transition-all placeholder:text-muted/60"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as LeadStatus | "todos")}
          className="bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent-dim/50 transition-all text-soft"
        >
          <option value="todos">Todos os status</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-muted text-sm">Carregando...</span>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden glow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-left">
                  <th className="font-display font-semibold px-5 py-4 text-xs uppercase tracking-wider">Loja</th>
                  <th className="font-display font-semibold px-5 py-4 text-xs uppercase tracking-wider">Instagram</th>
                  <th className="font-display font-semibold px-5 py-4 text-xs uppercase tracking-wider">Site</th>
                  <th className="font-display font-semibold px-5 py-4 text-xs uppercase tracking-wider">Seguidores</th>
                  <th className="font-display font-semibold px-5 py-4 text-xs uppercase tracking-wider">Status</th>
                  <th className="font-display font-semibold px-5 py-4 text-xs uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/lead/${lead.id}`)}
                    className="border-b border-border-subtle/50 hover:bg-elevated/40 cursor-pointer transition-all duration-150 group"
                  >
                    <td className="px-5 py-3.5 font-medium text-white">{lead.nome_loja ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted">@{lead.instagram}</td>
                    <td className="px-5 py-3.5">
                      <a
                        href={lead.site ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-accent-bright hover:text-accent hover:underline transition-colors"
                      >
                        {lead.site ? new URL(lead.site).hostname : "—"}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-muted font-mono text-xs">
                      {lead.seguidores.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge
                        status={lead.status}
                        onChange={(s) => updateStatus(lead.id, s)}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </div>
              <p className="text-muted text-sm">Nenhum lead encontrado.</p>
              <p className="text-muted/60 text-xs mt-1">Rode o scraper para coletar leads.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
