export const KANBAN_STAGES = [
  { id: "NOVO", label: "Novo" },
  { id: "CONTATADO", label: "Contatado" },
  { id: "RESPONDEU", label: "Respondeu" },
  { id: "NEGOCIANDO", label: "Negociando" },
  { id: "FECHADO", label: "Fechado" },
  { id: "PERDIDO", label: "Perdido" },
] as const;

export type KanbanStageId = (typeof KANBAN_STAGES)[number]["id"];
