import { useState } from "react";
import { INTERACAO_TIPOS } from "../types";
import type { InteracaoTipo } from "../types";
import { supabase } from "../lib/supabase";

const TIPO_LABELS: Record<InteracaoTipo, string> = {
  dm_enviada: "DM Enviada",
  resposta: "Resposta",
  follow_up: "Follow-up",
  nota: "Nota",
};

interface Props {
  leadId: string;
  onSaved: () => void;
}

export default function InteracaoForm({ leadId, onSaved }: Props) {
  const [tipo, setTipo] = useState<InteracaoTipo>("dm_enviada");
  const [conteudo, setConteudo] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!conteudo.trim()) return;

    setSaving(true);
    await supabase.from("interacoes").insert({
      lead_id: leadId,
      tipo,
      conteudo: conteudo.trim(),
    });

    setConteudo("");
    setSaving(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as InteracaoTipo)}
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
      >
        {INTERACAO_TIPOS.map((t) => (
          <option key={t} value={t}>
            {TIPO_LABELS[t]}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Descreva a interacao..."
        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
      />
      <button
        type="submit"
        disabled={saving || !conteudo.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {saving ? "Salvando..." : "Adicionar"}
      </button>
    </form>
  );
}
