import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { campaignCreateSchema } from "@/lib/validation";
import { runCampaign } from "@/lib/whatsapp/campaign-runner";
import { getWhatsAppStatus } from "@/lib/whatsapp/socket";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = campaignCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (getWhatsAppStatus().status !== "conectado") {
    return NextResponse.json(
      { error: "Conecte o WhatsApp antes de criar uma campanha." },
      { status: 409 }
    );
  }

  const { nome, mensagem, leadIds, intervaloMinSegundos, intervaloMaxSegundos } =
    parsed.data;

  const uniqueLeadIds = Array.from(new Set(leadIds));
  const leads = await prisma.lead.findMany({
    where: { id: { in: uniqueLeadIds } },
    select: { id: true },
  });

  if (leads.length === 0) {
    return NextResponse.json({ error: "Nenhum lead válido selecionado." }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      nome,
      mensagem,
      intervaloMinSegundos,
      intervaloMaxSegundos,
      totalLeads: leads.length,
      status: "RODANDO",
      leads: {
        create: leads.map((lead) => ({ leadId: lead.id })),
      },
    },
  });

  runCampaign(campaign.id);

  return NextResponse.json({ campaign });
}
