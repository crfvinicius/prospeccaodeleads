import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      leads: {
        include: { lead: { select: { id: true, nome: true, telefone: true, whatsapp: true } } },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}
