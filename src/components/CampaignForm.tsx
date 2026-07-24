"use client";

import { useState, type FormEvent } from "react";
import { KANBAN_STAGES } from "@/lib/constants";
import type { LeadDTO } from "@/lib/types";

export function CampaignForm({ onCreated }: { onCreated: () => void }) {
  const [estagio, setEstagio] = useState("NOVO");
  const [nicho, setNicho] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [candidatos, setCandidatos] = useState<LeadDTO[] | null>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [buscando, setBuscando] = useState(false);

  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState(
    "Olá, {{nome}}! Tudo bem? Encontrei seu negócio e gostaria de conversar."
  );
  const [intervaloMin, setIntervaloMin] = useState(8);
  const [intervaloMax, setIntervaloMax] = useState(20);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function buscarLeads() {
    setBuscando(true);
    setError(null);
    setCandidatos(null);
    try {
      const params = new URLSearchParams({ comTelefone: "true" });
      if (estagio) params.set("estagio", estagio);
      if (nicho) params.set("nicho", nicho);
      if (localidade) params.set("localidade", localidade);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      const leads: LeadDTO[] = data.leads ?? [];
      setCandidatos(leads);
      setSelecionados(new Set(leads.map((l) => l.id)));
    } catch {
      setError("Não foi possível buscar leads.");
    } finally {
      setBuscando(false);
    }
  }

  function toggleLead(id: string) {
    setSelecionados((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (selecionados.size === 0) {
      setError("Selecione ao menos um lead.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          mensagem,
          leadIds: Array.from(selecionados),
          intervaloMinSegundos: intervaloMin,
          intervaloMaxSegundos: intervaloMax,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao criar campanha.");
      } else {
        setSuccessMessage(
          `Campanha "${nome}" iniciada com ${selecionados.size} lead(s).`
        );
        setCandidatos(null);
        setSelecionados(new Set());
        setNome("");
        onCreated();
      }
    } catch {
      setError("Erro de rede ao criar campanha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 rounded-md border border-black/10 p-3 dark:border-white/10">
        <p className="text-sm font-medium">1. Selecione os leads</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            value={estagio}
            onChange={(e) => setEstagio(e.target.value)}
            className="rounded border border-black/10 p-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <option value="">Qualquer estágio</option>
            {KANBAN_STAGES.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
          <input
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
            placeholder="Filtrar por nicho"
            className="rounded border border-black/10 p-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          />
          <input
            value={localidade}
            onChange={(e) => setLocalidade(e.target.value)}
            placeholder="Filtrar por localidade"
            className="rounded border border-black/10 p-2 text-sm dark:border-white/10 dark:bg-neutral-900"
          />
        </div>
        <button
          type="button"
          onClick={buscarLeads}
          disabled={buscando}
          className="w-fit rounded border border-black/10 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-white/10"
        >
          {buscando ? "Buscando..." : "Buscar leads com telefone"}
        </button>

        {candidatos && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-neutral-500">
              {selecionados.size} de {candidatos.length} selecionado(s)
            </p>
            <div className="max-h-48 overflow-y-auto rounded border border-black/10 dark:border-white/10">
              {candidatos.length === 0 && (
                <p className="p-2 text-sm text-neutral-500">
                  Nenhum lead com telefone encontrado para esse filtro.
                </p>
              )}
              {candidatos.map((lead) => (
                <label
                  key={lead.id}
                  className="flex items-center gap-2 border-b border-black/5 p-2 text-sm last:border-0 dark:border-white/5"
                >
                  <input
                    type="checkbox"
                    checked={selecionados.has(lead.id)}
                    onChange={() => toggleLead(lead.id)}
                  />
                  <span className="font-medium">{lead.nome}</span>
                  <span className="text-xs text-neutral-500">
                    {lead.whatsapp ?? lead.telefone}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-2 rounded-md border border-black/10 p-3 dark:border-white/10">
        <p className="text-sm font-medium">2. Configure a mensagem e dispare</p>

        <label className="grid gap-1 text-sm">
          Nome da campanha
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Padarias SP - Julho"
            className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Mensagem (use {"{{nome}}"}, {"{{nicho}}"}, {"{{localidade}}"} para personalizar)
          <textarea
            required
            rows={3}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-sm">
            Intervalo mínimo (segundos)
            <input
              type="number"
              min={1}
              max={600}
              value={intervaloMin}
              onChange={(e) => setIntervaloMin(Number(e.target.value))}
              className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Intervalo máximo (segundos)
            <input
              type="number"
              min={1}
              max={600}
              value={intervaloMax}
              onChange={(e) => setIntervaloMax(Number(e.target.value))}
              className="rounded border border-black/10 p-2 dark:border-white/10 dark:bg-neutral-900"
            />
          </label>
        </div>
        <p className="text-xs text-neutral-500">
          Um intervalo aleatório entre esses valores é aguardado entre cada envio,
          para reduzir o risco de o número ser bloqueado pelo WhatsApp.
        </p>

        <button
          type="submit"
          disabled={enviando || !candidatos || selecionados.size === 0}
          className="mt-1 w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {enviando ? "Iniciando..." : `Disparar campanha (${selecionados.size} leads)`}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
      </form>
    </div>
  );
}
