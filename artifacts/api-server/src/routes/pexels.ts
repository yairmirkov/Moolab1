import { Router, type Request, type Response } from "express";

const router = Router();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";

const FALLBACK_VIDEOS = [
  "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795167/2795167-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2516159/2516159-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/3214435/3214435-hd_1920_1080_25fps.mp4",
];

function getFallback(keyword: string): string {
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) hash = ((hash << 5) - hash + keyword.charCodeAt(i)) | 0;
  return FALLBACK_VIDEOS[Math.abs(hash) % FALLBACK_VIDEOS.length];
}

async function fetchBestVideo(query: string): Promise<string> {
  if (!PEXELS_API_KEY) {
    console.log(`[Pexels] No API key — using fallback for "${query}"`);
    return getFallback(query);
  }

  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait&size=medium`;
    const response = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (!response.ok) {
      console.log(`[Pexels] API returned ${response.status} for "${query}" — using fallback`);
      return getFallback(query);
    }

    const data = await response.json() as any;

    if (!data.videos?.length) {
      console.log(`[Pexels] No videos found for "${query}" — using fallback`);
      return getFallback(query);
    }

    for (const video of data.videos) {
      if (!video.video_files?.length) continue;

      const portrait = video.video_files
        .filter((f: any) => f.width && f.height && f.height > f.width && f.quality === "hd")
        .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

      if (portrait.length) {
        console.log(`[Pexels] Found portrait HD video for "${query}": ${portrait[0].link}`);
        return portrait[0].link;
      }

      const anyHd = video.video_files
        .filter((f: any) => f.quality === "hd")
        .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

      if (anyHd.length) {
        console.log(`[Pexels] Found HD video for "${query}": ${anyHd[0].link}`);
        return anyHd[0].link;
      }
    }

    if (data.videos[0]?.video_files?.length) {
      const fallbackFile = data.videos[0].video_files[0].link;
      console.log(`[Pexels] Using first available file for "${query}": ${fallbackFile}`);
      return fallbackFile;
    }

    console.log(`[Pexels] No usable files for "${query}" — using fallback`);
    return getFallback(query);
  } catch (err) {
    console.error(`[Pexels] Fetch error for "${query}":`, err);
    return getFallback(query);
  }
}

router.get("/pexels-video", async (req: Request, res: Response) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Missing q parameter" });
  }
  const url = await fetchBestVideo(query);
  res.json({ url });
});

router.post("/pexels-videos-batch", async (req: Request, res: Response) => {
  const { keywords } = req.body || {};
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ error: "Missing keywords array" });
  }

  const limited = keywords.slice(0, 20);
  console.log(`[Pexels] Batch request for ${limited.length} keywords: ${limited.join(", ")}`);

  const results: Record<string, string> = {};
  await Promise.all(
    limited.map(async (kw: string) => {
      const key = String(kw).trim().toLowerCase();
      if (!key) return;
      results[key] = await fetchBestVideo(key);
    })
  );

  console.log(`[Pexels] Batch complete — resolved ${Object.keys(results).length} videos`);
  res.json({ videos: results });
});

export default router;
