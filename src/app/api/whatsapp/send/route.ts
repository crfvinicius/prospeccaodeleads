import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessageSchema } from "@/lib/validation";
import { sendWhatsAppText } from "@/lib/whatsapp/socket";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { leadId, mensagem } = parsed.data;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  }

  const phone = lead.whatsapp ?? lead.telefone;
  if (!phone) {
    return NextResponse.json(
      { error: "Lead não possui telefone/WhatsApp cadastrado." },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      leadId: lead.id,
      direcao: "ENVIADA",
      conteudo: mensagem,
      status: "PENDENTE",
    },
  });

  try {
    await sendWhatsAppText(phone, mensagem);
  } catch (error) {
    await prisma.message.update({
      where: { id: message.id },
      data: { status: "FALHOU" },
    });
    const errorMessage =
      error instanceof Error ? error.message : "Falha ao enviar mensagem.";
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }

  const [updatedMessage, updatedLead] = await Promise.all([
    prisma.message.update({
      where: { id: message.id },
      data: { status: "ENVIADA" },
    }),
    prisma.lead.update({
      where: { id: lead.id },
      data: {
        temWhatsapp: true,
        estagio: lead.estagio === "NOVO" ? "CONTATADO" : lead.estagio,
      },
    }),
  ]);

  return NextResponse.json({ message: updatedMessage, lead: updatedLead });
}
