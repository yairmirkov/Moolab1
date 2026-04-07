const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

const EL_ERROR_CODES: Record<number, string> = {
  400: "invalid_request",
  401: "authentication_error",
  402: "payment_required",
  403: "authorization_error",
  404: "not_found",
  409: "conflict",
  429: "rate_limit_error",
  500: "internal_error",
  503: "service_unavailable",
};

const _log = (msg: string) => {
  const ts = new Date().toLocaleTimeString();
  const entry = `[${ts}] EL: ${msg}`;
  console.log(entry);
  const arr = (window as any).__audioLog;
  if (arr) { arr.push(entry); if (arr.length > 40) arr.shift(); }
};

const _parseApiError = async (res: Response): Promise<string> => {
  const label = EL_ERROR_CODES[res.status] || `http_${res.status}`;
  let detail = "";
  try {
    const body = await res.json();
    const d = body?.detail;
    if (typeof d === "string") detail = d;
    else if (d?.message) detail = `${d.status || ""}: ${d.message}`;
    else if (body?.message) detail = body.message;
    else detail = JSON.stringify(body).substring(0, 100);
  } catch {
    detail = res.statusText;
  }
  return `${res.status} ${label} - ${detail}`;
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

export const isElevenLabsAvailable = (): boolean => !!ELEVENLABS_API_KEY;

export type FetchBlobResult = {
  url: string | null;
  httpStatus: number;
  error?: string;
};

export const fetchAudioBlob = async (
  text: string,
  voiceId: string,
): Promise<FetchBlobResult> => {
  if (!ELEVENLABS_API_KEY) { _log("fetchBlob: NO KEY"); return { url: null, httpStatus: 0, error: "no_key" }; }
  try {
    _log(`fetchBlob: voice=${voiceId.substring(0,8)}, "${text.substring(0, 25)}..."`);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
      }),
    });
    if (!res.ok) {
      const errMsg = await _parseApiError(res);
      _log(`fetchBlob: ${errMsg}`);
      return { url: null, httpStatus: res.status, error: EL_ERROR_CODES[res.status] || `http_${res.status}` };
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
  if (!ELEVENLABS_API_KEY) return false;

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
  if (!ELEVENLABS_API_KEY) return Promise.resolve("error");

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
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY!,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
          signal: opts?.signal,
        },
      );

      endPodTimer();

      if (!response.ok) {
        const errMsg = await _parseApiError(response);
        _log(`podcastLine: ${errMsg}`);
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
  if (!ELEVENLABS_API_KEY) return false;

  const speed = opts?.speed ?? 1.0;
  const timerLabel = `ElevenLabs API (_speak, ${text.substring(0, 30)}...)`;
  console.time(timerLabel);
  let timerEnded = false;
  const endTimer = () => { if (!timerEnded) { timerEnded = true; console.timeEnd(timerLabel); } };

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      },
    );

    endTimer();

    if (!response.ok) {
      const errMsg = await _parseApiError(response);
      _log(`_speak: ${errMsg}`);
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
