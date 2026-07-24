import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Baileys (WhatsApp) faz require dinâmico de libs opcionais (jimp, sharp)
  // e não deve ser bundlado pelo Turbopack — só resolvido em runtime no servidor.
  serverExternalPackages: ["@whiskeysockets/baileys"],
};

export default nextConfig;
