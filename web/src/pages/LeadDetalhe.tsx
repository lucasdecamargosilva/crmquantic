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

  if (loading) return <p className="text-gray-500">Carregando...</p>;
  if (!lead) return <p className="text-gray-500">Lead nao encontrado.</p>;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/")}
        className="text-gray-400 hover:text-white text-sm mb-4 inline-block transition-colors"
      >
        ← Voltar
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{lead.nome_loja ?? lead.instagram}</h2>
          <p className="text-gray-400 mt-1">@{lead.instagram} · {lead.seguidores.toLocaleString("pt-BR")} seguidores</p>
        </div>
        <StatusBadge status={lead.status} onChange={updateStatus} />
      </div>

      <div className="flex gap-3 mb-6">
        <a
          href={`https://instagram.com/${lead.instagram}`}
          target="_blank"
          rel="noreferrer"
          className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Abrir Instagram
        </a>
        {lead.site && (
          <a
            href={lead.site}
            target="_blank"
            rel="noreferrer"
            className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Abrir Site
          </a>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Notas</h3>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={salvarNotas}
          placeholder="Adicione notas sobre esse lead..."
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Interacoes</h3>
        <InteracaoForm leadId={lead.id} onSaved={fetchInteracoes} />

        <div className="mt-4 space-y-3">
          {interacoes.map((interacao) => (
            <div
              key={interacao.id}
              className="flex gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800/50"
            >
              <span className="text-lg">{TIPO_ICONS[interacao.tipo] ?? "📌"}</span>
              <div className="flex-1">
                <p className="text-sm">{interacao.conteudo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(interacao.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
          {interacoes.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhuma interacao registrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
