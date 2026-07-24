import { NextResponse } from "next/server";
import { getWhatsAppStatus, getWhatsAppQrDataUrl } from "@/lib/whatsapp/socket";

export async function GET() {
  const { status } = getWhatsAppStatus();
  const qrDataUrl = await getWhatsAppQrDataUrl();
  return NextResponse.json({ status, qrDataUrl });
}
