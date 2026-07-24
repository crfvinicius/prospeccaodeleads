"use client";

import { useEffect, useRef, useState } from "react";

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
    <div className="max-w-md">
      <p className="mb-3 text-sm">
        Status:{" "}
        <span className="font-medium">
          {status ? STATUS_LABEL[status.status] : "Carregando..."}
        </span>
      </p>

      {status?.qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={status.qrDataUrl}
          alt="QR Code do WhatsApp"
          className="mb-4 h-64 w-64 border border-black/10 dark:border-white/10"
        />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConnect}
          disabled={status?.status === "conectado" || status?.status === "conectando"}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          Conectar
        </button>
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={!status || status.status === "desconectado"}
          className="rounded border border-black/10 px-4 py-2 text-sm disabled:opacity-50 dark:border-white/10"
        >
          Desconectar
        </button>
      </div>
    </div>
  );
}
