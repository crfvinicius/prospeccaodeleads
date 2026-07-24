import { UploadForm } from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Upload de leads</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Envie uma planilha .xlsx ou uma tabela em Markdown (.md) com colunas
        como nome, telefone, whatsapp, endereço, localidade, nicho e site. A
        coluna &quot;nome&quot; é obrigatória.
      </p>
      <UploadForm />
    </div>
  );
}
