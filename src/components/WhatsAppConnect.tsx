"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface StatusResponse {
  status: "desconectado" | "conectando" | "aguardando_qr" | "conectado";
  qrDataUrl: string | null;
}

const STATUS_LABEL: Record<StatusResponse["status"], string> = {
  desconectado: "Desconectado",
  conectando: "Conectando...",
  aguardando_qr: "Aguardando leitura do QR Code",
  conectado: "Conectado",
};

const STATUS_TONE: Record<StatusResponse["status"], "neutral" | "amber" | "green"> = {
  desconectado: "neutral",
  conectando: "amber",
  aguardando_qr: "amber",
  conectado: "green",
};

export function WhatsAppConnect() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchStatus() {
    const res = await fetch("/api/whatsapp/status");
    const data = (await res.json()) as StatusResponse;
    setStatus(data);
  }

  useEffect(() => {
    fetch("/api/whatsapp/status")
      .then((res) => res.json())
      .then((data: StatusResponse) => setStatus(data));
    pollRef.current = setInterval(fetchStatus, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleConnect() {
    await fetch("/api/whatsapp/connect", { method: "POST" });
    fetchStatus();
  }

  async function handleDisconnect() {
    await fetch("/api/whatsapp/disconnect", { method: "POST" });
    fetchStatus();
  }

  return (
    <Card className="max-w-md">
      <p className="mb-3 flex items-center gap-2 text-sm">
        Status:
        <Badge tone={status ? STATUS_TONE[status.status] : "neutral"}>
          {status ? STATUS_LABEL[status.status] : "Carregando..."}
        </Badge>
      </p>

      {status?.qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={status.qrDataUrl}
          alt="QR Code do WhatsApp"
          className="mb-4 h-64 w-64 rounded-lg border border-black/10 dark:border-white/10"
        />
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleConnect}
          disabled={status?.status === "conectado" || status?.status === "conectando"}
        >
          Conectar
        </Button>
        <Button
          variant="secondary"
          onClick={handleDisconnect}
          disabled={!status || status.status === "desconectado"}
        >
          Desconectar
        </Button>
      </div>
    </Card>
  );
}
