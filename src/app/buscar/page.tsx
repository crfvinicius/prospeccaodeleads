import { SearchForm } from "@/components/SearchForm";

export default function BuscarPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Buscar leads</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Busca automática de estabelecimentos via Google Places, com base nos
        filtros abaixo. Os resultados são salvos direto no CRM (coluna
        &quot;Novo&quot;).
      </p>
      <SearchForm />
    </div>
  );
}
