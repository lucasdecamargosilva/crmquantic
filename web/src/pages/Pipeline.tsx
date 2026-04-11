import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Lead, LeadStatus } from "../types";
import {
  PIPELINE_STATUSES,
  STATUS_LABELS,
  STATUS_HEX,
  STATUS_BORDER,
} from "../types";

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  }

  async function moveToStatus(leadId: string, newStatus: LeadStatus) {
    await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  }

  function handleDragStart(leadId: string) {
    setDragging(leadId);
  }

  function handleDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    setDragOver(status);
  }

  function handleDrop(status: LeadStatus) {
    if (dragging) {
      moveToStatus(dragging, status);
    }
    setDragging(null);
    setDragOver(null);
  }

  function handleDragEnd() {
    setDragging(null);
    setDragOver(null);
  }

  const grouped = PIPELINE_STATUSES.reduce(
    (acc, status) => {
      acc[status] = leads.filter((l) => l.status === status);
      return acc;
    },
    {} as Record<LeadStatus, Lead[]>
  );

  const descartados = leads.filter((l) => l.status === "descartado");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Pipeline</h2>
          <p className="text-muted text-sm mt-1">
            {leads.length} leads total &middot; Arraste para mover entre etapas
          </p>
        </div>
        {descartados.length > 0 && (
          <span className="text-xs text-muted bg-elevated px-3 py-1.5 rounded-lg border border-border-subtle">
            {descartados.length} descartado{descartados.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Pipeline columns */}
      <div className="flex-1 px-6 pb-6 flex gap-4 overflow-x-auto">
        {PIPELINE_STATUSES.map((status, idx) => {
          const items = grouped[status];
          const isOver = dragOver === status;
          const hex = STATUS_HEX[status];

          return (
            <div
              key={status}
              className={`pipeline-col flex-1 min-w-[220px] max-w-[300px] flex flex-col rounded-2xl border transition-all duration-300 ${
                isOver
                  ? `border-[${hex}]/40 bg-[${hex}]/5`
                  : "border-border-subtle bg-surface/30"
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(status)}
              style={{
                animationDelay: `${idx * 60}ms`,
              }}
            >
              {/* Column header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle/50">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full status-dot"
                    style={{ background: hex }}
                  />
                  <span className="font-display text-sm font-semibold text-soft">
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{
                    color: hex,
                    background: `${hex}15`,
                  }}
                >
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {items.map((lead, i) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => navigate(`/lead/${lead.id}`)}
                    className={`card-animate glass glass-hover rounded-xl p-3.5 cursor-pointer group transition-all duration-200 ${
                      dragging === lead.id ? "opacity-40 scale-95" : ""
                    } ${STATUS_BORDER[status]}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-display font-semibold text-sm text-white leading-tight truncate pr-2">
                        {lead.nome_loja ?? `@${lead.instagram}`}
                      </p>
                      <svg
                        className="w-3.5 h-3.5 text-muted/0 group-hover:text-muted transition-all shrink-0 mt-0.5"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-xs text-muted truncate">@{lead.instagram}</p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border-subtle/40">
                      <span className="text-[11px] text-muted">
                        {lead.seguidores.toLocaleString("pt-BR")} seg.
                      </span>
                      <span className="text-[11px] text-muted">
                        {new Date(lead.updated_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div
                    className={`rounded-xl border border-dashed p-6 text-center transition-colors ${
                      isOver ? "border-accent/40 bg-accent/5" : "border-border-subtle"
                    }`}
                  >
                    <p className="text-xs text-muted">
                      {isOver ? "Solte aqui" : "Nenhum lead"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
