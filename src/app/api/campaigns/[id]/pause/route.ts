import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pauseCampaign } from "@/lib/whatsapp/campaign-runner";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });

  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }
  if (campaign.status !== "RODANDO") {
    return NextResponse.json(
      { error: "Só é possível pausar uma campanha em andamento." },
      { status: 409 }
    );
  }

  pauseCampaign(id);
  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: "PAUSADA" },
  });

  return NextResponse.json({ campaign: updated });
}
