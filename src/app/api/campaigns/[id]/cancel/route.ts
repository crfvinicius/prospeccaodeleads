import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelCampaign } from "@/lib/whatsapp/campaign-runner";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });

  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }
  if (campaign.status === "CONCLUIDA" || campaign.status === "CANCELADA") {
    return NextResponse.json(
      { error: "Essa campanha já foi finalizada." },
      { status: 409 }
    );
  }

  cancelCampaign(id);
  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: "CANCELADA" },
  });

  return NextResponse.json({ campaign: updated });
}
