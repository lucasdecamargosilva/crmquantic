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
  | "mensagem_1"
  | "mensagem_2"
  | "mensagem_3"
  | "email_enviado"
  | "fotos_enviadas"
  | "respondeu"
  | "lead_coletado"
  | "interessado"
  | "reuniao_agendada"
  | "testando"
  | "stand_by"
  | "fechou"
  | "sem_site"
  | "parou_responder"
  | "perdida"
  | "descartado";

export const LEAD_STATUSES: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "mensagem_1",
  "mensagem_2",
  "mensagem_3",
  "email_enviado",
  "fotos_enviadas",
  "respondeu",
  "lead_coletado",
  "interessado",
  "reuniao_agendada",
  "testando",
  "stand_by",
  "fechou",
  "sem_site",
  "parou_responder",
  "perdida",
  "descartado",
];

export const PIPELINE_STATUSES: LeadStatus[] = [
  "novo",
  "dm_enviada",
  "mensagem_1",
  "mensagem_2",
  "mensagem_3",
  "email_enviado",
  "fotos_enviadas",
  "respondeu",
  "lead_coletado",
  "interessado",
  "reuniao_agendada",
  "testando",
  "stand_by",
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
  mensagem_1: "Mensagem 1",
  mensagem_2: "Mensagem 2",
  mensagem_3: "Mensagem 3",
  email_enviado: "Email Enviado",
  fotos_enviadas: "Fotos Enviadas",
  respondeu: "Respondeu",
  lead_coletado: "Lead Coletado",
  interessado: "Interessado",
  reuniao_agendada: "Reunião Agendada",
  testando: "Testando",
  stand_by: "Stand By",
  fechou: "Fechou",
  sem_site: "Sem Site",
  parou_responder: "Parou de Responder",
  perdida: "Perdida",
  descartado: "Descartado",
};

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  novo: { bg: "bg-violet/10", text: "text-violet-light", dot: "bg-violet" },
  dm_enviada: { bg: "bg-cyan/10", text: "text-cyan", dot: "bg-cyan" },
  mensagem_1: { bg: "bg-cyan/10", text: "text-cyan", dot: "bg-cyan" },
  mensagem_2: { bg: "bg-cyan/10", text: "text-cyan", dot: "bg-cyan" },
  mensagem_3: { bg: "bg-cyan/10", text: "text-cyan", dot: "bg-cyan" },
  email_enviado: { bg: "bg-cyan/10", text: "text-cyan", dot: "bg-cyan" },
  fotos_enviadas: { bg: "bg-amber/10", text: "text-amber", dot: "bg-amber" },
  respondeu: { bg: "bg-amber/10", text: "text-amber", dot: "bg-amber" },
  lead_coletado: { bg: "bg-pink/10", text: "text-pink", dot: "bg-pink" },
  interessado: { bg: "bg-rose/10", text: "text-rose", dot: "bg-rose" },
  reuniao_agendada: { bg: "bg-rose/10", text: "text-rose", dot: "bg-rose" },
  testando: { bg: "bg-rose/10", text: "text-rose", dot: "bg-rose" },
  stand_by: { bg: "bg-muted/10", text: "text-muted", dot: "bg-muted" },
  fechou: { bg: "bg-emerald/10", text: "text-emerald", dot: "bg-emerald" },
  sem_site: { bg: "bg-yellow/10", text: "text-yellow", dot: "bg-yellow" },
  parou_responder: { bg: "bg-stone/10", text: "text-stone", dot: "bg-stone" },
  perdida: { bg: "bg-orange/10", text: "text-orange", dot: "bg-orange" },
  descartado: { bg: "bg-dim/10", text: "text-dim", dot: "bg-dim" },
};

export const STATUS_HEX: Record<LeadStatus, string> = {
  novo: "#8b5cf6",
  dm_enviada: "#06b6d4",
  mensagem_1: "#22d3ee",
  mensagem_2: "#22d3ee",
  mensagem_3: "#22d3ee",
  email_enviado: "#14b8a6",
  fotos_enviadas: "#f59e0b",
  respondeu: "#f59e0b",
  lead_coletado: "#ec4899",
  interessado: "#f43f5e",
  reuniao_agendada: "#e11d48",
  testando: "#fb7185",
  stand_by: "#71717a",
  fechou: "#10b981",
  sem_site: "#eab308",
  parou_responder: "#78716c",
  perdida: "#f97316",
  descartado: "#52525b",
};
