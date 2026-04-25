import { Router, type Request, type Response } from "express";
import { createRateLimit } from "../middlewares/rateLimit";

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const MAX_PROMPT_LENGTH = 32000;
const generateLimiter = createRateLimit({ windowMs: 60_000, max: 30, label: "gemini" });

router.post("/gemini/generate", generateLimiter, async (req: Request, res: Response) => {
  if (!GEMINI_API_KEY) {
    console.error("[Gemini] Missing GEMINI_API_KEY env var");
    return res.status(500).json({ error: "Server not configured" });
  }

  const { prompt } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Missing prompt" });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: "Prompt too long" });
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[Gemini] Upstream ${response.status}: ${errText.slice(0, 300)}`);
      return res.status(502).json({ error: "Upstream Gemini error", status: response.status });
    }

    const data: any = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ text });
  } catch (err) {
    console.error("[Gemini] Fetch error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

export default router;
