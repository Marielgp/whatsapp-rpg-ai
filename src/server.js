import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startWhatsApp, getStatus, requestPairingCode } from "./whatsapp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/status", (_req, res) => {
  res.json(getStatus());
});

app.post("/api/pairing-code", async (req, res) => {
  try {
    const phone = String(req.body?.phone || "").replace(/\D/g, "");

    if (!phone) {
      return res.status(400).json({
        ok: false,
        error: "Informe o número com DDI e DDD, somente números."
      });
    }

    const code = await requestPairingCode(phone);
    res.json({ ok: true, code });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error?.message || "Não foi possível gerar o código."
    });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor RPG iniciado na porta ${PORT}`);
  startWhatsApp().catch(console.error);
});
