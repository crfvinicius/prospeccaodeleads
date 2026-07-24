"use client";

import { useState, type FormEvent } from "react";
import type { LeadDTO } from "@/lib/types";

export function SearchForm() {
  const [localidade, setLocalidade] = useState("");
  const [nicho, setNicho] = useState("");
  const [quantidade, setQuantidade] = useState(20);
  const [avaliacaoMinima, setAvaliacaoMinima] = useState<string>("");
  const [somenteComSite, setSomenteComSite] = useState(false);
  const [somenteSemSite, setSomenteSemSite] = useState(false);
  const [somenteComWhatsapp, setSomenteComWhatsapp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [results, setResults] = useState<LeadDTO[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);
    setResults(null);

    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          localidade,
          nicho,
          quantidade,
          avaliacaoMinima: avaliacaoMinima ? Number(avaliacaoMinima) : undefined,
          somenteComSite,
          somenteSemSite,
          somenteComWhatsapp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao buscar leads.");
      } else {
        setResults(data.leads);
        setWarning(data.whatsappWarning ?? null);
      }
    } catch {
      setError("Erro de rede ao buscar leads.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid max-w-xl gap-3">
        <label className="grid gap-1 text-sm">
          Localidade
          <input
            required
            value={localidade}
            onChange={(e) => setLocalidade(e.target.value)}
            placeholder="Ex: São Paulo, SP"
            className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Nicho
          <input
            required
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            placeholder="Ex: clínicas odontológicas"
            className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Quantidade de leads
          <input
            type="number"
            min={1}
            max={60}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Avaliação mínima no Google (0-5)
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={avaliacaoMinima}
            onChange={(e) => setAvaliacaoMinima(e.target.value)}
            placeholder="Sem filtro"
            className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={somenteComSite}
            onChange={(e) => {
              setSomenteComSite(e.target.checked);
              if (e.target.checked) setSomenteSemSite(false);
            }}
          />
          Somente com site
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={somenteSemSite}
            onChange={(e) => {
              setSomenteSemSite(e.target.checked);
              if (e.target.checked) setSomenteComSite(false);
            }}
          />
          Somente sem site
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={somenteComWhatsapp}
            onChange={(e) => setSomenteComWhatsapp(e.target.checked)}
          />
          Somente com WhatsApp (requer WhatsApp conectado)
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Buscando..." : "Buscar leads"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {warning && <p className="mt-4 text-sm text-amber-600">{warning}</p>}

      {results && (
        <div className="mt-6">
          <p className="mb-2 text-sm text-neutral-500">
            {results.length} lead(s) encontrado(s) e salvo(s) no CRM.
          </p>
          <ul className="grid gap-2">
            {results.map((lead) => (
              <li
                key={lead.id}
                className="rounded border border-black/10 p-2 text-sm dark:border-white/10"
              >
                <p className="font-medium">{lead.nome}</p>
                <p className="text-xs text-neutral-500">
                  {[lead.endereco, lead.telefone].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
