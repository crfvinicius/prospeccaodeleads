"use client";

import { useState } from "react";
import { CampaignForm } from "@/components/CampaignForm";
import { CampaignList } from "@/components/CampaignList";

export default function CampanhasPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Campanhas de WhatsApp</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Envie mensagens automaticamente para vários leads de uma vez, com
        intervalo aleatório entre os envios para reduzir o risco de bloqueio
        do número.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <CampaignForm onCreated={() => setRefreshKey((k) => k + 1)} />
        <div>
          <h2 className="mb-2 text-sm font-semibold">Campanhas</h2>
          <CampaignList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
