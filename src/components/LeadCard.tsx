"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import type { LeadDTO } from "@/lib/types";

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
      className="rounded-md border border-black/10 bg-white p-3 text-sm shadow-sm dark:border-white/10 dark:bg-neutral-900"
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
        <div className="mt-1 flex flex-wrap gap-1 text-xs text-neutral-500">
          {lead.avaliacaoGoogle != null && (
            <span>⭐ {lead.avaliacaoGoogle.toFixed(1)}</span>
          )}
          {lead.temSite && <span className="text-green-600">site</span>}
          {lead.temWhatsapp && (
            <span className="text-green-600">whatsapp</span>
          )}
        </div>
      </div>

      <div className="mt-2">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={!lead.telefone && !lead.whatsapp}
            className="text-xs text-blue-600 hover:underline disabled:text-neutral-400 disabled:no-underline"
          >
            Enviar mensagem
          </button>
        ) : (
          <div className="mt-1 flex flex-col gap-1">
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
              className="w-full rounded border border-black/10 p-1 text-xs dark:border-white/10 dark:bg-neutral-800"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="rounded bg-green-600 px-2 py-1 text-xs text-white disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-neutral-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {feedback && <p className="mt-1 text-xs text-neutral-500">{feedback}</p>}
      </div>
    </div>
  );
}
