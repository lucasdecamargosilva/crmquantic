export interface Lead {
  id: string;
  instagram: string;
  nome_loja: string | null;
  site: string | null;
  seguidores: number;
  tem_provador: boolean;
  status: LeadStatus;
  notas: string;
  created_at: string;
  updated_at: string;
}

export type LeadStatus =
  | "novo"
  | "dm_enviada"
  | "respondeu"
  | "interessado"
  | "fechou"
  | "descartado";

export const LEAD_STATUSES: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "respondeu",
  "interessado",
  "fechou",
  "descartado",
];

export const PIPELINE_STATUSES: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "respondeu",
  "interessado",
  "fechou",
];

export interface Interacao {
  id: string;
  lead_id: string;
  tipo: InteracaoTipo;
  conteudo: string;
  created_at: string;
}

export type InteracaoTipo = "dm_enviada" | "resposta" | "follow_up" | "nota";

export const INTERACAO_TIPOS: InteracaoTipo[] = [
  "dm_enviada",
  "resposta",
  "follow_up",
  "nota",
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  dm_enviada: "DM Enviada",
  respondeu: "Respondeu",
  interessado: "Interessado",
  fechou: "Fechou",
  descartado: "Descartado",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: "bg-violet-500",
  dm_enviada: "bg-purple-400",
  respondeu: "bg-fuchsia-500",
  interessado: "bg-amber-400",
  fechou: "bg-emerald-400",
  descartado: "bg-zinc-500",
};

export const STATUS_HEX: Record<LeadStatus, string> = {
  novo: "#8b5cf6",
  dm_enviada: "#a78bfa",
  respondeu: "#d946ef",
  interessado: "#fbbf24",
  fechou: "#34d399",
  descartado: "#71717a",
};

export const STATUS_BORDER: Record<LeadStatus, string> = {
  novo: "border-violet-500/30",
  dm_enviada: "border-purple-400/30",
  respondeu: "border-fuchsia-500/30",
  interessado: "border-amber-400/30",
  fechou: "border-emerald-400/30",
  descartado: "border-zinc-500/30",
};
