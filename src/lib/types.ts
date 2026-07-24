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
