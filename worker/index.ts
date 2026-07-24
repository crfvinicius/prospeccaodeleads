import { Container, getContainer } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

export class AppContainer extends Container {
  defaultPort = 8080;
  // Mantém o container acordado por mais tempo que o padrão: o processo
  // guarda a conexão do WhatsApp e campanhas em andamento em memória, então
  // dormir no meio de uma campanha derruba a sessão/fila. Ajuste conforme o
  // uso real (containers sempre ativos custam mais).
  sleepAfter = "1h";

  envVars = {
    NODE_ENV: "production",
    DATABASE_URL: env.DATABASE_URL,
    GOOGLE_PLACES_API_KEY: env.GOOGLE_PLACES_API_KEY,
    WHATSAPP_SESSION_DIR: env.WHATSAPP_SESSION_DIR ?? "./.whatsapp-session",
  };
}

const worker: ExportedHandler<Env> = {
  async fetch(request, env) {
    // Instância única e fixa: o CRM é single-tenant e precisa que todas as
    // requisições cheguem sempre no mesmo processo (WhatsApp + campanhas
    // vivem em memória nesse processo).
    const container = getContainer(env.APP_CONTAINER, "main");
    return container.fetch(request);
  },
};

export default worker;
