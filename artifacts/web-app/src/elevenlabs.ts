const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;

const VOICE_IDS = {
  en: "pNInz6obpgDQGcFmaJgB",
  es: "onwK4e9ZLuTAKqWW03F9",
} as const;

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
};
