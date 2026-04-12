const API_BASE = import.meta.env.VITE_API_URL || "/api-server/api";

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

export function getFallbackVideo(id: string | number): string {
  return getFallback(String(id));
}

export async function resolveVideoUrls(lessons: any[]): Promise<any[]> {
  const keywords = lessons
    .filter((l) => l?.video_search_keyword)
    .map((l) => l.video_search_keyword as string);

  if (keywords.length === 0) {
    return lessons.map((l) => ({
      ...l,
      video_url: l.video_url || getFallback(String(l.id || "default")),
    }));
  }

  const unique = [...new Set(keywords.map((k) => k.toLowerCase().trim()))];

  let videoMap: Record<string, string> = {};

  try {
    const resp = await fetch(`${API_BASE}/pexels-videos-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: unique }),
    });
    if (resp.ok) {
      const data = await resp.json();
      videoMap = data.videos || {};
    }
  } catch (err) {
    console.error("[Pexels] Batch fetch failed:", err);
  }

  return lessons.map((l) => {
    if (l.video_url) return l;
    const kw = l.video_search_keyword?.toLowerCase().trim();
    return {
      ...l,
      video_url: (kw && videoMap[kw]) || getFallback(String(l.id || l.video_search_keyword || "default")),
    };
  });
}
