"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LeadDTO } from "@/lib/types";
import type { KANBAN_STAGES } from "@/lib/constants";
import { LeadCard } from "@/components/LeadCard";

const DOT_TONE_CLASSES: Record<(typeof KANBAN_STAGES)[number]["tone"], string> = {
  neutral: "bg-neutral-400",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  red: "bg-red-500",
};

export function KanbanColumn({
  id,
  label,
  tone,
  leads,
}: {
  id: string;
  label: string;
  tone: (typeof KANBAN_STAGES)[number]["tone"];
  leads: LeadDTO[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col gap-2 rounded-xl border p-2 transition-colors ${
        isOver
          ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
          : "border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900"
      }`}
    >
      <div className="flex items-center gap-2 px-1 py-1">
        <span className={`h-2 w-2 rounded-full ${DOT_TONE_CLASSES[tone]}`} />
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="ml-auto text-xs text-neutral-400">{leads.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
