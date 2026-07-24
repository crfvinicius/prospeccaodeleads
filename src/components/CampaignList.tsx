"use client";

import { useEffect, useRef, useState } from "react";
import type { CampaignDTO, CampaignLeadDTO } from "@/lib/types";

const STATUS_LABEL: Record<CampaignDTO["status"], string> = {
  RODANDO: "Rodando",
  PAUSADA: "Pausada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

function CampaignDetails({ campaignId }: { campaignId: string }) {
  const [leads, setLeads] = useState<CampaignLeadDTO[] | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/${campaignId}`)
      .then((res) => res.json())
      .then((data) => setLeads(data.campaign?.leads ?? []));
  }, [campaignId]);

  if (!leads) return <p className="text-xs text-neutral-500">Carregando...</p>;

  return (
    <ul className="mt-2 max-h-48 overflow-y-auto rounded border border-black/10 text-xs dark:border-white/10">
      {leads.map((cl) => (
        <li
          key={cl.id}
          className="flex items-center justify-between border-b border-black/5 p-1.5 last:border-0 dark:border-white/5"
        >
          <span>{cl.lead.nome}</span>
          <span
            className={
              cl.status === "ENVIADO"
                ? "text-green-600"
                : cl.status === "FALHOU"
                  ? "text-red-600"
                  : cl.status === "PULADO"
                    ? "text-amber-600"
                    : "text-neutral-500"
            }
          >
            {cl.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CampaignList({ refreshKey }: { refreshKey: number }) {
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadCampaigns() {
    const res = await fetch("/api/campaigns");
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
  }

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns ?? []));
  }, [refreshKey]);

  useEffect(() => {
    pollRef.current = setInterval(loadCampaigns, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleAction(id: string, action: "pause" | "resume" | "cancel") {
    await fetch(`/api/campaigns/${id}/${action}`, { method: "POST" });
    loadCampaigns();
  }

  if (campaigns.length === 0) {
    return <p className="text-sm text-neutral-500">Nenhuma campanha criada ainda.</p>;
  }

  return (
    <div className="grid gap-2">
      {campaigns.map((campaign) => {
        const progresso =
          campaign.totalLeads > 0
            ? Math.round(((campaign.enviados + campaign.falhas) / campaign.totalLeads) * 100)
            : 0;

        return (
          <div
            key={campaign.id}
            className="rounded-md border border-black/10 p-3 text-sm dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{campaign.nome}</p>
              <span className="text-xs text-neutral-500">
                {STATUS_LABEL[campaign.status]}
              </span>
            </div>

            <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-1.5 rounded-full bg-black dark:bg-white"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {campaign.enviados} enviado(s) · {campaign.falhas} falha(s) de{" "}
              {campaign.totalLeads}
            </p>

            <div className="mt-2 flex gap-2">
              {campaign.status === "RODANDO" && (
                <button
                  type="button"
                  onClick={() => handleAction(campaign.id, "pause")}
                  className="rounded border border-black/10 px-2 py-1 text-xs dark:border-white/10"
                >
                  Pausar
                </button>
              )}
              {campaign.status === "PAUSADA" && (
                <button
                  type="button"
                  onClick={() => handleAction(campaign.id, "resume")}
                  className="rounded border border-black/10 px-2 py-1 text-xs dark:border-white/10"
                >
                  Retomar
                </button>
              )}
              {(campaign.status === "RODANDO" || campaign.status === "PAUSADA") && (
                <button
                  type="button"
                  onClick={() => handleAction(campaign.id, "cancel")}
                  className="rounded border border-black/10 px-2 py-1 text-xs text-red-600 dark:border-white/10"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setExpanded((current) => (current === campaign.id ? null : campaign.id))
                }
                className="text-xs text-blue-600 hover:underline"
              >
                {expanded === campaign.id ? "Ocultar leads" : "Ver leads"}
              </button>
            </div>

            {expanded === campaign.id && <CampaignDetails campaignId={campaign.id} />}
          </div>
        );
      })}
    </div>
  );
}
