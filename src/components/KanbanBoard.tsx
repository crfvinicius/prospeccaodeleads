"use client";

import { useEffect, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { Users, Globe, MessageCircle, Trophy } from "lucide-react";
import { KANBAN_STAGES, type KanbanStageId } from "@/lib/constants";
import type { LeadDTO } from "@/lib/types";
import { KanbanColumn } from "@/components/KanbanColumn";
import { StatCard } from "@/components/ui/StatCard";

export function KanbanBoard() {
  const [leads, setLeads] = useState<LeadDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads ?? []);
        setError(null);
      })
      .catch(() => setError("Não foi possível carregar os leads."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const newStage = over.id as KanbanStageId;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.estagio === newStage) return;

    const previous = leads;
    setLeads((current) =>
      current.map((l) => (l.id === leadId ? { ...l, estagio: newStage } : l))
    );

    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estagio: newStage }),
    });

    if (!res.ok) {
      setLeads(previous);
      setError("Não foi possível mover o lead. Tente novamente.");
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Carregando leads...</p>;
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total de leads" value={leads.length} icon={Users} />
        <StatCard
          label="Com site"
          value={leads.filter((l) => l.temSite).length}
          icon={Globe}
        />
        <StatCard
          label="Com WhatsApp"
          value={leads.filter((l) => l.temWhatsapp).length}
          icon={MessageCircle}
        />
        <StatCard
          label="Fechados"
          value={leads.filter((l) => l.estagio === "FECHADO").length}
          icon={Trophy}
        />
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              label={stage.label}
              tone={stage.tone}
              leads={leads.filter((lead) => lead.estagio === stage.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
