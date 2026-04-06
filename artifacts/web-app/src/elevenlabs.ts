const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

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

let currentAudio: HTMLAudioElement | null = null;

export const isElevenLabsAvailable = (): boolean => !!ELEVENLABS_API_KEY;

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

      if (!response.ok) {
        console.error(`[ElevenLabs] Podcast TTS failed: ${response.status} ${response.statusText}`);
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

    if (!response.ok) {
      console.error(`[ElevenLabs] TTS failed: ${response.status} ${response.statusText}`);
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
    console.error("[ElevenLabs] TTS error:", e);
    opts?.onError?.();
    return false;
  }
}
