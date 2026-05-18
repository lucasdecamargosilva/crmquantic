export interface Lead {
  id: string;
  instagram: string;
  nome_loja: string | null;
  site: string | null;
  seguidores: number;
  tem_provador: boolean;
  status: LeadStatus;
  notas: string;
  ponto_positivo: boolean;
  responsavel: string | null;
  categoria: Categoria;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  fonte_oportunidade: string | null;
  created_at: string;
  updated_at: string;
}

export type Categoria = "oculos" | "roupa";

export const CATEGORIAS: Categoria[] = ["oculos", "roupa"];

export const CATEGORIA_LABELS: Record<Categoria, string> = {
  oculos: "Óculos",
  roupa: "Roupa",
};

export const CATEGORIA_HEX: Record<Categoria, string> = {
  oculos: "#8b5cf6",
  roupa: "#ec4899",
};

export type LeadStatus =
  | "novo"
  | "dm_enviada"
  | "respondeu"
  | "lead_coletado"
  | "interessado"
  | "fechou"
  | "sem_site"
  | "parou_responder"
  | "perdida"
  | "descartado";

export const LEAD_STATUSES: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "respondeu",
  "lead_coletado",
  "interessado",
  "fechou",
  "sem_site",
  "parou_responder",
  "perdida",
  "descartado",
];

export const PIPELINE_STATUSES: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "respondeu",
  "lead_coletado",
  "interessado",
  "fechou",
  "sem_site",
  "parou_responder",
  "perdida",
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
  lead_coletado: "Lead Coletado",
  interessado: "Interessado",
  fechou: "Fechou",
  sem_site: "Sem Site",
  parou_responder: "Parou de Responder",
  perdida: "Perdida",
  descartado: "Descartado",
};

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  novo: { bg: "bg-violet/10", text: "text-violet-light", dot: "bg-violet" },
  dm_enviada: { bg: "bg-cyan/10", text: "text-cyan", dot: "bg-cyan" },
  respondeu: { bg: "bg-amber/10", text: "text-amber", dot: "bg-amber" },
  lead_coletado: { bg: "bg-pink/10", text: "text-pink", dot: "bg-pink" },
  interessado: { bg: "bg-rose/10", text: "text-rose", dot: "bg-rose" },
  fechou: { bg: "bg-emerald/10", text: "text-emerald", dot: "bg-emerald" },
  sem_site: { bg: "bg-yellow/10", text: "text-yellow", dot: "bg-yellow" },
  parou_responder: { bg: "bg-stone/10", text: "text-stone", dot: "bg-stone" },
  perdida: { bg: "bg-orange/10", text: "text-orange", dot: "bg-orange" },
  descartado: { bg: "bg-dim/10", text: "text-dim", dot: "bg-dim" },
};

export const STATUS_HEX: Record<LeadStatus, string> = {
  novo: "#8b5cf6",
  dm_enviada: "#06b6d4",
  respondeu: "#f59e0b",
  lead_coletado: "#ec4899",
  interessado: "#f43f5e",
  fechou: "#10b981",
  sem_site: "#eab308",
  parou_responder: "#78716c",
  perdida: "#f97316",
  descartado: "#52525b",
};
