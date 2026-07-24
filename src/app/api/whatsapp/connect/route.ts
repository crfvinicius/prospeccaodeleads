import { NextResponse } from "next/server";
import { connectWhatsApp, getWhatsAppStatus } from "@/lib/whatsapp/socket";

export async function POST() {
  // Não aguardamos a conexão completa (ela fica presa até "open" ou "close");
  // disparamos e o cliente faz polling em /api/whatsapp/status para pegar o QR.
  connectWhatsApp().catch(() => {});
  return NextResponse.json(getWhatsAppStatus());
}
