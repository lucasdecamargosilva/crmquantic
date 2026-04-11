import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Lead, Interacao, LeadStatus } from "../types";
import StatusBadge from "../components/StatusBadge";
import InteracaoForm from "../components/InteracaoForm";

const TIPO_ICONS: Record<string, string> = {
  dm_enviada: "📩",
  resposta: "💬",
  follow_up: "🔄",
  nota: "📝",
};

const TIPO_LABELS: Record<string, string> = {
  dm_enviada: "DM Enviada",
  resposta: "Resposta",
  follow_up: "Follow-up",
  nota: "Nota",
};

export default function LeadDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLead();
      fetchInteracoes();
    }
  }, [id]);

  async function fetchLead() {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setLead(data);
      setNotas(data.notas ?? "");
    }
    setLoading(false);
  }

  async function fetchInteracoes() {
    const { data } = await supabase
      .from("interacoes")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false });
    setInteracoes(data ?? []);
  }

  async function updateStatus(status: LeadStatus) {
    await supabase.from("leads").update({ status }).eq("id", id);
    setLead((prev) => (prev ? { ...prev, status } : null));
  }

  async function salvarNotas() {
    await supabase.from("leads").update({ notas }).eq("id", id);
    setLead((prev) => (prev ? { ...prev, notas } : null));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">Lead nao encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted hover:text-white text-sm mb-6 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      {/* Header card */}
      <div className="glass rounded-2xl p-6 mb-6 glow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {lead.nome_loja ?? `@${lead.instagram}`}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-muted text-sm">@{lead.instagram}</span>
              <span className="text-border">·</span>
              <span className="text-muted text-sm font-mono">{lead.seguidores.toLocaleString("pt-BR")} seguidores</span>
            </div>
          </div>
          <StatusBadge status={lead.status} onChange={updateStatus} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <a
            href={`https://instagram.com/${lead.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-elevated hover:bg-border-subtle text-sm px-4 py-2.5 rounded-xl transition-all border border-border-subtle hover:border-border font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
          {lead.site && (
            <a
              href={lead.site}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-elevated hover:bg-border-subtle text-sm px-4 py-2.5 rounded-xl transition-all border border-border-subtle hover:border-border font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Site
            </a>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-display text-xs font-semibold text-muted uppercase tracking-wider mb-3">Notas</h3>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={salvarNotas}
          placeholder="Adicione notas sobre esse lead..."
          rows={3}
          className="w-full bg-abyss border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-dim/40 focus:ring-1 focus:ring-accent-dim/15 resize-none transition-all placeholder:text-muted/40"
        />
      </div>

      {/* Interactions */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display text-xs font-semibold text-muted uppercase tracking-wider mb-4">Interacoes</h3>
        <InteracaoForm leadId={lead.id} onSaved={fetchInteracoes} />

        <div className="mt-5 space-y-3">
          {interacoes.map((interacao, i) => (
            <div
              key={interacao.id}
              className="card-animate flex gap-4 p-4 bg-abyss/60 rounded-xl border border-border-subtle/40 hover:border-border-subtle transition-colors"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-xl shrink-0">{TIPO_ICONS[interacao.tipo] ?? "📌"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-accent-bright">
                    {TIPO_LABELS[interacao.tipo] ?? interacao.tipo}
                  </span>
                  <span className="text-[11px] text-muted">
                    {new Date(interacao.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-soft leading-relaxed">{interacao.conteudo}</p>
              </div>
            </div>
          ))}
          {interacoes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted text-sm">Nenhuma interacao registrada.</p>
              <p className="text-muted/50 text-xs mt-1">Adicione a primeira acima.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
