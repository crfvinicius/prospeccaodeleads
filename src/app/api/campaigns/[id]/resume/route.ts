import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runCampaign } from "@/lib/whatsapp/campaign-runner";
import { getWhatsAppStatus } from "@/lib/whatsapp/socket";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });

  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }
  if (campaign.status !== "PAUSADA") {
    return NextResponse.json(
      { error: "Só é possível retomar uma campanha pausada." },
      { status: 409 }
    );
  }
  if (getWhatsAppStatus().status !== "conectado") {
    return NextResponse.json(
      { error: "Conecte o WhatsApp antes de retomar a campanha." },
      { status: 409 }
    );
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: "RODANDO" },
  });
  runCampaign(id);

  return NextResponse.json({ campaign: updated });
}
