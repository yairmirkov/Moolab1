import { Router, type Request, type Response } from "express";

const router = Router();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";

router.get("/pexels-video", async (req: Request, res: Response) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Missing q parameter" });
  }

  if (!PEXELS_API_KEY) {
    return res.status(500).json({ error: "Pexels API key not configured" });
  }

  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait&size=medium`;
    const response = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Pexels API error" });
    }

    const data = await response.json() as any;

    if (!data.videos?.length) {
      return res.json({ url: null });
    }

    let bestUrl: string | null = null;

    for (const video of data.videos) {
      if (!video.video_files?.length) continue;

      const portrait = video.video_files
        .filter((f: any) => f.width && f.height && f.height > f.width && f.quality === "hd")
        .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

      if (portrait.length) {
        bestUrl = portrait[0].link;
        break;
      }

      const anyHd = video.video_files
        .filter((f: any) => f.quality === "hd")
        .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

      if (anyHd.length) {
        bestUrl = anyHd[0].link;
        break;
      }
    }

    if (!bestUrl && data.videos[0]?.video_files?.length) {
      bestUrl = data.videos[0].video_files[0].link;
    }

    res.json({ url: bestUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Pexels" });
  }
});

export default router;
