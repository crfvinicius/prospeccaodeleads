import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const estagio = searchParams.get("estagio");
  const nicho = searchParams.get("nicho");
  const localidade = searchParams.get("localidade");
  const comTelefone = searchParams.get("comTelefone");

  const where: Prisma.LeadWhereInput = {};
  if (estagio) where.estagio = estagio as Prisma.LeadWhereInput["estagio"];
  if (nicho) where.nicho = { contains: nicho, mode: "insensitive" };
  if (localidade) where.localidade = { contains: localidade, mode: "insensitive" };
  if (comTelefone === "true") {
    where.OR = [{ telefone: { not: null } }, { whatsapp: { not: null } }];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ leads });
}
