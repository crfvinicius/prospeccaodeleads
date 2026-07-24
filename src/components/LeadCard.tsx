"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { Star, Globe, MessageCircle } from "lucide-react";
import type { LeadDTO } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function LeadCard({ lead }: { lead: LeadDTO }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState(
    `Olá, ${lead.nome}! Tudo bem? Encontrei seu negócio e gostaria de conversar.`
  );
  const [showForm, setShowForm] = useState(false);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  async function handleSend() {
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, mensagem }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error ?? "Falha ao enviar mensagem.");
      } else {
        setFeedback("Mensagem enviada.");
        setShowForm(false);
      }
    } catch {
      setFeedback("Erro de rede ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-black/10 bg-white p-3 text-sm shadow-sm dark:border-white/10 dark:bg-neutral-900"
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <p className="font-medium">{lead.nome}</p>
        <p className="text-xs text-neutral-500">
          {[lead.localidade, lead.nicho].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {lead.avaliacaoGoogle != null && (
            <Badge tone="amber">
              <Star size={11} className="mr-0.5 fill-current" />
              {lead.avaliacaoGoogle.toFixed(1)}
            </Badge>
          )}
          {lead.temSite && (
            <Badge tone="blue">
              <Globe size={11} className="mr-1" />
              site
            </Badge>
          )}
          {lead.temWhatsapp && (
            <Badge tone="green">
              <MessageCircle size={11} className="mr-1" />
              whatsapp
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-2">
        {!showForm ? (
          <Button
            variant="ghost"
            size="sm"
            className="!px-0"
            onClick={() => setShowForm(true)}
            disabled={!lead.telefone && !lead.whatsapp}
          >
            Enviar mensagem
          </Button>
        ) : (
          <div className="mt-1 flex flex-col gap-1">
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
              className="w-full rounded border border-black/10 p-1 text-xs dark:border-white/10 dark:bg-neutral-800"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSend} disabled={sending}>
                {sending ? "Enviando..." : "Enviar"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
        {feedback && <p className="mt-1 text-xs text-neutral-500">{feedback}</p>}
      </div>
    </div>
  );
}
