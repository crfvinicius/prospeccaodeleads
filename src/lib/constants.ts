export const KANBAN_STAGES = [
  { id: "NOVO", label: "Novo", tone: "neutral" },
  { id: "CONTATADO", label: "Contatado", tone: "blue" },
  { id: "RESPONDEU", label: "Respondeu", tone: "purple" },
  { id: "NEGOCIANDO", label: "Negociando", tone: "amber" },
  { id: "FECHADO", label: "Fechado", tone: "green" },
  { id: "PERDIDO", label: "Perdido", tone: "red" },
] as const;

export type KanbanStageId = (typeof KANBAN_STAGES)[number]["id"];
