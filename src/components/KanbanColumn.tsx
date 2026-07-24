"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LeadDTO } from "@/lib/types";
import { LeadCard } from "@/components/LeadCard";

export function KanbanColumn({
  id,
  label,
  leads,
}: {
  id: string;
  label: string;
  leads: LeadDTO[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col gap-2 rounded-lg border p-2 ${
        isOver
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
          : "border-black/10 bg-neutral-50 dark:border-white/10 dark:bg-neutral-950"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-neutral-500">{leads.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
