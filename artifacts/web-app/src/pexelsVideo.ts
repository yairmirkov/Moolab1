const API_BASE = import.meta.env.VITE_API_URL || "/api-server/api";

const FALLBACK_VIDEOS = [
  "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795167/2795167-hd_1920_1080_25fps.mp4",
];

const cache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

function getFallback(keyword: string): string {
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) hash = ((hash << 5) - hash + keyword.charCodeAt(i)) | 0;
  return FALLBACK_VIDEOS[Math.abs(hash) % FALLBACK_VIDEOS.length];
}

export async function fetchPexelsVideo(keyword: string): Promise<string> {
  if (!keyword) return FALLBACK_VIDEOS[0];

  const key = keyword.toLowerCase().trim();

  if (cache.has(key)) return cache.get(key)!;

  if (pending.has(key)) return pending.get(key)!;

  const promise = (async () => {
    try {
      const resp = await fetch(`${API_BASE}/pexels-video?q=${encodeURIComponent(key)}`);
      if (!resp.ok) throw new Error("API error");
      const data = await resp.json();
      const url = data.url || getFallback(key);
      cache.set(key, url);
      return url;
    } catch {
      const fb = getFallback(key);
      cache.set(key, fb);
      return fb;
    } finally {
      pending.delete(key);
    }
  })();

  pending.set(key, promise);
  return promise;
}

export function getCachedPexelsVideo(keyword: string): string | null {
  if (!keyword) return null;
  return cache.get(keyword.toLowerCase().trim()) || null;
}
