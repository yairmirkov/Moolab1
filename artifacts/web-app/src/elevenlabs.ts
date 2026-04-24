const API_BASE = import.meta.env.VITE_API_URL || "/api";

const _log = (msg: string) => {
  console.log(`[ElevenLabs] ${msg}`);
};

const VOICE_MAP = {
  EN: {
    Host: "1fz2mW1imKTf5Ryjk5su",
    Expert: "kdmDKE6EkgrWrrykO9Qt",
    Guest1: "l4Coq6695JDX9xtLqXDE",
    Guest2: "RexqLjNzkCjWogguKyff",
    Narrator: "G7ILShrCNLfmS0A37SXS",
  },
  ES: {
    Host: "RexqLjNzkCjWogguKyff",
    Expert: "WEXRePkZGpmcFLvCOaB1",
    Guest1: "PetzKiU5nxNtLzFt4ipu",
    Guest2: "G7ILShrCNLfmS0A37SXS",
    Narrator: "spPXlKT5a4JMfbhPRAzA",
  },
} as const;

type VoiceLang = keyof typeof VOICE_MAP;
type VoiceRole = keyof typeof VOICE_MAP.EN;

const SPEAKER_TO_ROLE: Record<string, VoiceRole> = {
  host: "Host",
  presentador: "Host",
  presentadora: "Host",
  expert: "Expert",
  experto: "Expert",
  experta: "Expert",
  guest1: "Guest1",
  invitado1: "Guest1",
  guest2: "Guest2",
  invitado2: "Guest2",
  narrator: "Narrator",
  narrador: "Narrator",
  narradora: "Narrator",
};

export function resolveVoiceLang(explicitLang?: "en" | "es"): VoiceLang {
  const lang = explicitLang ?? (() => { try { return localStorage.getItem("ws_lang") || "en"; } catch { return "en"; } })();
  return lang === "es" ? "ES" : "EN";
}

function getVoiceId(speaker: string, voiceLang?: VoiceLang): string {
  const lang = voiceLang ?? resolveVoiceLang();
  const role = SPEAKER_TO_ROLE[speaker.toLowerCase().trim()] || "Narrator";
  return VOICE_MAP[lang][role];
}

export function getVoiceIdForRole(role: "Host" | "Expert" | "Guest1" | "Guest2" | "Narrator", lang?: "en" | "es"): string {
  const vl = resolveVoiceLang(lang);
  return VOICE_MAP[vl][role];
}

let currentAudio: HTMLAudioElement | null = null;
let _availableCache: boolean | null = null;
let _availableProbe: Promise<boolean> | null = null;

async function probeAvailable(): Promise<boolean> {
  if (_availableCache !== null) return _availableCache;
  if (_availableProbe) return _availableProbe;
  _availableProbe = (async () => {
    try {
      const res = await fetch(`${API_BASE}/elevenlabs/status`, { credentials: "include" });
      if (!res.ok) { _availableCache = false; return false; }
      const data = await res.json();
      _availableCache = !!data?.available;
      return _availableCache;
    } catch {
      _availableCache = false;
      return false;
    }
  })();
  return _availableProbe;
}

probeAvailable();

export const isElevenLabsAvailable = (): boolean => _availableCache !== false;

async function fetchTtsBlob(text: string, voiceId: string, voiceSettings?: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
  return fetch(`${API_BASE}/elevenlabs/tts`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId, voiceSettings }),
    signal,
  });
}

export type FetchBlobResult = {
  url: string | null;
  httpStatus: number;
  error?: string;
};

export const fetchAudioBlob = async (
  text: string,
  voiceId: string,
  voiceSettings?: { stability?: number; similarity_boost?: number; style?: number; use_speaker_boost?: boolean },
): Promise<FetchBlobResult> => {
  try {
    _log(`fetchBlob: voice=${voiceId.substring(0,8)}, "${text.substring(0, 25)}..."`);
    const settings = voiceSettings ?? { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true };
    const res = await fetchTtsBlob(text, voiceId, settings);
    if (!res.ok) {
      _log(`fetchBlob: ${res.status}`);
      if (res.status === 500) _availableCache = false;
      return { url: null, httpStatus: res.status, error: `http_${res.status}` };
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    _log(`fetchBlob: OK size=${blob.size} type=${blob.type}`);
    return { url, httpStatus: 200 };
  } catch (e: any) {
    _log(`fetchBlob: NETWORK ERROR ${e?.message?.substring(0, 60)}`);
    return { url: null, httpStatus: 0, error: "network_error" };
  }
};

export const stopElevenLabsAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
};

export const playBlobAudio = (blobUrl: string, speed?: number): HTMLAudioElement => {
  stopElevenLabsAudio();
  const audio = new Audio(blobUrl);
  audio.playbackRate = speed ?? 1;
  currentAudio = audio;
  audio.onended = () => { if (currentAudio === audio) currentAudio = null; };
  audio.play().catch(() => {});
  return audio;
};

export const speakWithElevenLabs = async (
  text: string,
  lang: "en" | "es" = "en",
  opts?: {
    speed?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  },
): Promise<boolean> => {
  const voiceLang = resolveVoiceLang(lang);
  const voiceId = VOICE_MAP[voiceLang].Narrator;
  return _speak(text, voiceId, opts);
};

export const speakPodcastLine = (
  text: string,
  speaker: string,
  lang: "en" | "es" = "en",
  opts?: {
    speed?: number;
    signal?: AbortSignal;
  },
): Promise<"done" | "aborted" | "error"> => {
  const voiceLang = resolveVoiceLang(lang);
  const voiceId = getVoiceId(speaker, voiceLang);
  const speed = opts?.speed ?? 1.0;

  return new Promise(async (resolve) => {
    if (opts?.signal?.aborted) { resolve("aborted"); return; }

    let settled = false;
    const settle = (result: "done" | "aborted" | "error") => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const podTimerLabel = `ElevenLabs API (podcast, ${speaker}, ${text.substring(0, 25)}...)`;
    console.time(podTimerLabel);
    let podTimerEnded = false;
    const endPodTimer = () => { if (!podTimerEnded) { podTimerEnded = true; console.timeEnd(podTimerLabel); } };
    try {
      const response = await fetchTtsBlob(text, voiceId, {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.4,
        use_speaker_boost: true,
      }, opts?.signal);

      endPodTimer();

      if (!response.ok) {
        _log(`podcastLine: ${response.status}`);
        if (response.status === 500) _availableCache = false;
        settle("error");
        return;
      }

      const blob = await response.blob();
      if (opts?.signal?.aborted) { settle("aborted"); return; }

      const url = URL.createObjectURL(blob);
      stopElevenLabsAudio();
      const audio = new Audio(url);
      currentAudio = audio;
      audio.playbackRate = speed;
      audio.volume = 0.85;

      const cleanup = () => {
        URL.revokeObjectURL(url);
        if (currentAudio === audio) currentAudio = null;
        if (opts?.signal && onAbort) opts.signal.removeEventListener("abort", onAbort);
      };

      const onAbort = () => {
        audio.pause();
        audio.src = "";
        cleanup();
        settle("aborted");
      };

      if (opts?.signal) {
        opts.signal.addEventListener("abort", onAbort, { once: true });
      }

      audio.onended = () => { cleanup(); settle("done"); };
      audio.onerror = () => { cleanup(); settle("error"); };

      await audio.play();
    } catch (e: any) {
      endPodTimer();
      if (e?.name === "AbortError") { settle("aborted"); return; }
      console.error("[ElevenLabs] Podcast TTS error:", e);
      settle("error");
    }
  });
};

async function _speak(
  text: string,
  voiceId: string,
  opts?: {
    speed?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  },
): Promise<boolean> {
  const speed = opts?.speed ?? 1.0;
  const timerLabel = `ElevenLabs API (_speak, ${text.substring(0, 30)}...)`;
  console.time(timerLabel);
  let timerEnded = false;
  const endTimer = () => { if (!timerEnded) { timerEnded = true; console.timeEnd(timerLabel); } };

  try {
    const response = await fetchTtsBlob(text, voiceId, {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.4,
      use_speaker_boost: true,
    });

    endTimer();

    if (!response.ok) {
      _log(`_speak: ${response.status}`);
      if (response.status === 500) _availableCache = false;
      opts?.onError?.();
      return false;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    stopElevenLabsAudio();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.playbackRate = speed;
    audio.volume = 0.85;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      opts?.onEnd?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      opts?.onError?.();
    };

    opts?.onStart?.();
    await audio.play();
    return true;
  } catch (e) {
    endTimer();
    console.error("[ElevenLabs] TTS error:", e);
    opts?.onError?.();
    return false;
  }
}
