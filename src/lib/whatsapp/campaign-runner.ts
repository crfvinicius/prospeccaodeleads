import { prisma } from "@/lib/prisma";
import { getWhatsAppStatus, sendWhatsAppText } from "@/lib/whatsapp/socket";
import type { LeadModel } from "@/generated/prisma/models";

interface CampaignControl {
  paused: boolean;
  cancelled: boolean;
  running: boolean;
}

declare global {
  var __campaignControls: Map<string, CampaignControl> | undefined;
}

const controls = globalThis.__campaignControls ?? new Map<string, CampaignControl>();
globalThis.__campaignControls = controls;

function getControl(campaignId: string): CampaignControl {
  let control = controls.get(campaignId);
  if (!control) {
    control = { paused: false, cancelled: false, running: false };
    controls.set(campaignId, control);
  }
  return control;
}

function personalize(template: string, lead: LeadModel): string {
  return template
    .replaceAll("{{nome}}", lead.nome)
    .replaceAll("{{nicho}}", lead.nicho ?? "")
    .replaceAll("{{localidade}}", lead.localidade ?? "");
}

function randomDelayMs(minSeconds: number, maxSeconds: number): number {
  const min = Math.min(minSeconds, maxSeconds);
  const max = Math.max(minSeconds, maxSeconds);
  const seconds = min + Math.random() * (max - min);
  return Math.round(seconds * 1000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Dispara (ou retoma) o processamento em background de uma campanha. Não bloqueia o chamador. */
export function runCampaign(campaignId: string): void {
  const control = getControl(campaignId);
  if (control.running) return;
  control.running = true;
  control.cancelled = false;
  control.paused = false;

  processCampaign(campaignId, control).finally(() => {
    control.running = false;
  });
}

async function processCampaign(
  campaignId: string,
  control: CampaignControl
): Promise<void> {
  while (true) {
    if (control.cancelled) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "CANCELADA" },
      });
      return;
    }

    if (control.paused) {
      return;
    }

    if (getWhatsAppStatus().status !== "conectado") {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "PAUSADA" },
      });
      return;
    }

    const next = await prisma.campaignLead.findFirst({
      where: { campaignId, status: "PENDENTE" },
      include: { lead: true },
      orderBy: { id: "asc" },
    });

    if (!next) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "CONCLUIDA" },
      });
      return;
    }

    const campaign = await prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
    });

    const phone = next.lead.whatsapp ?? next.lead.telefone;

    if (!phone) {
      await prisma.campaignLead.update({
        where: { id: next.id },
        data: { status: "PULADO", erro: "Lead sem telefone", processedAt: new Date() },
      });
      continue;
    }

    const texto = personalize(campaign.mensagem, next.lead);
    const message = await prisma.message.create({
      data: { leadId: next.leadId, direcao: "ENVIADA", conteudo: texto, status: "PENDENTE" },
    });

    try {
      await sendWhatsAppText(phone, texto);
      await prisma.$transaction([
        prisma.message.update({ where: { id: message.id }, data: { status: "ENVIADA" } }),
        prisma.campaignLead.update({
          where: { id: next.id },
          data: { status: "ENVIADO", messageId: message.id, processedAt: new Date() },
        }),
        prisma.campaign.update({
          where: { id: campaignId },
          data: { enviados: { increment: 1 } },
        }),
        prisma.lead.update({
          where: { id: next.leadId },
          data: {
            temWhatsapp: true,
            estagio: next.lead.estagio === "NOVO" ? "CONTATADO" : next.lead.estagio,
          },
        }),
      ]);
    } catch (error) {
      const erro = error instanceof Error ? error.message : "Falha ao enviar mensagem.";
      await prisma.$transaction([
        prisma.message.update({ where: { id: message.id }, data: { status: "FALHOU" } }),
        prisma.campaignLead.update({
          where: { id: next.id },
          data: { status: "FALHOU", erro, processedAt: new Date() },
        }),
        prisma.campaign.update({
          where: { id: campaignId },
          data: { falhas: { increment: 1 } },
        }),
      ]);
    }

    await sleep(randomDelayMs(campaign.intervaloMinSegundos, campaign.intervaloMaxSegundos));
  }
}

export function pauseCampaign(campaignId: string): void {
  getControl(campaignId).paused = true;
}

export function cancelCampaign(campaignId: string): void {
  getControl(campaignId).cancelled = true;
}
