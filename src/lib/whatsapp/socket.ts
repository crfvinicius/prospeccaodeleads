import path from "node:path";
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { pino } from "pino";
import QRCode from "qrcode";

export type WhatsAppStatus =
  | "desconectado"
  | "conectando"
  | "aguardando_qr"
  | "conectado";

interface WhatsAppState {
  sock: WASocket | null;
  status: WhatsAppStatus;
  qr: string | null;
  starting: Promise<void> | null;
}

declare global {
  var __whatsapp: WhatsAppState | undefined;
}

const state: WhatsAppState = globalThis.__whatsapp ?? {
  sock: null,
  status: "desconectado",
  qr: null,
  starting: null,
};
globalThis.__whatsapp = state;

const sessionDir = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.WHATSAPP_SESSION_DIR ?? "./.whatsapp-session"
);

const logger = pino({ level: "silent" });

export function getWhatsAppStatus() {
  return { status: state.status, qr: state.qr };
}

export async function getWhatsAppQrDataUrl(): Promise<string | null> {
  if (!state.qr) return null;
  return QRCode.toDataURL(state.qr);
}

export async function connectWhatsApp(): Promise<void> {
  if (state.status === "conectado" || state.status === "conectando") return;
  if (state.starting) return state.starting;

  state.starting = (async () => {
    state.status = "conectando";

    const { state: authState, saveCreds } =
      await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: authState,
      logger,
      printQRInTerminal: false,
    });

    state.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        state.qr = qr;
        state.status = "aguardando_qr";
      }

      if (connection === "open") {
        state.qr = null;
        state.status = "conectado";
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom | undefined)
          ?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;

        state.sock = null;
        state.qr = null;
        state.status = "desconectado";
        state.starting = null;

        if (!loggedOut) {
          connectWhatsApp().catch(() => {
            /* reconexão falhou, próxima chamada a connectWhatsApp tenta de novo */
          });
        }
      }
    });
  })();

  try {
    await state.starting;
  } finally {
    state.starting = null;
  }
}

export async function disconnectWhatsApp(): Promise<void> {
  if (state.sock) {
    await state.sock.logout().catch(() => {});
  }
  state.sock = null;
  state.qr = null;
  state.status = "desconectado";
}

export function getSocketOrThrow(): WASocket {
  if (!state.sock || state.status !== "conectado") {
    throw new Error("WhatsApp não está conectado. Conecte antes de usar.");
  }
  return state.sock;
}

/** Normaliza um telefone para o formato E.164 sem "+" e sem caracteres extras. */
export function normalizePhoneNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export async function checkOnWhatsApp(phone: string): Promise<boolean> {
  const sock = getSocketOrThrow();
  const number = normalizePhoneNumber(phone);
  const result = await sock.onWhatsApp(number);
  return Boolean(result && result[0]?.exists);
}

export async function sendWhatsAppText(
  phone: string,
  text: string
): Promise<void> {
  const sock = getSocketOrThrow();
  const number = normalizePhoneNumber(phone);
  const [check] = (await sock.onWhatsApp(number)) ?? [];
  if (!check?.exists) {
    throw new Error(`Número ${phone} não está registrado no WhatsApp.`);
  }
  await sock.sendMessage(check.jid, { text });
}
