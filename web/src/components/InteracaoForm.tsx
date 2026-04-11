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
        className="bg-abyss border border-border-subtle rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent-dim/40 transition-all text-soft"
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
        className="flex-1 bg-abyss border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent-dim/40 focus:ring-1 focus:ring-accent-dim/15 transition-all placeholder:text-muted/40"
      />
      <button
        type="submit"
        disabled={saving || !conteudo.trim()}
        className="bg-gradient-to-r from-accent-dim to-accent hover:from-accent hover:to-accent-bright disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 glow-accent"
      >
        {saving ? "..." : "Adicionar"}
      </button>
    </form>
  );
}
