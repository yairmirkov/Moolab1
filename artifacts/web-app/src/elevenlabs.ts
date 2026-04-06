const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

const VOICE_IDS = {
  en: "pNInz6obpgDQGcFmaJgB",
  es: "onwK4e9ZLuTAKqWW03F9",
} as const;

const PODCAST_VOICE_MAP: Record<string, string> = {
  host: "pNInz6obpgDQGcFmaJgB",
  presentador: "pNInz6obpgDQGcFmaJgB",
  expert: "21m00Tcm4TlvDq8ikWAM",
  experto: "21m00Tcm4TlvDq8ikWAM",
  experta: "21m00Tcm4TlvDq8ikWAM",
};

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

  const voiceId = VOICE_IDS[lang] || VOICE_IDS.en;
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

  const key = speaker.toLowerCase().trim();
  const voiceId = PODCAST_VOICE_MAP[key] || VOICE_IDS[lang] || VOICE_IDS.en;
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
            model_id: "eleven_turbo_v2_5",
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

      if (!response.ok) { settle("error"); return; }

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
          model_id: "eleven_turbo_v2_5",
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
  } catch {
    opts?.onError?.();
    return false;
  }
}
