import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import P from "pino";

let sock = null;
let state = "starting";
let lastError = null;

export function getStatus() {
  return {
    connected: Boolean(sock?.user),
    state,
    user: sock?.user?.id || null,
    error: lastError
  };
}

export async function startWhatsApp() {
  const { state: authState, saveCreds } =
    await useMultiFileAuthState("./auth");

  sock = makeWASocket({
    auth: authState,
    printQRInTerminal: false,
    logger: P({ level: "info" }),
    browser: ["WhatsApp RPG", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      state = "connected";
      lastError = null;
      console.log("WhatsApp conectado.");
    }

    if (connection === "close") {
      state = "disconnected";

      const code =
        lastDisconnect?.error?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        console.log("Reconectando WhatsApp...");
        setTimeout(() => startWhatsApp().catch(console.error), 3000);
      } else {
        lastError = "Sessão encerrada. Será necessário conectar novamente.";
      }
    }

    if (connection === "connecting") {
      state = "connecting";
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages?.[0];
    if (!message?.message) return;

    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      "";

    if (!text.trim()) return;

    console.log("Mensagem recebida:", text);

    // Aqui entraremos com o motor do RPG.
    // Por enquanto, apenas responde ao comando !rpg.
    if (text.trim().toLowerCase() === "!rpg") {
      await sock.sendMessage(message.key.remoteJid, {
        text: "🎲 RPG online! O motor de aventura será conectado aqui."
      });
    }
  });
}

export async function requestPairingCode(phone) {
  if (!sock) {
    await startWhatsApp();
  }

  // O WhatsApp precisa estar em estado adequado antes do pareamento.
  if (sock.user) {
    throw new Error("Este WhatsApp já está conectado.");
  }

  const code = await sock.requestPairingCode(phone);
  return code;
}
