import { z } from "zod";

export const leadSearchSchema = z.object({
  localidade: z.string().trim().min(2, "Informe uma localidade"),
  nicho: z.string().trim().min(2, "Informe um nicho"),
  quantidade: z.coerce.number().int().min(1).max(60),
  avaliacaoMinima: z.coerce.number().min(0).max(5).optional(),
  somenteComSite: z.coerce.boolean().optional(),
  somenteSemSite: z.coerce.boolean().optional(),
  somenteComWhatsapp: z.coerce.boolean().optional(),
});

export type LeadSearchInput = z.infer<typeof leadSearchSchema>;

export const leadUpdateSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  telefone: z.string().trim().nullable().optional(),
  whatsapp: z.string().trim().nullable().optional(),
  endereco: z.string().trim().nullable().optional(),
  localidade: z.string().trim().nullable().optional(),
  nicho: z.string().trim().nullable().optional(),
  site: z.string().trim().nullable().optional(),
  observacoes: z.string().trim().nullable().optional(),
  estagio: z
    .enum([
      "NOVO",
      "CONTATADO",
      "RESPONDEU",
      "NEGOCIANDO",
      "FECHADO",
      "PERDIDO",
    ])
    .optional(),
});

export const sendMessageSchema = z.object({
  leadId: z.string().min(1),
  mensagem: z.string().trim().min(1, "Mensagem não pode ser vazia"),
});
