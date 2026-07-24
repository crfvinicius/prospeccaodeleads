"use client";

import { useRef, useState, type FormEvent } from "react";

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
    <form onSubmit={handleSubmit} className="grid max-w-xl gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.md,.markdown"
        className="text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {loading ? "Importando..." : "Importar leads"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}
    </form>
  );
}
