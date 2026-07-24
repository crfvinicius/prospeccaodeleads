import { WhatsAppConnect } from "@/components/WhatsAppConnect";

export default function WhatsAppPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Conexão com WhatsApp</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Conecte um número de WhatsApp escaneando o QR Code abaixo (igual ao
        WhatsApp Web). Depois de conectado, você pode enviar mensagens direto
        pelos cards do CRM.
      </p>
      <WhatsAppConnect />
    </div>
  );
}
