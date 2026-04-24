import { Router, type Request, type Response } from "express";
import { createRateLimit } from "../middlewares/rateLimit";

const router = Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const MAX_TEXT_LENGTH = 5000;

const ttsLimiter = createRateLimit({ windowMs: 60_000, max: 60, label: "elevenlabs" });

router.get("/elevenlabs/status", (req: Request, res: Response) => {
  res.json({ available: !!ELEVENLABS_API_KEY });
});

router.post("/elevenlabs/tts", ttsLimiter, async (req: Request, res: Response) => {
  const session = req.session as any;
  const isAuthed = Boolean(session?.parentId || session?.childId);
  if (!isAuthed) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "Server not configured" });
  }

  const { text, voiceId, voiceSettings, modelId } = req.body || {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing text" });
  }
  if (typeof voiceId !== "string" || !voiceId.trim()) {
    return res.status(400).json({ error: "Missing voiceId" });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: "Text too long" });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(voiceId)) {
    return res.status(400).json({ error: "Invalid voiceId" });
  }

  const settings = voiceSettings && typeof voiceSettings === "object" ? voiceSettings : {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.4,
    use_speaker_boost: true,
  };

  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: typeof modelId === "string" ? modelId : "eleven_multilingual_v2",
        voice_settings: settings,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      console.error(`[ElevenLabs] Upstream ${upstream.status}: ${errText.slice(0, 200)}`);
      return res.status(502).json({ error: "Upstream ElevenLabs error", status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") || "audio/mpeg";
    res.setHeader("Content-Type", contentType);
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (err) {
    console.error("[ElevenLabs] Fetch error:", err);
    res.status(500).json({ error: "TTS failed" });
  }
});

export default router;
