import type { KanbanStageId } from "@/lib/constants";

export interface LeadDTO {
  id: string;
  nome: string;
  telefone: string | null;
  whatsapp: string | null;
  endereco: string | null;
  localidade: string | null;
  nicho: string | null;
  avaliacaoGoogle: number | null;
  totalAvaliacoes: number | null;
  site: string | null;
  temSite: boolean;
  temWhatsapp: boolean;
  origem: string;
  estagio: KanbanStageId;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = "RODANDO" | "PAUSADA" | "CONCLUIDA" | "CANCELADA";

export interface CampaignDTO {
  id: string;
  nome: string;
  mensagem: string;
  status: CampaignStatus;
  intervaloMinSegundos: number;
  intervaloMaxSegundos: number;
  totalLeads: number;
  enviados: number;
  falhas: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignLeadDTO {
  id: string;
  status: "PENDENTE" | "ENVIADO" | "FALHOU" | "PULADO";
  erro: string | null;
  lead: {
    id: string;
    nome: string;
    telefone: string | null;
    whatsapp: string | null;
  };
}
