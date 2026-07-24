"use client";

import { useEffect, useRef, useState } from "react";
import type { CampaignDTO, CampaignLeadDTO } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABEL: Record<CampaignDTO["status"], string> = {
  RODANDO: "Rodando",
  PAUSADA: "Pausada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

const STATUS_TONE: Record<
  CampaignDTO["status"],
  "neutral" | "amber" | "green" | "red"
> = {
  RODANDO: "green",
  PAUSADA: "amber",
  CONCLUIDA: "neutral",
  CANCELADA: "red",
};

const LEAD_STATUS_TONE: Record<
  CampaignLeadDTO["status"],
  "neutral" | "green" | "red" | "amber"
> = {
  ENVIADO: "green",
  FALHOU: "red",
  PULADO: "amber",
  PENDENTE: "neutral",
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
    <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-black/10 text-xs dark:border-white/10">
      {leads.map((cl) => (
        <li
          key={cl.id}
          className="flex items-center justify-between border-b border-black/5 p-1.5 last:border-0 dark:border-white/5"
        >
          <span>{cl.lead.nome}</span>
          <Badge tone={LEAD_STATUS_TONE[cl.status]}>{cl.status}</Badge>
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
    return (
      <Card>
        <p className="text-sm text-neutral-500">Nenhuma campanha criada ainda.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {campaigns.map((campaign) => {
        const progresso =
          campaign.totalLeads > 0
            ? Math.round(((campaign.enviados + campaign.falhas) / campaign.totalLeads) * 100)
            : 0;

        return (
          <Card key={campaign.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium">{campaign.nome}</p>
              <Badge tone={STATUS_TONE[campaign.status]}>
                {STATUS_LABEL[campaign.status]}
              </Badge>
            </div>

            <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-1.5 rounded-full bg-indigo-600 transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {campaign.enviados} enviado(s) · {campaign.falhas} falha(s) de{" "}
              {campaign.totalLeads}
            </p>

            <div className="mt-3 flex items-center gap-2">
              {campaign.status === "RODANDO" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAction(campaign.id, "pause")}
                >
                  Pausar
                </Button>
              )}
              {campaign.status === "PAUSADA" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAction(campaign.id, "resume")}
                >
                  Retomar
                </Button>
              )}
              {(campaign.status === "RODANDO" || campaign.status === "PAUSADA") && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleAction(campaign.id, "cancel")}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExpanded((current) => (current === campaign.id ? null : campaign.id))
                }
              >
                {expanded === campaign.id ? "Ocultar leads" : "Ver leads"}
              </Button>
            </div>

            {expanded === campaign.id && <CampaignDetails campaignId={campaign.id} />}
          </Card>
        );
      })}
    </div>
  );
}
