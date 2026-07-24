"use client";

import { useRef, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function UploadForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Selecione um arquivo .xlsx ou .md");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/leads/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao importar leads.");
      } else {
        setSuccessMessage(`${data.total} lead(s) importado(s) com sucesso.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setError("Erro de rede ao enviar o arquivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.md,.markdown"
          className="text-sm"
        />
        <Button type="submit" disabled={loading} className="w-fit">
          {loading ? "Importando..." : "Importar leads"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}
      </form>
    </Card>
  );
}
