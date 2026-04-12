import { useState, useEffect, useRef, useCallback } from "react";
import LandingPage from "./LandingPage";
import LandingPageES from "./LandingPageES";
import CommandCenter from "./CommandCenter";
import ConceptCard from "./ConceptCard";
import SharkGame from "./SharkGame";
import translations, { type Lang } from "./translations";
import { isElevenLabsAvailable, speakWithElevenLabs, stopElevenLabsAudio, speakPodcastLine, resolveVoiceLang, getVoiceIdForRole, fetchAudioBlob, playBlobAudio } from "./elevenlabs";
import { resolveVideoUrls } from "./pexelsVideo";
import TheVault from "./TheVault";
import Sandbox from "./Sandbox";
import AppLayout from "./AppLayout";
import Hub from "./Hub";
import { useFeed } from "./FeedContext";

type TabId = "hub" | "lab" | "tank" | "vault";

const MODULE_DATA = [
  { id: 0, icon: "🐷", topic: "saving money, piggy banks, emergency funds, saving strategies", winsNeeded: 10 },
  { id: 1, icon: "📊", topic: "budgeting, tracking expenses, needs vs wants, spending plans", winsNeeded: 10 },
  { id: 2, icon: "💰", topic: "earning income, allowance, side hustles, entrepreneurship", winsNeeded: 10 },
  { id: 3, icon: "📈", topic: "investing basics, stocks, compound interest, index funds", winsNeeded: 10 },
  { id: 4, icon: "💳", topic: "credit scores, debt management, loans, interest rates", winsNeeded: 10 },
  { id: 5, icon: "🏛️", topic: "taxes, government spending, tax filing, deductions", winsNeeded: 10 },
  { id: 6, icon: "🏠", topic: "real estate, renting vs buying, mortgages, property value", winsNeeded: 10 },
  { id: 7, icon: "🪙", topic: "cryptocurrency, digital assets, blockchain, DeFi basics", winsNeeded: 10 },
];

const getModules = (lang: Lang) =>
  MODULE_DATA.map((m, i) => ({ ...m, name: translations.modules.names[lang][i] }));

const shuffleOptions = (options: string[], correctIndex: number) => {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) };
};

const FEED_SEQUENCE: Array<"concept" | "journey" | "podcast"> = [
  "concept",
  "journey",
  "podcast",
  "journey",
  "journey",
  "journey",
  "journey",
  "concept",
  "journey",
  "journey",
];

function getRequestedTypes(startIndex: number, count: number): string[] {
  const types: string[] = [];
  for (let i = 0; i < count; i++) {
    types.push(FEED_SEQUENCE[(startIndex + i) % FEED_SEQUENCE.length]);
  }
  return types;
}

const generateCards = async (ageGroup: string, topic?: string, lang: Lang = "en", country?: string, batchSize: number = 10, opts?: { requestedTypes?: string[] }) => {
  const timerLabel = `Gemini API (batch=${batchSize})`;
  console.time(timerLabel);
  let timerEnded = false;
  const endTimer = () => { if (!timerEnded) { timerEnded = true; console.timeEnd(timerLabel); } };
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const personaKey = ageGroup === "Kids" ? "Kids" : ageGroup === "Teens" ? "Teens" : "Adults";
  const persona = translations.gemini.persona[personaKey][lang];
  const doctrine = translations.gemini.coreDoctrine[lang];
  const ageShark = translations.gemini.sharkByAge[personaKey][lang];
  const suffix = translations.gemini.promptSuffix[lang];
  const topicLine = topic ? (lang === "es" ? ` Todas las lecciones DEBEN enfocarse en el tema de: ${topic}.` : ` All lessons MUST focus on the topic of: ${topic}.`) : "";
  const countryLine = country ? (lang === "es"
    ? ` El usuario se encuentra en: ${country}. Debes usar una división de localización 30/70. El 70% de tus conceptos financieros, ejemplos y mecánicas de mercado deben ser Globales (Wall Street, Crypto, clases de activos amplias). El 30% de tus ejemplos DEBEN estar hiperlocalizados al país del usuario.`
    : ` The user is based in: ${country}. You must use a 30/70 localization split. 70% of your financial concepts, examples, and market mechanics should be Global (Wall Street, Crypto, broad asset classes). 30% of your examples MUST be hyper-localized to the user's country.`
  ) : "";
  const langLine = lang === "es"
    ? " IMPORTANTE: TODA tu respuesta DEBE estar completamente en ESPAÑOL. No mezcles idiomas."
    : " IMPORTANT: Your ENTIRE response MUST be in ENGLISH. Do not mix languages.";
  const requestedTypes = opts?.requestedTypes || getRequestedTypes(0, batchSize);
  const typesLine = lang === "es"
    ? ` requestedTypes: [${requestedTypes.map(t => `"${t}"`).join(", ")}]. GENERA EXACTAMENTE ${requestedTypes.length} lecciones en el array "lessons" con estos tipos en este ORDEN EXACTO.`
    : ` requestedTypes: [${requestedTypes.map(t => `"${t}"`).join(", ")}]. Generate EXACTLY ${requestedTypes.length} lessons in the "lessons" array with these types in this EXACT order.`;
  const tiktokTextRule = lang === "es"
    ? " REGLA CRÍTICA DE SALIDA: EL TEXTO VISIBLE EN PANTALLA (title, desc, opciones de juego, diálogo de podcast) DEBE SER MÁXIMO 1 O 2 ORACIONES CONTUNDENTES (MENOS DE 120 CARACTERES). EXCEPCIÓN: tooltip_explanation DEBE ser 2-3 oraciones (30-45 palabras) porque aparece en un modal aparte. PIENSA COMO UN SUBTÍTULO RÁPIDO DE TIKTOK para todo lo demás."
    : " CRITICAL OUTPUT RULE: ON-SCREEN TEXT (title, desc, game options, podcast dialogue) MUST BE A MAXIMUM OF 1 OR 2 PUNCHY SENTENCES (UNDER 120 CHARACTERS). EXCEPTION: tooltip_explanation MUST be 2-3 sentences (30-45 words) because it appears in a separate modal. THINK LIKE A FAST-PACED TIKTOK CAPTION for everything else.";
  const prompt = `${persona} ${doctrine} ${ageShark} ${suffix}${topicLine}${countryLine}${langLine}${typesLine}${tiktokTextRule}`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    const data = await response.json();
    endTimer();
    const cleanText = data.candidates[0].content.parts[0].text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanText);
    if (parsed?.lessons) {
      parsed.lessons = parsed.lessons.map((lesson: any, idx: number) => {
        const expectedType = requestedTypes[idx];
        if (expectedType && !lesson.type) lesson.type = expectedType;
        if (lesson.type === "concept_breakdown") lesson.type = "concept";
        if (lesson.type === "podcast_clip") lesson.type = "podcast";
        if (!lesson.type || !["journey", "concept", "podcast"].includes(lesson.type)) lesson.type = "journey";
        if (lesson.miniGame?.options) {
          const shuffled = shuffleOptions(lesson.miniGame.options, lesson.miniGame.correctIndex);
          lesson.miniGame.options = shuffled.options;
          lesson.miniGame.correctIndex = shuffled.correctIndex;
        }
        return lesson;
      });
    }
    if (parsed?.bossQuiz?.options) {
      const shuffled = shuffleOptions(parsed.bossQuiz.options, parsed.bossQuiz.correctIndex);
      parsed.bossQuiz.options = shuffled.options;
      parsed.bossQuiz.correctIndex = shuffled.correctIndex;
    }
    return parsed;
  } catch (e) {
    endTimer();
    return null;
  }
};

const SUBJECT_OPTIONS = {
  en: [
    { key: "compound_interest", label: "Compound Interest", icon: "📈" },
    { key: "market_basics", label: "Market Basics", icon: "🏛️" },
    { key: "real_estate", label: "Real Estate", icon: "🏠" },
    { key: "debt_traps", label: "Debt Traps", icon: "⚠️" },
    { key: "crypto_defi", label: "Crypto & DeFi", icon: "🪙" },
    { key: "side_hustles", label: "Side Hustles", icon: "💡" },
    { key: "credit_scores", label: "Credit Scores", icon: "📊" },
    { key: "taxes", label: "Taxes & Filing", icon: "🧾" },
    { key: "entrepreneurship", label: "Entrepreneurship", icon: "🚀" },
    { key: "insurance", label: "Insurance", icon: "🛡️" },
  ],
  es: [
    { key: "compound_interest", label: "Interés Compuesto", icon: "📈" },
    { key: "market_basics", label: "Fundamentos del Mercado", icon: "🏛️" },
    { key: "real_estate", label: "Bienes Raíces", icon: "🏠" },
    { key: "debt_traps", label: "Trampas de Deuda", icon: "⚠️" },
    { key: "crypto_defi", label: "Crypto y DeFi", icon: "🪙" },
    { key: "side_hustles", label: "Emprendimiento", icon: "💡" },
    { key: "credit_scores", label: "Puntaje Crediticio", icon: "📊" },
    { key: "taxes", label: "Impuestos", icon: "🧾" },
    { key: "entrepreneurship", label: "Emprendimiento Propio", icon: "🚀" },
    { key: "insurance", label: "Seguros", icon: "🛡️" },
  ],
};

const generateShortText = async (type: "intro" | "summary", opts: { name: string; ageGroup: string; subject: string; lang: Lang }): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return type === "intro"
    ? (opts.lang === "es" ? `¡Hola ${opts.name}! Hoy conquistamos ${opts.subject}. ¡Vamos!` : `Hey ${opts.name}! Today we're mastering ${opts.subject}. Let's go!`)
    : (opts.lang === "es" ? `¡Increíble, ${opts.name}! Dominaste ${opts.subject}. ¡Sigue así!` : `Amazing work, ${opts.name}! You crushed ${opts.subject}. Keep going!`);
  const instruction = type === "intro"
    ? (opts.lang === "es"
      ? `Genera un saludo ÚNICO, carismático y personalizado para ${opts.name} (${opts.ageGroup}). El tema de hoy es: ${opts.subject}. MÁXIMO 25 palabras. Sé creativo, varía tu energía y vocabulario cada vez. NUNCA uses la misma frase dos veces. Solo responde con el texto, sin comillas ni formato.`
      : `Generate a UNIQUE, charismatic personalized greeting for ${opts.name} (${opts.ageGroup}). Today's subject: ${opts.subject}. MAX 25 words. Be creative, vary your energy and vocabulary every time. NEVER use the same phrasing twice. Respond with ONLY the text, no quotes or formatting.`)
    : (opts.lang === "es"
      ? `Genera una felicitación ÚNICA y alentadora para ${opts.name} que acaba de completar una lección sobre ${opts.subject}. MÁXIMO 25 palabras. Varía el tono cada vez. Solo texto, sin comillas.`
      : `Generate a UNIQUE encouraging congratulations for ${opts.name} who just completed a lesson on ${opts.subject}. MAX 25 words. Vary the tone every time. Respond with ONLY the text, no quotes.`);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: instruction }] }] }) },
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || (type === "intro" ? `Hey ${opts.name}! Let's dive in!` : `Great job, ${opts.name}!`);
  } catch {
    return type === "intro" ? `Hey ${opts.name}! Let's dive in!` : `Great job, ${opts.name}!`;
  }
};

const sharkVideos = [
  "https://videos.pexels.com/video-files/5968033/5968033-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/7997336/7997336-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/5548359/5548359-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2274223/2274223-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2556894/2556894-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/1580507/1580507-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1093658/1093658-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1093665/1093665-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2795167/2795167-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795173/2795173-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795391/2795391-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795407/2795407-hd_1920_1080_25fps.mp4",
];

const oceanVideos = [
  "https://videos.pexels.com/video-files/853789/853789-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/853970/853970-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/854029/854029-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/854097/854097-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/854245/854245-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/854648/854648-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/854669/854669-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/854716/854716-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/854905/854905-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/855023/855023-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/855286/855286-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/855404/855404-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/855640/855640-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/855758/855758-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/855994/855994-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/856030/856030-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/856356/856356-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/856462/856462-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/856934/856934-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/857288/857288-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1321208/1321208-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/1437396/1437396-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/1851190/1851190-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2257010/2257010-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2278095/2278095-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2516159/2516159-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2519660/2519660-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2620041/2620041-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2759477/2759477-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2792370/2792370-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3141207/3141207-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3194277/3194277-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3209829/3209829-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3214435/3214435-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3255275/3255275-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/4328730/4328730-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/4469565/4469565-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4",
];

const allVideos = [...sharkVideos, ...sharkVideos, ...oceanVideos];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

let videoQueue: string[] = [];
const getNextVideo = (): string => {
  if (videoQueue.length === 0) videoQueue = shuffleArray(allVideos);
  return videoQueue.pop()!;
};

const cardVideoMap = new Map<string, string>();

const getVideoForCard = (cardId: string, card?: any): string => {
  if (card?.video_url) return card.video_url;
  if (!cardVideoMap.has(cardId)) cardVideoMap.set(cardId, getNextVideo());
  return cardVideoMap.get(cardId)!;
};

const bgGradients = [
  "radial-gradient(ellipse at 20% 50%, #0c2d48 0%, #0f172a 60%, #020617 100%)",
  "radial-gradient(ellipse at 80% 30%, #1e3a5f 0%, #0c1524 50%, #020617 100%)",
  "radial-gradient(ellipse at 50% 80%, #312e81 0%, #0f172a 55%, #020617 100%)",
  "radial-gradient(ellipse at 30% 20%, #7c2d12 0%, #1c1917 55%, #020617 100%)",
  "radial-gradient(ellipse at 70% 60%, #145374 0%, #0f172a 55%, #020617 100%)",
  "radial-gradient(ellipse at 40% 40%, #1e40af 0%, #0f172a 55%, #020617 100%)",
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait",
  "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
  "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru",
  "Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman",
  "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Puerto Rico","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino",
  "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands",
  "Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia",
  "Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const load = (k, d) => {
  const v = localStorage.getItem(`ws_${k}`);
  return v ? parseInt(v, 10) : d;
};
const save = (k, v) => localStorage.setItem(`ws_${k}`, String(v));
const loadStr = (k, d) => localStorage.getItem(`ws_${k}`) || d;
const saveStr = (k, v) => localStorage.setItem(`ws_${k}`, v);

const FONT = "'Inter', system-ui, -apple-system, sans-serif";


const getAgeFromYear = (yearStr: string): number => {
  if (!yearStr) return 0;
  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return 0;
  return new Date().getFullYear() - year;
};

const getAgeGroup = (age: number): string => {
  if (age <= 12) return "Kids";
  if (age <= 16) return "Teens";
  return "Adults";
};

const audioBlobCache = new Map<string, string>();
const bufferCardAudioPlayed = new Set<string>();
const bufferCardObserved = new Set<string>();

function getPlayButtonCopy(type: string, lang: "en" | "es"): string {
  if (type === "podcast" || type === "podcast_clip") {
    return lang === "es"
      ? "Hora del podcast! Toca para aprender de los pros"
      : "Money podcast time! Tap to learn from the pros";
  }
  return lang === "es" ? "Toca para escuchar" : "Tap to listen";
}

function PodcastClipSlide({
  card, videoSrc, bgGradient, lang, isMutedRef, speechSpeedRef, isActive, onTooltip,
}: {
  card: any; videoSrc: string; bgGradient: string; lang: Lang;
  isMutedRef: React.MutableRefObject<boolean>; speechSpeedRef: React.MutableRefObject<number>;
  isActive: boolean; onTooltip?: (text: string) => void;
}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [speakingIdx, setSpeakingIdx] = useState(-1);
  const [hasPlayed, setHasPlayed] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const dialogue: { speaker: string; text: string }[] = card.dialogue || [];

  const runPlaybackQueue = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    for (let i = 0; i < dialogue.length; i++) {
      if (ac.signal.aborted) break;
      setVisibleLines(i + 1);

      if (isMutedRef.current || speechSpeedRef.current === 0 || !isElevenLabsAvailable()) {
        setSpeakingIdx(i);
        await new Promise<void>((r) => {
          const tid = setTimeout(r, 2200);
          ac.signal.addEventListener("abort", () => { clearTimeout(tid); r(); }, { once: true });
        });
        if (!ac.signal.aborted) setSpeakingIdx(-1);
        continue;
      }

      setSpeakingIdx(i);
      const cacheKey = `podcast_${card.id}_${i}_${lang}`;
      const cachedUrl = audioBlobCache.get(cacheKey);

      if (cachedUrl) {
        const result = await new Promise<"done" | "aborted" | "error">((resolve) => {
          const audio = new Audio(cachedUrl);
          audio.playbackRate = speechSpeedRef.current || 1;
          audio.volume = 0.85;

          const onAbort = () => { audio.pause(); audio.src = ""; resolve("aborted"); };
          ac.signal.addEventListener("abort", onAbort, { once: true });

          audio.onended = () => { ac.signal.removeEventListener("abort", onAbort); resolve("done"); };
          audio.onerror = () => { ac.signal.removeEventListener("abort", onAbort); resolve("error"); };
          audio.play().catch(() => {
            ac.signal.removeEventListener("abort", onAbort);
            resolve("error");
          });
        });

        if (result === "aborted") break;
        if (!ac.signal.aborted) setSpeakingIdx(-1);
        if (result === "error") {
          await new Promise<void>((r) => {
            const tid = setTimeout(r, 2000);
            ac.signal.addEventListener("abort", () => { clearTimeout(tid); r(); }, { once: true });
          });
        }
      } else {
        const result = await speakPodcastLine(
          dialogue[i].text, dialogue[i].speaker, lang,
          { speed: speechSpeedRef.current, signal: ac.signal },
        );
        if (result === "aborted") break;
        if (!ac.signal.aborted) setSpeakingIdx(-1);
        if (result === "error") {
          await new Promise<void>((r) => {
            const tid = setTimeout(r, 2000);
            ac.signal.addEventListener("abort", () => { clearTimeout(tid); r(); }, { once: true });
          });
        }
      }
    }

    if (!ac.signal.aborted) { setVisibleLines(dialogue.length); setSpeakingIdx(-1); }
    if (abortRef.current === ac) abortRef.current = null;
  }, [dialogue, lang, isMutedRef, speechSpeedRef, card.id]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      stopElevenLabsAudio();
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (abortRef.current) abortRef.current.abort();
      stopElevenLabsAudio();
      setSpeakingIdx(-1);
    }
  }, [isActive]);

  const handlePlay = () => {
    if (abortRef.current) abortRef.current.abort();
    stopElevenLabsAudio();
    setHasPlayed(true);
    setVisibleLines(0);
    setSpeakingIdx(-1);
    setTimeout(() => runPlaybackQueue().catch(() => {}), 50);
  };

  const audioAvailable = !!(isElevenLabsAvailable() && !isMutedRef.current);
  const isPlaying = speakingIdx >= 0;
  const showPlayBtn = isActive && !isPlaying && audioAvailable && dialogue.length > 0;
  const allRevealed = visibleLines >= dialogue.length;
  const isSpeaking = speakingIdx >= 0;

  return (
    <div
      ref={slideRef}
      style={{
        height: "100dvh", width: "100%", position: "relative",
        scrollSnapAlign: "start", scrollSnapStop: "always",
        background: "#000", overflow: "hidden",
      }}
    >
      <video
        autoPlay muted loop playsInline preload="auto"
        onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", zIndex: 0,
          animation: "vidFade 0.8s ease-out both",
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        zIndex: 1,
      }}>
        <div style={{
          maxHeight: "80vh",
          background: "linear-gradient(to top, rgba(0,20,40,0.92) 0%, rgba(0,20,40,0.75) 70%, rgba(0,20,40,0.4) 100%)",
          padding: "30px 28px 70px",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 10, overflowY: "auto", scrollbarWidth: "none",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            animation: "radioTextFade 0.6s ease-out both",
          }}>
            <span style={{ fontSize: "1.2rem" }}>🎧</span>
            <span style={{
              fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.25em",
              color: "#2e8bc0", textTransform: "uppercase",
            }}>MOOLAB PODCAST</span>
            {card.tooltip_explanation && onTooltip && (
              <button
                className="ws-btn"
                onClick={() => onTooltip(card.tooltip_explanation)}
                style={{
                  width: 22, height: 22, borderRadius: "50%", border: "1.5px solid rgba(0,255,213,0.4)",
                  background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
                  color: "#00ffd5", fontSize: "0.65rem", fontWeight: 800,
                  cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >?</button>
            )}
            {isSpeaking && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", borderRadius: 20,
                background: "rgba(46,139,192,0.15)", marginLeft: 4,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#00ffd5",
                  animation: "contextPulse 1s ease-in-out infinite",
                }} />
                <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#00ffd5", letterSpacing: "0.15em" }}>LIVE</span>
              </span>
            )}
          </div>

          {showPlayBtn && (
            <button
              onClick={handlePlay}
              style={{
                padding: "14px 28px", borderRadius: 50,
                border: "2px solid rgba(0,255,213,0.4)",
                background: "linear-gradient(135deg, rgba(0,255,213,0.15), rgba(46,139,192,0.2))",
                backdropFilter: "blur(12px)",
                color: "#fff", fontWeight: 800, fontSize: "0.85rem", fontFamily: FONT,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                animation: "enterPulse 2.5s ease-in-out infinite",
                boxShadow: "0 0 40px rgba(0,255,213,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{hasPlayed ? "🔄" : "▶️"}</span>
              <span style={{ textAlign: "left", lineHeight: 1.3 }}>
                {hasPlayed
                  ? (lang === "es" ? "Reproducir de nuevo" : "Play again")
                  : getPlayButtonCopy("podcast", lang)}
              </span>
            </button>
          )}

          <div style={{
            display: "flex", flexDirection: "column", gap: 10,
            width: "100%", maxWidth: 380,
          }}>
            {(hasPlayed ? dialogue.slice(0, visibleLines) : dialogue.slice(0, 2)).map((line, idx) => {
              const isHost = line.speaker.toLowerCase() === "host" || line.speaker.toLowerCase() === "presentador" || line.speaker.toLowerCase() === "presentadora";
              const isLineActive = hasPlayed && idx === speakingIdx;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex", flexDirection: "column", gap: 3,
                    animation: hasPlayed ? "radioTextFade 0.5s ease-out both" : "none",
                    alignItems: isHost ? "flex-start" : "flex-end",
                    opacity: !hasPlayed ? 0.35 : 1,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  <span style={{
                    fontSize: "0.5rem", fontWeight: 900, letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: isHost ? "#00ffd5" : "#6cb4ee",
                  }}>
                    {line.speaker}
                  </span>
                  <div style={{
                    padding: "10px 14px", borderRadius: 14,
                    background: isHost
                      ? isLineActive ? "rgba(0,255,213,0.12)" : "rgba(0,255,213,0.06)"
                      : isLineActive ? "rgba(108,180,238,0.12)" : "rgba(108,180,238,0.05)",
                    border: `1px solid ${isHost
                      ? isLineActive ? "rgba(0,255,213,0.4)" : "rgba(0,255,213,0.15)"
                      : isLineActive ? "rgba(108,180,238,0.4)" : "rgba(108,180,238,0.12)"}`,
                    maxWidth: "90%",
                    borderTopLeftRadius: isHost ? 4 : 14,
                    borderTopRightRadius: isHost ? 14 : 4,
                    boxShadow: isLineActive ? `0 0 20px ${isHost ? "rgba(0,255,213,0.15)" : "rgba(108,180,238,0.15)"}` : "none",
                    transition: "all 0.3s ease",
                  }}>
                    <p style={{
                      color: isLineActive ? "#fff" : "rgba(255,255,255,0.85)",
                      fontSize: "0.82rem", fontWeight: isLineActive ? 700 : 600,
                      lineHeight: 1.45, margin: 0, fontFamily: FONT,
                    }}>
                      {line.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {allRevealed && hasPlayed && !isSpeaking && (
            <span style={{
              color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              animation: "contextPulse 2s ease-in-out infinite",
            }}>
              {translations.auth.swipeToContinue[lang]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface AppProps {
  demoMode?: boolean;
  demoAgeGroup?: string;
}

function App({ demoMode = false, demoAgeGroup = "" }: AppProps) {
  const {
    currentData, setCurrentData,
    activeSlideIndex, setActiveSlideIndex,
    completedSlides, setCompletedSlides,
    slideAnswers, setSlideAnswers,
    isFetchingMore, setIsFetchingMore,
    isFetchingRef,
    introBurned, burnIntro, resetFeedSession,
    scrollProgress, setScrollProgress,
    feedRef,
    slidesScrolledRef, lastSlideRef,
  } = useFeed();

  const [lang, setLang] = useState<Lang>(() => {
    return loadStr("lang", "en") as Lang;
  });
  const langRef = useRef<Lang>(loadStr("lang", "en") as Lang);

  useEffect(() => {
    langRef.current = lang;
    saveStr("lang", lang);
  }, [lang]);

  const MODULES = getModules(lang);
  const t = translations;

  const [appStarted, setAppStarted] = useState(demoMode);
  const [ageGroup, setAgeGroup] = useState(demoMode ? demoAgeGroup : "");
  const [loading, setLoading] = useState(false);
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [showQuizSummary, setShowQuizSummary] = useState(false);
  const [quizSummaryText, setQuizSummaryText] = useState<string | null>(null);
  const [quizSummaryAudioUrl, setQuizSummaryAudioUrl] = useState<string | null>(null);
  const [quizResultPick, setQuizResultPick] = useState<{ emoji: string; title: string; sub: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [muted, setMuted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [preloadReady, setPreloadReady] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState("");
  const [userName, setUserName] = useState(() => demoMode ? (loadStr("name", "") || "Demo") : loadStr("name", ""));
  const [birthYear, setBirthYear] = useState(() => loadStr("birth", ""));
  const [accountType, setAccountType] = useState(() => demoMode ? "learner" : loadStr("acctType", ""));
  const [parentName, setParentName] = useState(() => loadStr("parentName", ""));
  const [userCountry, setUserCountry] = useState(() => loadStr("country", ""));
  const [countryLoading, setCountryLoading] = useState(false);
  const [generatedPin, setGeneratedPin] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [familyVersion, setFamilyVersion] = useState(0);
  const getFamilyState = (): { parent?: string; students?: { nickname: string; pin: string; birthYear: string; country: string }[] } => {
    try { return JSON.parse(localStorage.getItem("ws_family") || "{}"); } catch { return {}; }
  };
  const [onboardStep, setOnboardStep] = useState(() => {
    const savedType = loadStr("acctType", "");
    const savedName = loadStr("name", "");
    if (savedType && savedName) return 2;
    if (savedType) return 2;
    return 0;
  });
  const [showModuleMap, setShowModuleMap] = useState(false);
  const [showParentDash, setShowParentDash] = useState(false);
  const [showLanding, setShowLanding] = useState(!demoMode);
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const selectedSubjectRef = useRef<string | null>(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const [xp, setXp] = useState(() => load("xp", 0));
  const [streak, setStreak] = useState(() => load("streak", 0));
  const [level, setLevel] = useState(() => load("level", 1));
  const [bossWins, setBossWins] = useState(() => load("bossWins", 0));
  const [moolies, setMoolies] = useState(() => load("moolies", 0));
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ws_unlockedItems") || "[]"); } catch { return []; }
  });
  const [equippedItems, setEquippedItems] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ws_equippedItems") || "[]"); } catch { return []; }
  });
  const [activeTab, setActiveTab] = useState<TabId>("hub");
  const navigateTo = useCallback((tab: TabId) => {
    if (tab !== "lab") stopElevenLabsAudio();
    setActiveTab(tab);
  }, []);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(() => load("modIdx", 0));
  const [moduleProgress, setModuleProgress] = useState<Record<number, number>>(() => {
    try { return JSON.parse(localStorage.getItem("ws_modProg") || "{}"); } catch { return {}; }
  });

  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [bossExplanation, setBossExplanation] = useState<string | null>(null);
  const [revealedSlides, setRevealedSlides] = useState<Record<string, boolean>>({});
  const [tooltipText, setTooltipText] = useState<string | null>(null);

  useEffect(() => {
    if (userCountry) return;
    setCountryLoading(true);
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        if (d?.country_name) {
          setUserCountry(d.country_name);
          saveStr("country", d.country_name);
        }
      })
      .catch(() => {})
      .finally(() => setCountryLoading(false));
  }, []);

  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1);
  const speechSpeedRef = useRef<number>(1);
  const progress = Math.min((completedSlides.length / 5) * 100, 100);

  const [flashBlue, setFlashBlue] = useState(false);

  const currentModule = MODULES[Math.min(currentModuleIdx, MODULES.length - 1)];
  const currentModuleWins = moduleProgress[currentModuleIdx] || 0;
  const allModulesComplete = currentModuleIdx >= MODULES.length;

  useEffect(() => {
    save("xp", xp);
    save("streak", streak);
    save("level", level);
    save("bossWins", bossWins);
    save("moolies", moolies);
    save("modIdx", currentModuleIdx);
    localStorage.setItem("ws_modProg", JSON.stringify(moduleProgress));
    localStorage.setItem("ws_unlockedItems", JSON.stringify(unlockedItems));
    localStorage.setItem("ws_equippedItems", JSON.stringify(equippedItems));
  }, [xp, streak, level, bossWins, moolies, unlockedItems, equippedItems, currentModuleIdx, moduleProgress]);

  const preloadAudioForCards = useCallback(async (cards: any[], currentLang: Lang) => {
    if (!isElevenLabsAvailable()) return;
    const SPEAKER_TO_ROLE: Record<string, "Host" | "Expert" | "Guest1" | "Guest2" | "Narrator"> = {
      host: "Host", presentador: "Host", presentadora: "Host",
      expert: "Expert", experto: "Expert", experta: "Expert",
      guest1: "Guest1", invitado1: "Guest1",
      guest2: "Guest2", invitado2: "Guest2",
      narrator: "Narrator", narrador: "Narrator", narradora: "Narrator",
    };
    const jobs: { cacheKey: string; text: string; voiceId: string }[] = [];
    for (const card of cards) {
      if ((card.type === "podcast" || card.type === "podcast_clip") && card.dialogue) {
        for (let i = 0; i < card.dialogue.length; i++) {
          const line = card.dialogue[i];
          const cacheKey = `podcast_${card.id}_${i}_${currentLang}`;
          if (!audioBlobCache.has(cacheKey)) {
            const role = SPEAKER_TO_ROLE[line.speaker?.toLowerCase()?.trim()] || "Narrator";
            jobs.push({ cacheKey, text: line.text, voiceId: getVoiceIdForRole(role, currentLang) });
          }
        }
      }
    }
    let ok = 0;
    let fatal = false;
    for (let j = 0; j < jobs.length; j++) {
      if (fatal) break;
      const { cacheKey, text, voiceId } = jobs[j];
      let result: { url: string | null; httpStatus: number; error?: string } = { url: null, httpStatus: 0 };
      for (let attempt = 0; attempt < 3; attempt++) {
        result = await fetchAudioBlob(text, voiceId);
        if (result.url) break;
        if (result.httpStatus === 401 || result.httpStatus === 402 || result.httpStatus === 403) {
          fatal = true;
          break;
        }
        if (result.httpStatus === 429) {
          const wait = Math.min(2000 * (attempt + 1), 6000);
          await new Promise(r => setTimeout(r, wait));
        } else {
          await new Promise(r => setTimeout(r, 1500));
        }
      }
      if (result.url) {
        audioBlobCache.set(cacheKey, result.url);
        ok++;
      } else if (!fatal) {
      }
      if (j < jobs.length - 1 && !fatal) await new Promise(r => setTimeout(r, 250));
    }
  }, []);

  const resetJourney = useCallback((subjectOverride?: string) => {
    resetFeedSession();
    setLoading(true);
    setPreloadReady(false);
    setPreloadProgress("");
    setQuizUnlocked(false);
    setQuizStarted(false);
    setQuizResult(null);
    setRevealedExplanations({});
    setBossExplanation(null);
    setRevealedSlides({});
    setAudioUnlocked(false);
    stopElevenLabsAudio();
    bufferCardAudioPlayed.clear();
    bufferCardObserved.clear();
    const mod = MODULES[Math.min(currentModuleIdx, MODULES.length - 1)];
    const topic = subjectOverride || selectedSubjectRef.current || mod?.topic;
    const country = loadStr("country", "");
    const currentLang = langRef.current;
    console.time("Loading Bay (4 cards + audio)");
    setPreloadProgress(currentLang === "es" ? "Generando lecciones..." : "Generating lessons...");
    const initialTypes = getRequestedTypes(0, 4);

    const introPromise = generateShortText("intro", {
      name: userName || "Explorer",
      ageGroup,
      subject: subjectOverride || selectedSubjectRef.current || mod?.topic || "finance",
      lang: currentLang,
    });

    const introFallback = currentLang === "es"
      ? `¡Hola${userName ? `, ${userName}` : ""}! Prepárate para una sesión increíble de aprendizaje financiero.`
      : `Hey${userName ? `, ${userName}` : ""}! Get ready for an awesome financial learning session.`;

    generateCards(ageGroup, topic, currentLang, country, 4, { requestedTypes: initialTypes }).then(async (data) => {
      if (!data?.lessons?.length) {
        setLoading(false);
        console.timeEnd("Loading Bay (4 cards + audio)");
        return;
      }

      let introText: string;
      try {
        introText = await Promise.race([
          introPromise,
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Intro text timeout")), 8000)),
        ]) || introFallback;
      } catch (err) {
        console.error("Intro generation failed:", err);
        introText = introFallback;
      }

      const introId = "intro_" + Math.random().toString(36).substr(2, 9);
      const introCard = {
        id: introId,
        type: "intro" as const,
        title: currentLang === "es" ? "¡Bienvenido!" : "Welcome!",
        desc: introText,
      };

      data.lessons = [introCard, ...data.lessons.map((l: any) => ({
        ...l,
        id: Math.random().toString(36).substr(2, 9),
      }))];
      data.lessons = await resolveVideoUrls(data.lessons);
      setCurrentData(data);
      setPreloadProgress(currentLang === "es" ? "Preparando audio..." : "Preparing audio...");

      const introAudioPromise = isElevenLabsAvailable()
        ? fetchAudioBlob(introText, getVoiceIdForRole("Host", currentLang), { stability: 0.75, similarity_boost: 0.85, style: 0.55, use_speaker_boost: true }).then((r) => {
            if (r.url) audioBlobCache.set(`buffercard_${introId}`, r.url);
          }).catch((err) => { console.error("Intro audio fetch failed:", err); })
        : Promise.resolve();

      await Promise.all([
        preloadAudioForCards(data.lessons.filter((l: any) => l.type !== "intro" && l.type !== "summary"), currentLang),
        introAudioPromise,
      ]);
      console.timeEnd("Loading Bay (4 cards + audio)");
      setPreloadReady(true);
    }).catch((err) => {
      console.error("Card generation failed:", err);
      setLoading(false);
    });
  }, [ageGroup, currentModuleIdx, preloadAudioForCards, userName]);

  useEffect(() => {
    if (appStarted && ageGroup && accountType !== "parent" && !demoMode) {
      navigateTo("hub");
    }
    if (appStarted && ageGroup && accountType !== "parent" && demoMode && !currentData) {
      setShowSubjectPicker(true);
    }
  }, [appStarted, ageGroup, accountType]);

  const fallbackBrowserSpeak = useCallback((_text: string, onDone: () => void) => {
    console.error("[Moolab] ElevenLabs TTS unavailable, skipping speech");
    onDone();
  }, []);

  const startSession = (overrides?: { birthYear?: string; accountType?: string }) => {
    const effectiveBirthYear = overrides?.birthYear || birthYear;
    const effectiveAccountType = overrides?.accountType || accountType;
    const age = getAgeFromYear(effectiveBirthYear);
    setAgeGroup(getAgeGroup(age));
    setAppStarted(true);
    if (effectiveAccountType === "parent") return;
  };

  const handleScroll = async (e: any) => {
    if (!currentData || quizUnlocked) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(Math.min((scrollTop / maxScroll) * 100, 100));
    }

    const currentSlideIdx = Math.round(scrollTop / clientHeight);
    setActiveSlideIndex(currentSlideIdx);

    if (currentSlideIdx !== lastSlideRef.current) {
      lastSlideRef.current = currentSlideIdx;
      slidesScrolledRef.current += 1;
    }

    if (
      !introBurned &&
      currentSlideIdx >= 1 &&
      currentData.lessons?.[0]?.type === "intro"
    ) {
      burnIntro();
      return;
    }

    const totalSlides = currentData.lessons?.length || 0;
    const triggerIndex = totalSlides - 3;

    if (currentSlideIdx >= triggerIndex && triggerIndex > 0 && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setIsFetchingMore(true);
      setTimeout(async () => {
        try {
          const currentLang = langRef.current;
          const nextTypes = getRequestedTypes(totalSlides, 4);
          const newData = await generateCards(ageGroup, selectedSubjectRef.current || currentModule?.topic, currentLang, loadStr("country", ""), 4, { requestedTypes: nextTypes });
          if (newData) {
            let nl = newData.lessons.map((l: any) => ({
              ...l,
              id: Math.random().toString(36).substr(2, 9),
            }));
            nl = await resolveVideoUrls(nl);
            await preloadAudioForCards(nl, currentLang);
            setCurrentData((p: any) => {
              const updated = { ...p, lessons: [...p.lessons, ...nl] };
              if (!p.bossQuiz?.actionQuestion && newData.bossQuiz?.actionQuestion && Array.isArray(newData.bossQuiz?.options) && newData.bossQuiz.options.length >= 2) {
                updated.bossQuiz = newData.bossQuiz;
              }
              return updated;
            });
          }
        } catch (err) {
          console.error("Feed extension failed:", err);
        } finally {
          setIsFetchingMore(false);
          isFetchingRef.current = false;
        }
      }, 300);
    }
  };

  const summaryFetchedForQuiz = useRef<string | null>(null);
  useEffect(() => {
    if (quizResult !== true) { summaryFetchedForQuiz.current = null; return; }
    const quizKey = `${userName}_${ageGroup}_${currentModuleIdx}`;
    if (summaryFetchedForQuiz.current === quizKey) return;
    summaryFetchedForQuiz.current = quizKey;

    const currentLang = langRef.current;
    let cancelled = false;

    const winTitles = translations.winTitles[currentLang];
    const picked = winTitles[Math.floor(Math.random() * winTitles.length)];
    setQuizResultPick(picked);

    setShowQuizSummary(true);
    setQuizSummaryText(null);
    setQuizSummaryAudioUrl(null);

    const fallbackText = currentLang === "es"
      ? "¡Gran trabajo en esta sección! Estás progresando increíblemente."
      : "Great job on this section! You're making awesome progress.";

    const timeoutId = setTimeout(() => {
      if (!cancelled && !quizSummaryText) {
        console.warn("Summary generation timed out after 8s — using fallback");
        setQuizSummaryText(fallbackText);
      }
    }, 8000);

    (async () => {
      try {
        const summaryText = await generateShortText("summary", {
          name: userName || "Explorer",
          ageGroup,
          subject: selectedSubjectRef.current || currentModule?.topic || "finance",
          lang: currentLang,
        });
        if (cancelled) return;
        clearTimeout(timeoutId);
        setQuizSummaryText(summaryText || fallbackText);
        if (isElevenLabsAvailable()) {
          try {
            const r = await fetchAudioBlob(summaryText || fallbackText, getVoiceIdForRole("Host", currentLang), { stability: 0.75, similarity_boost: 0.85, style: 0.55, use_speaker_boost: true });
            if (cancelled) return;
            if (r.url) {
              setQuizSummaryAudioUrl(r.url);
              if (!isMutedRef.current && speechSpeedRef.current > 0) {
                playBlobAudio(r.url, speechSpeedRef.current);
              }
            }
          } catch (audioErr) {
            console.error("Summary audio fetch failed:", audioErr);
          }
        }
      } catch (err) {
        console.error("Summary generation failed:", err);
        if (!cancelled) {
          clearTimeout(timeoutId);
          setQuizSummaryText(fallbackText);
        }
      }
    })();
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [quizResult, userName, ageGroup, currentModule]);

  const triggerGreenFlash = () => {
    setFlashBlue(true);
    setTimeout(() => setFlashBlue(false), 300);
  };

  const speakExplanation = async (text: string) => {
    if (isMutedRef.current || speechSpeedRef.current === 0) return;
    const noop = () => {};
    if (isElevenLabsAvailable()) {
      stopElevenLabsAudio();
      const ok = await speakWithElevenLabs(text, langRef.current, {
        speed: speechSpeedRef.current,
        onEnd: noop,
        onError: noop,
      });
      if (!ok && !isMutedRef.current && speechSpeedRef.current !== 0) {
        fallbackBrowserSpeak(text, noop);
      }
    } else {
      fallbackBrowserSpeak(text, noop);
    }
  };

  if (showLanding) {
    const loginHandler = () => {
      setOnboardStep(6);
      setShowLanding(false);
      setFadeIn(true);
      setTimeout(() => setFadeIn(false), 700);
    };
    const signUpHandler = () => {
      setOnboardStep(0);
      setShowLanding(false);
      setFadeIn(true);
      setTimeout(() => setFadeIn(false), 700);
    };
    if (lang === "es") {
      return <LandingPageES onParentLogin={() => { loginHandler(); }} onTestApp={() => { signUpHandler(); }} />;
    }
    return <LandingPage onParentLogin={() => { loginHandler(); }} onTestApp={() => { signUpHandler(); }} />;
  }

  if (!appStarted) {
    const familyState = getFamilyState();

    const saveFamily = (state: typeof familyState) => {
      localStorage.setItem("ws_family", JSON.stringify(state));
      setFamilyVersion((v) => v + 1);
    };

    const canFinish = accountType === "parent"
      ? (parentName.trim() && userName.trim() && birthYear)
      : (userName.trim() && birthYear);

    const stepContent = () => {
      if (onboardStep === 0) {
        return (
          <>
            <img
              src="/moolab-logo-trimmed.png"
              alt="Moolab"
              style={{
                height: 80, width: "auto", objectFit: "contain", marginBottom: 8,
                animation: "splashFloat 3s ease-in-out infinite",
                filter: "drop-shadow(0 0 25px rgba(46,139,192,0.3))",
              }}
            />
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.signUpTitle[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 32 }}>
              {t.auth.signUpSubtitle[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 340, marginBottom: 24 }}>
              <button
                className="ws-btn"
                onClick={() => {
                  setAccountType("learner");
                  saveStr("acctType", "learner");
                  setOnboardStep(5);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  width: "100%", padding: "22px 24px", borderRadius: 20,
                  background: "linear-gradient(135deg, #0c2d48, #145374)",
                  border: "none", color: "#fff", textAlign: "left",
                  fontFamily: FONT, cursor: "pointer",
                  boxShadow: "0 8px 30px rgba(12,45,72,0.25)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <span style={{ fontSize: "2.2rem", flexShrink: 0 }}>🦈</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.01em", marginBottom: 2 }}>
                    {t.auth.imAShark[lang]}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.7rem", opacity: 0.7 }}>
                    {t.auth.sharkDesc[lang]}
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "auto", flexShrink: 0, opacity: 0.5 }}>
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </button>

              <button
                className="ws-btn"
                onClick={() => {
                  setAccountType("parent");
                  saveStr("acctType", "parent");
                  setOnboardStep(7);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  width: "100%", padding: "22px 24px", borderRadius: 20,
                  background: "#fff", border: "2px solid rgba(12,45,72,0.1)",
                  color: "#0c2d48", textAlign: "left",
                  fontFamily: FONT, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <span style={{ fontSize: "2.2rem", flexShrink: 0 }}>👨‍👩‍👧</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.01em", marginBottom: 2, color: "#0c2d48" }}>
                    {t.auth.parentSignUp[lang]}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.7rem", color: "rgba(12,45,72,0.45)" }}>
                    {t.auth.parentSignUpDesc[lang]}
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(12,45,72,0.3)" style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </button>
            </div>

            <button
              className="ws-btn"
              onClick={() => setOnboardStep(6)}
              style={{
                background: "none", border: "none", color: "rgba(12,45,72,0.35)",
                fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem",
                cursor: "pointer", padding: "8px 0",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >
              {t.auth.alreadyHaveAccount[lang]}
            </button>

            <p style={{ color: "rgba(12,45,72,0.2)", fontSize: "0.6rem", fontWeight: 600, marginTop: 10 }}>
              {t.onboard.freeTag[lang]}
            </p>
          </>
        );
      }

      if (onboardStep === 3) {
        const [pinNickname, setPinNickname] = [userName, setUserName];
        const [pinCode, setPinCode] = [birthYear, setBirthYear];

        const attemptPinLogin = () => {
          const family = (() => { try { return JSON.parse(localStorage.getItem("ws_family") || "{}"); } catch { return {}; } })();
          const students = family.students || [];
          const match = students.find((s: any) => s.nickname.toLowerCase() === pinNickname.trim().toLowerCase() && s.pin === pinCode.trim());
          if (match) {
            setUserName(match.nickname);
            saveStr("name", match.nickname);
            setBirthYear(match.birthYear);
            saveStr("birth", match.birthYear);
            setUserCountry(match.country || "");
            saveStr("country", match.country || "");
            setAccountType("learner");
            saveStr("acctType", "learner");
            startSession({ birthYear: match.birthYear, accountType: "learner" });
          } else {
            alert(t.auth.incorrectPin[lang]);
          }
        };

        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>🎓</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.studentAccess[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28 }}>
              {t.auth.enterPinPrompt[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.auth.nickname[lang]}
                </label>
                <input
                  type="text"
                  placeholder={t.auth.nicknamePlaceholder[lang]}
                  value={pinNickname}
                  onChange={(e) => { setPinNickname(e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", caretColor: "#145374", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  PIN
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pinCode}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setPinCode(v); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "1.4rem",
                    outline: "none", caretColor: "#145374", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)", textAlign: "center",
                    letterSpacing: "0.5em",
                  }}
                />
              </div>
            </div>

            <button
              className="ws-btn"
              onClick={attemptPinLogin}
              disabled={!pinNickname.trim() || pinCode.length !== 4}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: (pinNickname.trim() && pinCode.length === 4)
                  ? "linear-gradient(135deg, #2e8bc0, #b1d4e0)"
                  : "rgba(12,45,72,0.08)",
                color: (pinNickname.trim() && pinCode.length === 4) ? "#fff" : "rgba(12,45,72,0.25)",
                fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
                cursor: (pinNickname.trim() && pinCode.length === 4) ? "pointer" : "default",
                boxShadow: (pinNickname.trim() && pinCode.length === 4)
                  ? "0 0 40px rgba(46,139,192,0.2), 0 8px 24px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {t.auth.enter[lang]}
            </button>
          </>
        );
      }

      if (onboardStep === 5) {
        const sharkReady = userName.trim() && birthYear;
        return (
          <>
            <div style={{ fontSize: "2.8rem", marginBottom: 12 }}>🦈</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.sharkSetup[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28, maxWidth: 300, textAlign: "center", lineHeight: 1.5 }}>
              {t.auth.sharkSetupDesc[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.auth.yourNickname[lang]}
                </label>
                <input
                  type="text"
                  placeholder={t.auth.sharkNamePlaceholder[lang]}
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); saveStr("name", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", caretColor: "#145374", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.auth.birthYear[lang]}
                </label>
                <select
                  value={birthYear}
                  onChange={(e) => { setBirthYear(e.target.value); saveStr("birth", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: birthYear ? "#0c2d48" : "rgba(12,45,72,0.35)", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", colorScheme: "light",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(12,45,72,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="" disabled>{t.onboard.selectYear[lang]}</option>
                  {Array.from({ length: 22 }, (_, i) => new Date().getFullYear() - 4 - i).map((yr) => (
                    <option key={yr} value={String(yr)} style={{ background: "#fff", color: "#0c2d48" }}>{yr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.onboard.countryLabel[lang]}
                </label>
                <select
                  value={userCountry}
                  onChange={(e) => { setUserCountry(e.target.value); saveStr("country", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: userCountry ? "#0c2d48" : "rgba(12,45,72,0.35)", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", colorScheme: "light",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(12,45,72,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="" disabled>{countryLoading ? t.onboard.detectingLocation[lang] : t.onboard.countryPlaceholder[lang]}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} style={{ background: "#fff", color: "#0c2d48" }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {birthYear && (
              <div style={{
                marginBottom: 16, padding: "8px 16px", borderRadius: 12,
                background: "rgba(46,139,192,0.08)", border: "1px solid rgba(46,139,192,0.2)",
                animation: "ageBtn 0.3s ease-out both",
              }}>
                <span style={{ color: "#145374", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                  {(() => {
                    const age = getAgeFromYear(birthYear);
                    const group = getAgeGroup(age);
                    if (group === "Kids") return t.onboard.trackKids[lang];
                    if (group === "Teens") return t.onboard.trackTeens[lang];
                    return t.onboard.trackAdults[lang];
                  })()}
                </span>
              </div>
            )}

            <button
              className="ws-btn"
              onClick={() => startSession({ birthYear, accountType: "learner" })}
              disabled={!sharkReady}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: sharkReady
                  ? "linear-gradient(135deg, #0c2d48, #145374)"
                  : "rgba(12,45,72,0.08)",
                color: sharkReady ? "#fff" : "rgba(12,45,72,0.25)",
                fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
                cursor: sharkReady ? "pointer" : "default",
                boxShadow: sharkReady
                  ? "0 0 40px rgba(12,45,72,0.3), 0 8px 24px rgba(0,0,0,0.12)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              🦈 {t.auth.startSwimming[lang]}
            </button>
          </>
        );
      }

      if (onboardStep === 6) {
        return (
          <>
            <img
              src="/moolab-logo-trimmed.png"
              alt="Moolab"
              style={{
                height: 70, width: "auto", objectFit: "contain", marginBottom: 8,
                filter: "drop-shadow(0 0 20px rgba(46,139,192,0.3))",
              }}
            />
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.loginTitle[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 32 }}>
              {t.auth.loginSubtitle[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 16 }}>
              <button
                className="ws-btn"
                onClick={() => {
                  setAccountType("parent");
                  saveStr("acctType", "parent");
                  setOnboardStep(1);
                }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  width: "100%", padding: "16px 24px", borderRadius: 16,
                  background: "#000", border: "none", color: "#fff",
                  fontFamily: FONT, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                {t.auth.continueApple[lang]}
                <span style={{ fontSize: "0.5rem", opacity: 0.5, fontWeight: 600, marginLeft: 4 }}>({t.auth.comingSoon[lang]})</span>
              </button>
              <button
                className="ws-btn"
                onClick={() => {
                  setAccountType("parent");
                  saveStr("acctType", "parent");
                  setOnboardStep(1);
                }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  width: "100%", padding: "16px 24px", borderRadius: 16,
                  background: "#fff", border: "1px solid rgba(12,45,72,0.12)", color: "#0c2d48",
                  fontFamily: FONT, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {t.auth.continueGoogle[lang]}
                <span style={{ fontSize: "0.5rem", opacity: 0.4, fontWeight: 600, marginLeft: 4 }}>({t.auth.comingSoon[lang]})</span>
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 340, margin: "12px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(12,45,72,0.08)" }} />
              <span style={{ color: "rgba(12,45,72,0.25)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                {t.auth.or[lang]}
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(12,45,72,0.08)" }} />
            </div>

            <button
              className="ws-btn"
              onClick={() => setOnboardStep(3)}
              style={{
                width: "100%", maxWidth: 340, padding: "16px 24px", borderRadius: 16,
                background: "rgba(46,139,192,0.06)", border: "1px solid rgba(46,139,192,0.15)",
                color: "#145374", fontFamily: FONT, fontWeight: 800, fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              🦈 {t.auth.returningShark[lang]}
            </button>

            <button
              className="ws-btn"
              onClick={() => setOnboardStep(0)}
              style={{
                background: "none", border: "none", color: "rgba(12,45,72,0.35)",
                fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem",
                cursor: "pointer", padding: "8px 0", marginTop: 16,
                textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >
              {t.auth.noAccountYet[lang]}
            </button>
          </>
        );
      }

      if (onboardStep === 7) {
        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>👨‍👩‍👧</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.parentSignUp[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28 }}>
              {t.auth.parentSignUpDesc[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              <button
                className="ws-btn"
                onClick={() => setOnboardStep(1)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  width: "100%", padding: "16px 24px", borderRadius: 16,
                  background: "#000", border: "none", color: "#fff",
                  fontFamily: FONT, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                {t.auth.continueApple[lang]}
                <span style={{ fontSize: "0.5rem", opacity: 0.5, fontWeight: 600, marginLeft: 4 }}>({t.auth.comingSoon[lang]})</span>
              </button>
              <button
                className="ws-btn"
                onClick={() => setOnboardStep(1)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  width: "100%", padding: "16px 24px", borderRadius: 16,
                  background: "#fff", border: "1px solid rgba(12,45,72,0.12)", color: "#0c2d48",
                  fontFamily: FONT, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {t.auth.continueGoogle[lang]}
                <span style={{ fontSize: "0.5rem", opacity: 0.4, fontWeight: 600, marginLeft: 4 }}>({t.auth.comingSoon[lang]})</span>
              </button>
            </div>

            <p style={{ color: "rgba(12,45,72,0.25)", fontSize: "0.55rem", fontWeight: 600, marginBottom: 16, textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
              {lang === "en" ? "For now, tap either button to continue with the demo setup" : "Por ahora, toca cualquier botón para continuar con la demo"}
            </p>

            <button
              className="ws-btn"
              onClick={() => setOnboardStep(6)}
              style={{
                background: "none", border: "none", color: "rgba(12,45,72,0.35)",
                fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem",
                cursor: "pointer", padding: "8px 0",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >
              {t.auth.alreadyHaveAccount[lang]}
            </button>
          </>
        );
      }

      if (onboardStep === 1) {
        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.commandCenter[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28 }}>
              {t.auth.setupProfiles[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>{t.onboard.yourName[lang]}</label>
                <input
                  type="text"
                  placeholder={t.onboard.parentPlaceholder[lang]}
                  value={parentName}
                  onChange={(e) => { setParentName(e.target.value); saveStr("parentName", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", caretColor: "#145374", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
            </div>

            {(familyState.students || []).length > 0 && (
              <div style={{ width: "100%", maxWidth: 340, marginBottom: 16 }}>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 4 }}>
                  {t.auth.studentProfiles[lang]}
                </label>
                {familyState.students!.map((s, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 14, marginBottom: 8,
                    background: "rgba(46,139,192,0.06)", border: "1px solid rgba(46,139,192,0.12)",
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0c2d48" }}>{s.nickname}</div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(12,45,72,0.4)", fontWeight: 600 }}>
                        PIN: {s.pin} · {s.country || "—"}
                      </div>
                    </div>
                    <button
                      className="ws-btn"
                      onClick={() => {
                        const updated = { ...familyState, students: familyState.students!.filter((_, i) => i !== idx) };
                        saveFamily(updated);
                      }}
                      style={{
                        background: "none", border: "none", color: "rgba(12,45,72,0.3)",
                        cursor: "pointer", fontSize: "0.9rem", fontFamily: FONT,
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="ws-btn"
              onClick={() => { setGeneratedPin(String(Math.floor(1000 + Math.random() * 9000))); setUserName(""); setBirthYear(""); setOnboardStep(4); }}
              style={{
                width: "100%", maxWidth: 340, padding: "14px 20px", borderRadius: 16,
                background: "rgba(46,139,192,0.08)", border: "1px dashed rgba(46,139,192,0.25)",
                color: "#145374", fontFamily: FONT, fontWeight: 800, fontSize: "0.85rem",
                cursor: "pointer", marginBottom: 12,
              }}
            >
              + {t.auth.createStudentProfile[lang]}
            </button>

            {parentName.trim() && (familyState.students || []).length > 0 && (
              <button
                className="ws-btn"
                onClick={() => {
                  const updated = { ...familyState, parent: parentName };
                  saveFamily(updated);
                  setAccountType("parent");
                  saveStr("acctType", "parent");
                  const firstStudent = familyState.students![0];
                  setUserName(firstStudent.nickname);
                  saveStr("name", firstStudent.nickname);
                  setBirthYear(firstStudent.birthYear);
                  saveStr("birth", firstStudent.birthYear);
                  setUserCountry(firstStudent.country || "");
                  saveStr("country", firstStudent.country || "");
                  startSession({ birthYear: firstStudent.birthYear, accountType: "parent" });
                }}
                style={{
                  width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                  border: "none", fontFamily: FONT,
                  background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
                  color: "#fff", fontWeight: 900, fontSize: "1.05rem", letterSpacing: "0.06em",
                  cursor: "pointer",
                  boxShadow: "0 0 40px rgba(46,139,192,0.2), 0 8px 24px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                }}
              >
                {t.auth.enterDashboard[lang]}
              </button>
            )}
          </>
        );
      }

      if (onboardStep === 4) {
        const [newNickname, setNewNickname] = [userName, setUserName];
        const [newBirthYear, setNewBirthYear] = [birthYear, setBirthYear];
        const [newCountry, setNewCountry] = [userCountry, setUserCountry];


        const canCreate = newNickname.trim() && newBirthYear;

        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>🎓</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.newStudent[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28 }}>
              {t.auth.personalizedProfile[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.auth.nickname[lang]}
                </label>
                <input
                  type="text"
                  placeholder={t.auth.studentNamePlaceholder[lang]}
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", caretColor: "#145374", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.auth.birthYear[lang]}
                </label>
                <select
                  value={newBirthYear}
                  onChange={(e) => setNewBirthYear(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: newBirthYear ? "#0c2d48" : "rgba(12,45,72,0.35)", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", colorScheme: "light",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(12,45,72,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="" disabled>{t.onboard.selectYear[lang]}</option>
                  {Array.from({ length: 22 }, (_, i) => new Date().getFullYear() - 4 - i).map((yr) => (
                    <option key={yr} value={String(yr)} style={{ background: "#fff", color: "#0c2d48" }}>{yr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.onboard.countryLabel[lang]}
                </label>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: newCountry ? "#0c2d48" : "rgba(12,45,72,0.35)", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", colorScheme: "light",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(12,45,72,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="" disabled>{countryLoading ? t.onboard.detectingLocation[lang] : t.onboard.countryPlaceholder[lang]}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} style={{ background: "#fff", color: "#0c2d48" }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {newBirthYear && (
              <div style={{
                marginBottom: 16, padding: "8px 16px", borderRadius: 12,
                background: "rgba(46,139,192,0.08)", border: "1px solid rgba(46,139,192,0.2)",
                animation: "ageBtn 0.3s ease-out both",
              }}>
                <span style={{ color: "#145374", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                  {(() => {
                    const age = getAgeFromYear(newBirthYear);
                    const group = getAgeGroup(age);
                    if (group === "Kids") return t.onboard.trackKids[lang];
                    if (group === "Teens") return t.onboard.trackTeens[lang];
                    return t.onboard.trackAdults[lang];
                  })()}
                </span>
              </div>
            )}

            <div style={{
              width: "100%", maxWidth: 340, marginBottom: 20, padding: "16px 20px", borderRadius: 16,
              background: "linear-gradient(135deg, rgba(46,139,192,0.08), rgba(177,212,224,0.08))",
              border: "1px solid rgba(46,139,192,0.15)", textAlign: "center",
            }}>
              <p style={{ color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
                {t.auth.generatedPin[lang]}
              </p>
              <p style={{ color: "#0c2d48", fontSize: "2rem", fontWeight: 900, letterSpacing: "0.4em", margin: 0 }}>
                {generatedPin}
              </p>
              <p style={{ color: "rgba(12,45,72,0.35)", fontSize: "0.55rem", fontWeight: 600, marginTop: 6 }}>
                {t.auth.pinUsage[lang]}
              </p>
            </div>

            <button
              className="ws-btn"
              onClick={() => {
                if (!canCreate) return;
                const updated = {
                  ...familyState,
                  parent: parentName,
                  students: [...(familyState.students || []), {
                    nickname: newNickname.trim(),
                    pin: generatedPin,
                    birthYear: newBirthYear,
                    country: newCountry,
                  }],
                };
                saveFamily(updated);
                setUserName("");
                setBirthYear("");
                setOnboardStep(1);
              }}
              disabled={!canCreate}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: canCreate
                  ? "linear-gradient(135deg, #2e8bc0, #b1d4e0)"
                  : "rgba(12,45,72,0.08)",
                color: canCreate ? "#fff" : "rgba(12,45,72,0.25)",
                fontWeight: 900, fontSize: "1.05rem", letterSpacing: "0.06em",
                cursor: canCreate ? "pointer" : "default",
                boxShadow: canCreate
                  ? "0 0 40px rgba(46,139,192,0.2), 0 8px 24px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {t.auth.saveProfile[lang]}
            </button>
          </>
        );
      }

      if (onboardStep === 2) {
        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>
              {accountType === "parent" ? "👨‍👩‍👧" : "✏️"}
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {accountType === "parent" ? t.onboard.parentSetup[lang] : t.onboard.tellAboutYou[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28 }}>
              {accountType === "parent" ? t.onboard.personalizeLessons[lang] : t.onboard.pickLevel[lang]}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              {accountType === "parent" && (
                <div>
                  <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>{t.onboard.yourName[lang]}</label>
                  <input
                    type="text"
                    placeholder={t.onboard.parentPlaceholder[lang]}
                    value={parentName}
                    onChange={(e) => { setParentName(e.target.value); saveStr("parentName", e.target.value); }}
                    style={{
                      width: "100%", padding: "14px 18px", borderRadius: 14,
                      background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                      color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                      outline: "none", caretColor: "#145374", boxSizing: "border-box",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    }}
                  />
                </div>
              )}
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {accountType === "parent" ? t.onboard.childName[lang] : t.onboard.yourName[lang]}
                </label>
                <input
                  type="text"
                  placeholder={accountType === "parent" ? t.onboard.childPlaceholder[lang] : t.onboard.namePlaceholder[lang]}
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); saveStr("name", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", caretColor: "#145374", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {accountType === "parent" ? t.onboard.childBirthYear[lang] : t.onboard.yourBirthYear[lang]}
                </label>
                <select
                  value={birthYear}
                  onChange={(e) => { setBirthYear(e.target.value); saveStr("birth", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: birthYear ? "#0c2d48" : "rgba(12,45,72,0.35)", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", colorScheme: "light",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(12,45,72,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="" disabled>{t.onboard.selectYear[lang]}</option>
                  {Array.from({ length: 22 }, (_, i) => new Date().getFullYear() - 4 - i).map((yr) => (
                    <option key={yr} value={String(yr)} style={{ background: "#fff", color: "#0c2d48" }}>{yr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {t.onboard.countryLabel[lang]}
                </label>
                <select
                  value={userCountry}
                  onChange={(e) => { setUserCountry(e.target.value); saveStr("country", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,139,192,0.2)",
                    color: userCountry ? "#0c2d48" : "rgba(12,45,72,0.35)", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", colorScheme: "light",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(12,45,72,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="" disabled>{countryLoading ? t.onboard.detectingLocation[lang] : t.onboard.countryPlaceholder[lang]}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} style={{ background: "#fff", color: "#0c2d48" }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {birthYear && (
              <div style={{
                marginBottom: 20, padding: "8px 16px", borderRadius: 12,
                background: "rgba(46,139,192,0.08)", border: "1px solid rgba(46,139,192,0.2)",
                animation: "ageBtn 0.3s ease-out both",
              }}>
                <span style={{ color: "#145374", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                  {(() => {
                    const age = getAgeFromYear(birthYear);
                    const group = getAgeGroup(age);
                    if (group === "Kids") return t.onboard.trackKids[lang];
                    if (group === "Teens") return t.onboard.trackTeens[lang];
                    return t.onboard.trackAdults[lang];
                  })()}
                </span>
              </div>
            )}

            <button
              className="ws-btn"
              onClick={startSession}
              disabled={!canFinish}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: canFinish
                  ? "linear-gradient(135deg, #2e8bc0, #b1d4e0)"
                  : "rgba(12,45,72,0.08)",
                color: canFinish ? "#fff" : "rgba(12,45,72,0.25)",
                fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
                cursor: canFinish ? "pointer" : "default",
                boxShadow: canFinish
                  ? "0 0 40px rgba(46,139,192,0.2), 0 8px 24px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {t.onboard.startLearning[lang]}
            </button>
          </>
        );
      }
      return null;
    };

    return (
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          background: "linear-gradient(160deg, #eef6fb 0%, #e0f0f8 30%, #d0e8f2 60%, #f2f8fb 100%)",
          color: "#0c2d48",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT,
          padding: 20,
          position: "relative",
          overflow: "hidden",
          animation: fadeIn ? "appFadeIn 0.7s ease-out both" : undefined,
        }}
      >
        <style>{`
          @keyframes appFadeIn { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
          @keyframes splashFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes splashPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
          @keyframes orbDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.15)} }
          @keyframes orbDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,30px) scale(0.9)} }
          @keyframes ageBtn { from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes stepSlide { from{transform:translateX(30px);opacity:0} to{transform:translateX(0);opacity:1} }
          .ws-btn { transition: transform 0.12s cubic-bezier(0.25,0.46,0.45,0.94) !important; }
          .ws-btn:active { transform: scale(0.96) !important; }
        `}</style>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(46,139,192,0.1) 0%,transparent 70%)",top:"15%",left:"-10%",filter:"blur(60px)",animation:"orbDrift1 10s ease-in-out infinite"}} />
        <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(177,212,224,0.12) 0%,transparent 70%)",bottom:"18%",right:"-8%",filter:"blur(60px)",animation:"orbDrift2 12s ease-in-out infinite"}} />

        <button
          className="ws-btn"
          onClick={() => {
            const newLang = lang === "en" ? "es" : "en";
            setLang(newLang as Lang);
            langRef.current = newLang as Lang;
            saveStr("lang", newLang);
          }}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "rgba(46,139,192,0.08)", border: "1px solid rgba(46,139,192,0.15)",
            borderRadius: 12, padding: "6px 12px",
            color: "#145374", fontSize: "0.65rem", fontWeight: 800, cursor: "pointer", fontFamily: FONT,
            zIndex: 10, letterSpacing: "0.08em",
          }}
        >{lang === "en" ? "ES" : "EN"}</button>

        {onboardStep > 0 && (
          <button
            className="ws-btn"
            onClick={() => {
              if (onboardStep === 3) setOnboardStep(0);
              else if (onboardStep === 4) setOnboardStep(1);
              else setOnboardStep(onboardStep - 1);
            }}
            style={{
              position: "absolute", top: 20, left: 20, background: "none", border: "none",
              color: "rgba(12,45,72,0.4)", fontSize: "1.4rem", cursor: "pointer", fontFamily: FONT,
              zIndex: 10,
            }}
          >←</button>
        )}

        <div key={onboardStep} style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "stepSlide 0.35s ease-out both", width: "100%" }}>
          {stepContent()}
        </div>
      </div>
    );
  }
  const handleParentLogout = () => {
    setAppStarted(false);
    setOnboardStep(0);
    setAccountType("");
    saveStr("acctType", "");
    setParentName("");
    saveStr("parentName", "");
    setUserName("");
    saveStr("name", "");
    setBirthYear("");
    saveStr("birth", "");
    setUserCountry("");
    saveStr("country", "");
  };

  const parentDashContent = (
    <CommandCenter
      lang={lang}
      parentName={parentName}
      familyState={getFamilyState()}
      modules={MODULES}
      moduleProgress={moduleProgress}
      currentModuleIdx={currentModuleIdx}
      xp={xp}
      level={level}
      streak={streak}
      bossWins={bossWins}
      userName={userName}
      onLogout={accountType === "parent" ? handleParentLogout : () => setShowParentDash(false)}
      onCreateStudent={() => { setAppStarted(false); setOnboardStep(4); }}
      onLangToggle={() => {
        const newLang = lang === "en" ? "es" : "en";
        setLang(newLang as Lang);
        langRef.current = newLang as Lang;
        saveStr("lang", newLang);
      }}
    />
  );

  if (accountType === "parent" && appStarted) {
    return parentDashContent;
  }

  if (showSubjectPicker && !loading && !currentData)
    return (
      <div style={{
        height: "100dvh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        background: "linear-gradient(160deg, #eef6fb 0%, #e0f0f8 30%, #d0e8f2 60%, #f2f8fb 100%)",
        fontFamily: FONT, padding: 24,
      }}>
        <style>{`
          @keyframes subjectFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes subjectPulse { 0%,100% { box-shadow: 0 4px 20px rgba(46,139,192,0.08); } 50% { box-shadow: 0 8px 30px rgba(46,139,192,0.18); } }
        `}</style>
        <div style={{ animation: "subjectFadeIn 0.6s ease-out both", textAlign: "center", maxWidth: 400, width: "100%" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>🧪</div>
          <h2 style={{
            fontSize: "1.35rem", fontWeight: 900, color: "#0c2d48",
            letterSpacing: "-0.03em", marginBottom: 6,
          }}>
            {lang === "es" ? "¿Qué dominamos hoy?" : "What are we mastering today?"}
          </h2>
          <p style={{
            fontSize: "0.75rem", fontWeight: 600, color: "rgba(12,45,72,0.4)",
            marginBottom: 28, letterSpacing: "0.01em",
          }}>
            {lang === "es" ? "Elige un tema para tu sesión" : "Pick a subject for your session"}
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12, width: "100%",
          }}>
            {SUBJECT_OPTIONS[lang].map((subj, i) => (
              <button
                key={subj.key}
                className="ws-btn"
                onClick={() => {
                  const label = subj.label;
                  setSelectedSubject(label);
                  selectedSubjectRef.current = label;
                  setShowSubjectPicker(false);
                  navigateTo("lab");
                  resetJourney(label);
                }}
                style={{
                  padding: "18px 14px", borderRadius: 20,
                  background: "#fff", border: "1.5px solid rgba(46,139,192,0.12)",
                  cursor: "pointer", fontFamily: FONT,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  animation: `subjectFadeIn 0.5s ease-out ${0.1 + i * 0.07}s both, subjectPulse 3s ease-in-out ${i * 0.4}s infinite`,
                  transition: "transform 0.15s, border-color 0.2s",
                }}
                onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.96)"; }}
                onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              >
                <span style={{ fontSize: "1.6rem" }}>{subj.icon}</span>
                <span style={{
                  fontSize: "0.78rem", fontWeight: 800, color: "#0c2d48",
                  letterSpacing: "-0.01em", lineHeight: 1.2,
                }}>{subj.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  if (loading || !currentData)
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: preloadReady
            ? "radial-gradient(ellipse at center, #0c2d48 0%, #020a14 100%)"
            : "transparent",
          color: preloadReady ? "#fff" : "#0c2d48",
          fontFamily: FONT,
          transition: "background 0.8s ease, color 0.8s ease",
          overflow: "hidden",
        }}
      >
        <style>{`
          @keyframes ldSpin { to{transform:rotate(360deg)} }
          @keyframes ldBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes enterPulse { 0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(46,139,192,0.3),0 8px 32px rgba(0,0,0,0.5)} 50%{transform:scale(1.04);box-shadow:0 0 80px rgba(46,139,192,0.5),0 12px 48px rgba(0,0,0,0.6)} }
          @keyframes enterFadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes sharkOrbit { 0%{transform:rotate(0deg) translateX(120px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(120px) rotate(-360deg)} }
          @keyframes sharkOrbit2 { 0%{transform:rotate(180deg) translateX(160px) rotate(-180deg)} 100%{transform:rotate(540deg) translateX(160px) rotate(-540deg)} }
          @keyframes sharkBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes finWake { 0%{opacity:0.6;width:0} 50%{opacity:0.3;width:40px} 100%{opacity:0;width:60px} }
          @keyframes oceanWave { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
          @keyframes bubble { 0%{opacity:0.5;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-80px) scale(0.3)} }
        `}</style>

        {preloadReady && (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: 0, height: 0, marginTop: -20,
              animation: "sharkOrbit 6s linear infinite",
            }}>
              <div style={{ animation: "sharkBob 2s ease-in-out infinite" }}>
                <svg width="38" height="32" viewBox="0 0 38 32" fill="none" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}>
                  <path d="M19 0 C19 0 22 8 28 14 C22 13 16 14 12 16 C14 12 17 6 19 0Z" fill="rgba(46,139,192,0.7)" />
                  <path d="M12 16 C8 18 4 22 2 28 C4 24 10 20 18 18 C14 17 12 16 12 16Z" fill="rgba(20,83,116,0.5)" />
                  <ellipse cx="19" cy="18" rx="14" ry="2" fill="rgba(46,139,192,0.08)" />
                </svg>
              </div>
            </div>

            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: 0, height: 0, marginTop: 10,
              animation: "sharkOrbit2 9s linear infinite",
            }}>
              <div style={{ animation: "sharkBob 2.5s ease-in-out infinite", animationDelay: "0.5s" }}>
                <svg width="26" height="22" viewBox="0 0 38 32" fill="none" style={{ opacity: 0.5, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}>
                  <path d="M19 0 C19 0 22 8 28 14 C22 13 16 14 12 16 C14 12 17 6 19 0Z" fill="rgba(46,139,192,0.5)" />
                  <path d="M12 16 C8 18 4 22 2 28 C4 24 10 20 18 18 C14 17 12 16 12 16Z" fill="rgba(20,83,116,0.35)" />
                </svg>
              </div>
            </div>

            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${15 + i * 14}%`,
                bottom: `${10 + (i % 3) * 20}%`,
                width: 4 + (i % 3) * 2,
                height: 4 + (i % 3) * 2,
                borderRadius: "50%",
                background: "rgba(177,212,224,0.15)",
                animation: `bubble ${3 + i * 0.7}s ease-out ${i * 0.8}s infinite`,
              }} />
            ))}

            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
              background: "linear-gradient(to top, rgba(12,45,72,0.4) 0%, transparent 100%)",
              backgroundSize: "200% 200%",
              animation: "oceanWave 8s ease-in-out infinite",
            }} />
          </div>
        )}

        {preloadReady ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "enterFadeIn 0.6s ease-out both", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "4rem", marginBottom: 24 }}>🧪</div>
            <p style={{
              fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.3em",
              color: "rgba(46,139,192,0.6)", textTransform: "uppercase", marginBottom: 12,
            }}>
              {lang === "es" ? "LECCIONES LISTAS" : "LESSONS LOADED"}
            </p>
            <button
              onClick={() => {
                const silentAudio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
                silentAudio.volume = 0;
                silentAudio.play().catch(() => {});
                setAudioUnlocked(true);
                setLoading(false);
                setPreloadReady(false);
              }}
              style={{
                padding: "24px 56px", borderRadius: 60,
                background: "linear-gradient(135deg, #2e8bc0 0%, #145374 100%)",
                border: "2px solid rgba(177,212,224,0.4)",
                color: "#fff", fontWeight: 900, fontSize: "1.2rem",
                fontFamily: FONT, cursor: "pointer",
                letterSpacing: "0.06em",
                animation: "enterPulse 2.5s ease-in-out infinite",
                display: "flex", alignItems: "center", gap: 16,
              }}
            >
              {lang === "es" ? "ENTRAR AL LAB" : "ENTER THE LAB"} ⚡
            </button>
          </div>
        ) : (
          <SharkGame progress={preloadProgress} lang={lang} />
        )}
      </div>
    );

  const content = (
    <div
      style={{
        position: "relative",
        width: "100vw",
        maxWidth: 430,
        margin: "0 auto",
        background: "#000",
        height: "100dvh",
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes contextPulse { 0%, 100% { box-shadow: 0 0 20px rgba(46,139,192,0.15); } 50% { box-shadow: 0 0 30px rgba(46,139,192,0.35), 0 0 60px rgba(46,139,192,0.1); } }
        @keyframes vizBar { 0% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0.3); } }
        @keyframes vizGlow { 0%, 100% { box-shadow: 0 0 40px rgba(46,139,192,0.2), 0 0 80px rgba(46,139,192,0.05); } 50% { box-shadow: 0 0 60px rgba(46,139,192,0.4), 0 0 120px rgba(46,139,192,0.15); } }
        @keyframes radioTextFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes vidFade { from{opacity:0;transform:scale(1.04)} to{opacity:1;transform:scale(1)} }
        @keyframes arenaPulse {
          0%, 100% { background: radial-gradient(ellipse at center, rgba(46,139,192,0.06) 0%, #050505 60%, #020202 100%); }
          50% { background: radial-gradient(ellipse at center, rgba(46,139,192,0.12) 0%, #080808 55%, #020202 100%); }
        }
        @keyframes arenaPulseLose {
          0%, 100% { background: radial-gradient(ellipse at center, rgba(255,107,107,0.06) 0%, #050505 60%, #020202 100%); }
          50% { background: radial-gradient(ellipse at center, rgba(255,107,107,0.12) 0%, #080808 55%, #020202 100%); }
        }
        @keyframes glowPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes radioGlow {
          0%,100% { box-shadow: 0 0 6px rgba(255,68,68,0.3); opacity: 0.85; }
          50% { box-shadow: 0 0 14px rgba(255,68,68,0.6); opacity: 1; }
        }
        @keyframes blueFlash {
          0% { box-shadow: inset 0 0 0 3px rgba(46,139,192,0.9), 0 0 30px rgba(46,139,192,0.4); }
          100% { box-shadow: inset 0 0 0 0px rgba(46,139,192,0), 0 0 0px rgba(46,139,192,0); }
        }
        .ws-btn { transition: transform 0.12s cubic-bezier(0.25,0.46,0.45,0.94) !important; }
        .ws-btn:active { transform: scale(0.96) !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* GREEN FLASH HAPTIC OVERLAY */}
      {flashBlue && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          zIndex: 999, pointerEvents: "none", borderRadius: 0,
          animation: "blueFlash 0.3s ease-out forwards",
        }} />
      )}

      {/* GLOW LINE — left edge scroll progress */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: 3, height: "100%",
        zIndex: 15, pointerEvents: "none",
        background: "rgba(255,255,255,0.03)",
        display: activeTab === "lab" ? "block" : "none",
      }}>
        <div style={{
          width: "100%",
          height: `${scrollProgress}%`,
          background: "linear-gradient(180deg, #2e8bc0, #b1d4e0, #145374)",
          borderRadius: "0 0 2px 0",
          transition: "height 0.3s ease-out",
          boxShadow: scrollProgress > 0 ? "0 0 8px rgba(46,139,192,0.5), 0 0 20px rgba(46,139,192,0.2)" : "none",
          animation: scrollProgress > 0 ? "glowPulse 2s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* MINIMAL HEADER — clickable name only */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          padding: "14px 18px",
          zIndex: 10,
          background: "transparent",
          pointerEvents: "none",
          display: activeTab === "lab" ? "flex" : "none",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          onClick={() => setShowProfile(true)}
          style={{
            pointerEvents: "auto",
            cursor: "pointer",
            fontSize: "1.1rem",
            fontWeight: 800,
            fontFamily: FONT,
            color: "#fff",
            textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)",
            letterSpacing: "-0.01em",
            userSelect: "none",
          }}
        >
          {userName || (lang === "es" ? "Explorador" : "Explorer")}
        </span>
        <button
          className="ws-btn"
          onClick={() => navigateTo("vault")}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 20,
            background: "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,165,0,0.08))",
            border: "1px solid rgba(255,215,0,0.2)",
            cursor: "pointer", fontFamily: FONT, marginLeft: "auto",
          }}
        >
          <img src="/moolie-coin.png" alt="" style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#FFD700" }}>{moolies}</span>
        </button>
      </div>

      {/* MODULE MAP */}
      {showModuleMap && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(5,5,10,0.97)", zIndex: 200,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "50px 28px 30px", overflowY: "auto",
          backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
          animation: "popIn 0.35s ease-out both",
        }}>
          <button
            className="ws-btn"
            onClick={() => setShowModuleMap(false)}
            style={{
              position: "fixed", top: 20, right: 20,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%", width: 40, height: 40,
              color: "#fff", fontSize: "1.2rem", cursor: "pointer", fontFamily: FONT, zIndex: 201,
            }}
          >✕</button>

          <h2 style={{
            fontSize: "1.4rem", fontWeight: 900, marginBottom: 4,
            background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{t.moduleMap.title[lang]}</h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 600, marginBottom: 24, letterSpacing: "0.1em" }}>
            {Object.entries(moduleProgress).filter(([, v]) => v >= 3).length}/{MODULES.length} {t.moduleMap.completed[lang]}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
            {MODULES.map((mod, idx) => {
              const wins = moduleProgress[idx] || 0;
              const isComplete = wins >= mod.winsNeeded;
              const isCurrent = idx === currentModuleIdx;
              const isLocked = idx > currentModuleIdx && !isComplete;
              const pct = Math.min((wins / mod.winsNeeded) * 100, 100);

              return (
                <div key={mod.id} style={{
                  background: isCurrent
                    ? "rgba(46,139,192,0.06)"
                    : isComplete
                      ? "rgba(255,217,61,0.04)"
                      : "rgba(255,255,255,0.02)",
                  border: isCurrent
                    ? "1px solid rgba(46,139,192,0.25)"
                    : isComplete
                      ? "1px solid rgba(255,217,61,0.15)"
                      : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 18, padding: "16px 18px",
                  opacity: isLocked ? 0.4 : 1,
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Progress fill background */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, height: "100%",
                    width: `${pct}%`,
                    background: isComplete
                      ? "rgba(255,217,61,0.05)"
                      : "rgba(46,139,192,0.04)",
                    transition: "width 0.5s ease",
                  }} />

                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      background: isComplete
                        ? "rgba(255,217,61,0.12)"
                        : isCurrent
                          ? "rgba(46,139,192,0.12)"
                          : "rgba(255,255,255,0.04)",
                      border: isComplete
                        ? "1px solid rgba(255,217,61,0.3)"
                        : isCurrent
                          ? "1px solid rgba(46,139,192,0.25)"
                          : "1px solid rgba(255,255,255,0.08)",
                      display: "flex", justifyContent: "center", alignItems: "center",
                      fontSize: "1.2rem",
                    }}>
                      {isLocked ? "🔒" : isComplete ? "✅" : mod.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: "#fff", fontWeight: 800, fontSize: "0.8rem",
                        letterSpacing: "0.02em", marginBottom: 4,
                      }}>
                        {mod.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          flex: 1, height: 4, background: "rgba(255,255,255,0.06)",
                          borderRadius: 2, overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${pct}%`, height: "100%",
                            background: isComplete
                              ? "linear-gradient(90deg, #FFD93D, #FF6B6B)"
                              : "linear-gradient(90deg, #2e8bc0, #b1d4e0)",
                            borderRadius: 2, transition: "width 0.5s ease",
                          }} />
                        </div>
                        <span style={{
                          color: isComplete ? "#FFD93D" : "rgba(255,255,255,0.35)",
                          fontSize: "0.55rem", fontWeight: 700, flexShrink: 0,
                        }}>
                          {wins}/{mod.winsNeeded}
                        </span>
                      </div>
                    </div>
                    {isCurrent && !isComplete && (
                      <div style={{
                        padding: "3px 8px", borderRadius: 8,
                        background: "rgba(46,139,192,0.15)", border: "1px solid rgba(46,139,192,0.3)",
                        fontSize: "0.5rem", fontWeight: 800, color: "#2e8bc0",
                        letterSpacing: "0.08em", flexShrink: 0,
                      }}>{t.moduleMap.active[lang]}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FEED */}
      <div
        ref={feedRef}
        onScroll={handleScroll}
        style={{
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          display: activeTab === "lab" ? "block" : "none",
        }}
      >
        {currentData.lessons.map((card, i) => {
          if (card.type === "intro" || card.type === "summary") {
            const isIntro = card.type === "intro";
            return (
              <div
                key={card.id}
                ref={(el) => {
                  if (!el || bufferCardObserved.has(card.id)) return;
                  bufferCardObserved.add(card.id);
                  const observer = new IntersectionObserver(([entry]) => {
                    if (entry.isIntersecting) {
                      observer.disconnect();
                      if (!bufferCardAudioPlayed.has(card.id) && !isMutedRef.current && speechSpeedRef.current > 0) {
                        bufferCardAudioPlayed.add(card.id);
                        const cachedUrl = audioBlobCache.get(`buffercard_${card.id}`);
                        if (cachedUrl) {
                          playBlobAudio(cachedUrl, speechSpeedRef.current);
                        }
                      }
                      if (!isFetchingRef.current && currentData.lessons.length > 1) {
                        const totalSlides = currentData.lessons.length;
                        const triggerIdx = totalSlides - 3;
                        if (i >= triggerIdx || isIntro) {
                          isFetchingRef.current = true;
                          setIsFetchingMore(true);
                          const currentLang = langRef.current;
                          const nextTypes = getRequestedTypes(totalSlides, 4);
                          generateCards(ageGroup, selectedSubjectRef.current || currentModule?.topic, currentLang, loadStr("country", ""), 4, { requestedTypes: nextTypes }).then(async (newData) => {
                            if (newData?.lessons) {
                              let nl = newData.lessons.map((l: any) => ({ ...l, id: Math.random().toString(36).substr(2, 9) }));
                              nl = await resolveVideoUrls(nl);
                              await preloadAudioForCards(nl, currentLang);
                              setCurrentData((p: any) => {
                                const updated = { ...p, lessons: [...p.lessons, ...nl] };
                                if (!p.bossQuiz?.actionQuestion && newData.bossQuiz?.actionQuestion && Array.isArray(newData.bossQuiz?.options) && newData.bossQuiz.options.length >= 2) {
                                  updated.bossQuiz = newData.bossQuiz;
                                }
                                return updated;
                              });
                            }
                          }).catch((err) => {
                            console.error("Observer feed extension failed:", err);
                          }).finally(() => {
                            setIsFetchingMore(false);
                            isFetchingRef.current = false;
                          });
                        }
                      }
                    }
                  }, { threshold: 0.5 });
                  observer.observe(el);
                }}
                style={{
                  height: "100dvh", width: "100%", position: "relative",
                  scrollSnapAlign: "start", scrollSnapStop: "always",
                  background: isIntro
                    ? "linear-gradient(160deg, #0c2d48 0%, #145374 40%, #2e8bc0 100%)"
                    : "linear-gradient(160deg, #145374 0%, #0c2d48 50%, #020a14 100%)",
                  display: "flex", flexDirection: "column",
                  justifyContent: "center", alignItems: "center",
                  padding: 32, overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
                }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} style={{
                      position: "absolute",
                      width: 120 + j * 40, height: 120 + j * 40,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, rgba(177,212,224,${0.04 + j * 0.02}) 0%, transparent 70%)`,
                      left: `${10 + j * 20}%`, top: `${20 + j * 15}%`,
                      filter: "blur(40px)",
                    }} />
                  ))}
                </div>
                <div style={{
                  position: "relative", zIndex: 1, textAlign: "center",
                  animation: "enterFadeIn 0.8s ease-out both", maxWidth: 340,
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: 20 }}>
                    {isIntro ? "🧪" : "🏆"}
                  </div>
                  <p style={{
                    fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.25em",
                    color: "rgba(177,212,224,0.5)", textTransform: "uppercase", marginBottom: 16,
                  }}>
                    {isIntro
                      ? (lang === "es" ? "TU SESIÓN DE HOY" : "TODAY'S SESSION")
                      : (lang === "es" ? "SESIÓN COMPLETADA" : "SESSION COMPLETE")}
                  </p>

                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 14,
                    background: "rgba(46,139,192,0.12)", border: "1px solid rgba(46,139,192,0.2)",
                    marginBottom: 16,
                  }}>
                    <span style={{ fontSize: "0.7rem" }}>🎙️</span>
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 700, color: "rgba(177,212,224,0.6)",
                      letterSpacing: "0.06em",
                    }}>
                      {lang === "es" ? "Mensaje de voz" : "Voice message"}
                    </span>
                  </div>
                  <p style={{
                    color: "#fff", fontSize: "1.2rem", fontWeight: 800,
                    lineHeight: 1.4, letterSpacing: "-0.02em",
                    textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                  }}>
                    "{card.desc}"
                  </p>
                  {selectedSubject && (
                    <div style={{
                      marginTop: 24, display: "inline-flex", alignItems: "center",
                      gap: 6, padding: "6px 14px", borderRadius: 20,
                      background: "rgba(177,212,224,0.1)", border: "1px solid rgba(177,212,224,0.2)",
                    }}>
                      <span style={{
                        fontSize: "0.6rem", fontWeight: 700, color: "rgba(177,212,224,0.6)",
                        letterSpacing: "0.06em",
                      }}>
                        {selectedSubject}
                      </span>
                    </div>
                  )}
                  <p style={{
                    marginTop: 28, fontSize: "0.6rem", fontWeight: 600,
                    color: "rgba(177,212,224,0.3)", letterSpacing: "0.04em",
                  }}>
                    {lang === "es" ? "Desliza para continuar ↓" : "Swipe to continue ↓"}
                  </p>
                </div>
              </div>
            );
          }

          if (card.type === "podcast" || card.type === "podcast_clip") {
            return (
              <PodcastClipSlide
                key={card.id}
                card={card}
                videoSrc={getVideoForCard(card.id, card)}
                bgGradient={bgGradients[i % bgGradients.length]}
                lang={lang}
                isMutedRef={isMutedRef}
                speechSpeedRef={speechSpeedRef}
                isActive={activeSlideIndex === i}
                onTooltip={setTooltipText}
              />
            );
          }

          if (card.type === "concept" || card.type === "concept_breakdown") {
            return (
              <ConceptCard
                key={card.id}
                card={card}
                lang={lang}
                onTooltip={setTooltipText}
              />
            );
          }

          const answered = slideAnswers[card.id];
          const isCorrect = answered !== undefined && answered === card.miniGame?.correctIndex;

          return (
            <div
              key={card.id}
              style={{
                height: "100dvh",
                width: "100%",
                position: "relative",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                background: "#000",
                overflow: "hidden",
              }}
            >
              <video
                key={`v-${card.id}`}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0,
                  animation: "vidFade 0.8s ease-out both",
                }}
              >
                <source src={getVideoForCard(card.id, card)} type="video/mp4" />
              </video>

              <div
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  display: "flex", flexDirection: "column",
                  justifyContent: "flex-end",
                  zIndex: 1,
                  animation: "fadeIn 0.5s ease-out both",
                }}
              >
              <div style={{
                maxHeight: "45vh",
                background: "linear-gradient(to top, rgba(0,20,40,0.95) 0%, rgba(0,20,40,0.8) 60%, transparent 100%)",
                padding: "50px 28px 80px",
                display: "flex", flexDirection: "column",
                alignItems: "flex-start",
                overflowY: "auto", scrollbarWidth: "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <h1
                    style={{
                      color: "#fff",
                      fontSize: "clamp(1.6rem, 6.3vw, 2.34rem)",
                      fontWeight: 900,
                      margin: 0,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                      textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.5)",
                      textAlign: "left",
                    }}
                  >
                    {card.title}
                  </h1>
                  {card.tooltip_explanation && (
                    <button
                      className="ws-btn"
                      onClick={() => setTooltipText(card.tooltip_explanation)}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(177,212,224,0.4)",
                        background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
                        color: "#b1d4e0", fontSize: "0.8rem", fontWeight: 800,
                        cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >?</button>
                  )}
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    marginBottom: 18,
                    fontSize: "clamp(0.77rem, 3.15vw, 0.95rem)",
                    lineHeight: 1.45,
                    fontWeight: 700,
                    textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                    textAlign: "left",
                    letterSpacing: "0.01em",
                    maxWidth: 340,
                  }}
                >
                  {card.desc}
                </p>
                <div
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    padding: 22,
                    borderRadius: 24,
                    backdropFilter: "blur(30px)",
                    WebkitBackdropFilter: "blur(30px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                    width: "100%",
                    maxWidth: 400,
                  }}
                >
                  {!revealedSlides[card.id] ? (
                    <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease-out" }}>
                      <div style={{
                        color: "rgba(46,139,192,0.5)", fontSize: "0.55rem", fontWeight: 800,
                        letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14,
                      }}>{t.slide.part1[lang]}</div>
                      <p style={{
                        color: "#fff", fontSize: "clamp(0.85rem, 3.4vw, 1.02rem)", fontWeight: 800,
                        lineHeight: 1.4, marginBottom: 24,
                        textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                        textAlign: "left",
                      }}>
                        {card.miniGame?.contextSetup || card.miniGame?.question}
                      </p>
                      <button
                        className="ws-btn"
                        onClick={() => setRevealedSlides(p => ({ ...p, [card.id]: true }))}
                        style={{
                          padding: "8px 20px", borderRadius: 10,
                          background: "rgba(46,139,192,0.15)",
                          border: "none",
                          color: "rgba(177,212,224,0.7)", fontWeight: 700, fontSize: "0.72rem",
                          cursor: "pointer", fontFamily: FONT,
                          letterSpacing: "0.04em",
                          animation: "contextPulse 2s ease-in-out infinite",
                        }}
                      >
                        {t.slide.tapToContinue[lang]}
                      </button>
                    </div>
                  ) : (
                    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
                      <div style={{
                        color: "rgba(46,139,192,0.5)", fontSize: "0.55rem", fontWeight: 800,
                        letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10,
                      }}>{t.slide.part2[lang]}</div>
                      <p
                        style={{
                          color: "#fff",
                          fontSize: "clamp(0.81rem, 3.23vw, 0.98rem)",
                          fontWeight: 800,
                          marginBottom: 16,
                          lineHeight: 1.35,
                          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                          textAlign: "left",
                        }}
                      >
                        {card.miniGame?.actionQuestion || card.miniGame?.question}
                      </p>
                      <div
                        style={{ display: "flex", flexDirection: "column", gap: 10 }}
                      >
                        {(card.miniGame?.options || []).map((opt, idx) => {
                          const isAnswered = answered !== undefined;
                          const isSelected = answered === idx;
                          const isRight = idx === (card.miniGame?.correctIndex ?? -1);

                          let bg = "rgba(255,255,255,0.07)";
                          let border = "1px solid rgba(255,255,255,0.08)";
                          if (isAnswered && isSelected) {
                            if (isRight) { bg = "rgba(46,139,192,0.2)"; border = "1px solid rgba(46,139,192,0.5)"; }
                            else { bg = "rgba(231,111,81,0.2)"; border = "1px solid rgba(231,111,81,0.5)"; }
                          } else if (isAnswered && isRight) {
                            bg = "rgba(46,139,192,0.08)"; border = "1px solid rgba(46,139,192,0.2)";
                          }

                          return (
                            <button
                              className="ws-btn"
                              key={idx}
                              onClick={() => {
                                if (slideAnswers[card.id] === undefined) {
                                  setSlideAnswers((p) => ({ ...p, [card.id]: idx }));
                                  if (idx === (card.miniGame?.correctIndex ?? -1)) {
                                    setCompletedSlides((p) => [...p, card.id]);
                                    setXp((p) => p + 10);
                                    triggerGreenFlash();
                                    if (completedSlides.length + 1 >= 5) {
                                      const bq = currentData?.bossQuiz;
                                      if (bq?.actionQuestion && Array.isArray(bq.options) && bq.options.length >= 2) {
                                        setTimeout(() => setQuizUnlocked(true), 800);
                                      }
                                    }
                                  }
                                }
                              }}
                              style={{
                                width: "100%",
                                padding: 16,
                                borderRadius: 16,
                                border,
                                background: bg,
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "0.88rem",
                                cursor: isAnswered ? "default" : "pointer",
                                fontFamily: FONT,
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                                textAlign: "center",
                              }}
                            >
                              {opt}
                              {isAnswered && isSelected && (
                                <span style={{ marginLeft: 8 }}>{isRight ? "✅" : "❌"}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {answered !== undefined && isCorrect && (
                        <div style={{
                          marginTop: 12, fontSize: "0.68rem", fontWeight: 700,
                          color: "#2e8bc0",
                          letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center",
                        }}>
                          {t.feed.wellPlayed[lang]}
                        </div>
                      )}
                      {answered !== undefined && !isCorrect && (
                        <div style={{
                          marginTop: 14,
                          background: "linear-gradient(135deg, rgba(46,139,192,0.08), rgba(177,212,224,0.06))",
                          border: "1px solid rgba(46,139,192,0.2)",
                          borderRadius: 16,
                          padding: "14px 16px",
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                          animation: "fadeIn 0.4s ease-out",
                        }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                          }}>
                            <span style={{ fontSize: "1.1rem" }}>🧠</span>
                            <span style={{
                              color: "#2e8bc0", fontWeight: 800, fontSize: "0.65rem",
                              letterSpacing: "0.1em", textTransform: "uppercase",
                            }}>{t.feed.insightUnlocked[lang]}</span>
                          </div>
                          {!revealedExplanations[card.id] ? (
                            <button
                              className="ws-btn"
                              onClick={() => setRevealedExplanations(p => ({ ...p, [card.id]: true }))}
                              style={{
                                width: "100%", padding: "10px 16px", borderRadius: 12,
                                background: "rgba(46,139,192,0.12)", border: "1px solid rgba(46,139,192,0.25)",
                                color: "#2e8bc0", fontWeight: 700, fontSize: "0.78rem",
                                cursor: "pointer", fontFamily: FONT,
                              }}
                            >
                              {t.feed.tapToUnderstand[lang]}
                            </button>
                          ) : (
                            <div>
                              <p style={{
                                color: "rgba(255,255,255,0.85)", fontSize: "0.82rem",
                                lineHeight: 1.55, fontWeight: 500, margin: "0 0 10px 0",
                              }}>
                                {card.miniGame?.explanation || t.quiz.defaultExplanation[lang]}
                              </p>
                              <button
                                className="ws-btn"
                                onClick={() => speakExplanation(card.miniGame?.explanation || t.quiz.defaultExplanation[lang])}
                                style={{
                                  padding: "6px 14px", borderRadius: 10,
                                  background: "rgba(46,139,192,0.1)", border: "1px solid rgba(46,139,192,0.2)",
                                  color: "#2e8bc0", fontWeight: 700, fontSize: "0.68rem",
                                  cursor: "pointer", fontFamily: FONT,
                                  display: "flex", alignItems: "center", gap: 6,
                                }}
                              >
                                <span style={{ fontSize: "0.8rem" }}>▶</span> {t.feed.listen[lang]}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
          );
        })}
        {/* loading toast is rendered as fixed overlay below */}
      </div>

      {isFetchingMore && activeSlideIndex >= 3 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 400, pointerEvents: "none",
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: "6px 0",
          background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              border: "1.5px solid rgba(46,139,192,0.3)",
              borderTopColor: "#2e8bc0",
              animation: "ldSpin 0.8s linear infinite",
            }} />
            <span style={{
              color: "rgba(177,212,224,0.45)", fontSize: "0.5rem",
              fontWeight: 600, letterSpacing: "0.06em", fontFamily: FONT,
            }}>
              {lang === "es" ? "Preparando más..." : "Loading more..."}
            </span>
          </div>
        </div>
      )}

      {tooltipText && (
        <div
          onClick={() => setTooltipText(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            animation: "fadeIn 0.2s ease-out both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 420,
              background: "linear-gradient(135deg, rgba(12,45,72,0.98), rgba(20,83,116,0.95))",
              borderRadius: "24px 24px 0 0",
              padding: "28px 28px 40px",
              border: "1px solid rgba(177,212,224,0.15)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
              animation: "popIn 0.3s ease-out both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(46,139,192,0.2)", border: "1.5px solid rgba(46,139,192,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#2e8bc0", fontSize: "0.85rem", fontWeight: 800,
                }}>?</span>
                <span style={{
                  fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.2em",
                  color: "rgba(177,212,224,0.6)", textTransform: "uppercase",
                }}>{lang === "es" ? "QUÉ SIGNIFICA" : "WHAT THIS MEANS"}</span>
              </div>
              <button
                className="ws-btn"
                onClick={() => setTooltipText(null)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "1rem", cursor: "pointer", fontFamily: FONT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
            <p style={{
              color: "#fff", fontSize: "clamp(1rem, 4vw, 1.15rem)",
              fontWeight: 700, lineHeight: 1.5, margin: 0, fontFamily: FONT,
            }}>
              {tooltipText}
            </p>
          </div>
        </div>
      )}

      {/* THE DASHBOARD */}
      {showProfile && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(5,5,10,0.96)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 30px 30px",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            animation: "popIn 0.35s ease-out both",
            overflowY: "auto",
          }}
        >
          <button
            className="ws-btn"
            onClick={() => setShowProfile(false)}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              color: "#fff",
              fontSize: "1.2rem",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            ✕
          </button>

          <button
            className="ws-btn"
            onClick={() => {
              setShowProfile(false);
              stopElevenLabsAudio();
              navigateTo("hub");
            }}
            style={{
              width: "100%",
              maxWidth: 300,
              padding: "14px 20px",
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(46,139,192,0.1), rgba(20,83,116,0.08))",
              border: "1px solid rgba(46,139,192,0.2)",
              cursor: "pointer",
              fontFamily: FONT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 24,
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🏠</span>
            <span style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#b1d4e0",
              textTransform: "uppercase",
            }}>
              {lang === "es" ? "Volver al Hub" : "Back to Hub"}
            </span>
          </button>

          {/* Progress Ring */}
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: 20 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#profGrad)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray="314"
                strokeDashoffset={314 - (314 * Math.min((xp % (level * 50)) / (level * 50) * 100, 100) / 100)}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
              <defs>
                <linearGradient id="profGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2e8bc0" />
                  <stop offset="100%" stopColor="#b1d4e0" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fff" }}>{level}</div>
              <div style={{ fontSize: "0.45rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>{t.profile.level[lang]}</div>
            </div>
          </div>

          <h2 style={{
            color: "#fff", fontSize: "1.6rem", fontWeight: 900,
            background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 6px 0",
          }}>
            {userName ? userName.toUpperCase() : t.profile.yourProfile[lang]}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: 600, margin: "0 0 30px 0" }}>
            {xp} / {level * 50} {t.profile.xpToNext[lang]}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              width: "100%",
              maxWidth: 300,
            }}
          >
            {[
              { label: t.profile.totalXp[lang], val: xp, color: "#2e8bc0" },
              { label: t.profile.moolies[lang], val: moolies, color: "#FFD700" },
              { label: t.profile.bossWins[lang], val: bossWins, color: "#FFD93D" },
              { label: t.profile.streak[lang], val: `${streak}🔥`, color: "#FF6B6B" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.03)",
                padding: "20px 14px",
                borderRadius: 20,
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ color: s.color, fontSize: "1.6rem", fontWeight: 900, textShadow: `0 0 15px ${s.color}30` }}>{s.val}</div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", gap: 8, width: "100%", maxWidth: 300, marginTop: 20,
          }}>
            <button
              className="ws-btn"
              onClick={() => { setShowProfile(false); navigateTo("vault"); }}
              style={{
                flex: 1, padding: "14px 12px",
                borderRadius: 18, border: "1px solid rgba(255,215,0,0.25)",
                background: activeTab === "vault"
                  ? "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.1))"
                  : "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.05))",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "pointer", fontFamily: FONT, transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>🏦</span>
              <span style={{
                fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.08em",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                VAULT
              </span>
            </button>
            <button
              className="ws-btn"
              onClick={() => { setShowProfile(false); navigateTo("tank"); }}
              style={{
                flex: 1, padding: "14px 12px",
                borderRadius: 18, border: "1px solid rgba(46,139,192,0.25)",
                background: activeTab === "tank"
                  ? "linear-gradient(135deg, rgba(46,139,192,0.15), rgba(20,83,116,0.1))"
                  : "linear-gradient(135deg, rgba(46,139,192,0.08), rgba(20,83,116,0.05))",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "pointer", fontFamily: FONT, transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>🦈</span>
              <span style={{
                fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.08em",
                background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                TANK
              </span>
            </button>
          </div>

          {/* Settings Controls */}
          <div style={{
            width: "100%", maxWidth: 300, marginTop: 24,
            padding: "18px", borderRadius: 18,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{
              color: "rgba(255,255,255,0.2)", fontSize: "0.5rem", fontWeight: 700,
              letterSpacing: "0.12em", textAlign: "center",
            }}>{lang === "es" ? "AJUSTES" : "SETTINGS"}</div>

            {/* Volume Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 600, fontFamily: FONT }}>
                {lang === "es" ? "Sonido" : "Sound"}
              </span>
              <button
                className="ws-btn"
                onClick={() => {
                  const newMuted = !isMuted;
                  isMutedRef.current = newMuted;
                  if (newMuted) stopElevenLabsAudio();
                  setIsMuted(newMuted);
                }}
                style={{
                  padding: "8px 16px", borderRadius: 12, fontFamily: FONT,
                  background: isMuted ? "rgba(231,111,81,0.12)" : "rgba(46,139,192,0.12)",
                  border: isMuted ? "1px solid rgba(231,111,81,0.3)" : "1px solid rgba(46,139,192,0.3)",
                  color: isMuted ? "#e76f51" : "#2e8bc0",
                  fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                  minWidth: 60, textAlign: "center",
                }}
              >
                {isMuted ? (lang === "es" ? "🔇 Off" : "🔇 Off") : (lang === "es" ? "🔊 On" : "🔊 On")}
              </button>
            </div>

            {/* Playback Speed */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 600, fontFamily: FONT }}>
                {lang === "es" ? "Velocidad" : "Speed"}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 1.5, 2].map((spd) => (
                  <button
                    className="ws-btn"
                    key={spd}
                    onClick={() => {
                      stopElevenLabsAudio();
                      speechSpeedRef.current = spd;
                      setSpeechSpeed(spd);
                    }}
                    style={{
                      padding: "8px 12px", borderRadius: 10, fontFamily: FONT,
                      background: speechSpeed === spd ? "rgba(46,139,192,0.12)" : "rgba(255,255,255,0.02)",
                      border: speechSpeed === spd ? "1px solid rgba(46,139,192,0.3)" : "1px solid rgba(255,255,255,0.05)",
                      color: speechSpeed === spd ? "#2e8bc0" : "rgba(255,255,255,0.5)",
                      fontWeight: 700, fontSize: "0.7rem", cursor: "pointer",
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 600, fontFamily: FONT }}>
                {lang === "es" ? "Idioma" : "Language"}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {([["en", "🇺🇸", "EN"], ["es", "🇲🇽", "ES"]] as const).map(([code, flag, label]) => (
                  <button
                    className="ws-btn"
                    key={code}
                    onClick={() => {
                      if (code !== lang) {
                        setLang(code);
                        langRef.current = code;
                        saveStr("lang", code);
                        setShowProfile(false);
                        resetJourney();
                      }
                    }}
                    style={{
                      padding: "8px 14px", borderRadius: 10, fontFamily: FONT,
                      background: lang === code ? "rgba(46,139,192,0.12)" : "rgba(255,255,255,0.02)",
                      border: lang === code ? "1px solid rgba(46,139,192,0.3)" : "1px solid rgba(255,255,255,0.05)",
                      color: lang === code ? "#2e8bc0" : "rgba(255,255,255,0.5)",
                      fontWeight: 700, fontSize: "0.7rem", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    <span style={{ fontSize: "0.85rem" }}>{flag}</span> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Module Switcher (Testing) */}
          <div style={{
            width: "100%", maxWidth: 300, marginTop: 12,
            padding: "16px 18px", borderRadius: 18,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              color: "rgba(255,255,255,0.2)", fontSize: "0.5rem", fontWeight: 700,
              letterSpacing: "0.12em", marginBottom: 10, textAlign: "center",
            }}>{t.profile.switchModule[lang]}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MODULES.map((mod, idx) => (
                <button
                  className="ws-btn"
                  key={mod.id}
                  onClick={() => {
                    setCurrentModuleIdx(idx);
                    setShowProfile(false);
                    resetJourney();
                  }}
                  style={{
                    padding: "10px 14px", borderRadius: 12, fontFamily: FONT,
                    background: idx === currentModuleIdx ? "rgba(46,139,192,0.1)" : "rgba(255,255,255,0.02)",
                    border: idx === currentModuleIdx ? "1px solid rgba(46,139,192,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    color: idx === currentModuleIdx ? "#2e8bc0" : "rgba(255,255,255,0.5)",
                    fontWeight: 700, fontSize: "0.7rem", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span>{mod.icon}</span>
                  <span>{mod.name}</span>
                  {idx === currentModuleIdx && (
                    <span style={{ marginLeft: "auto", fontSize: "0.5rem", fontWeight: 800, color: "#2e8bc0" }}>{t.moduleMap.active[lang]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showParentDash && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 250 }}>
          {parentDashContent}
        </div>
      )}

      {activeTab === "vault" && (
        <TheVault
          lang={lang}
          moolies={moolies}
          unlockedItems={unlockedItems}
          equippedItems={equippedItems}
          onPurchase={(itemId, cost) => {
            setMoolies((p) => p - cost);
            setUnlockedItems((prev) => [...prev, itemId]);
            setEquippedItems((prev) => [...prev, itemId]);
          }}
          onEquip={(itemId) => {
            setEquippedItems((prev) =>
              prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
            );
          }}
          onClose={() => navigateTo("hub")}
        />
      )}

      {activeTab === "tank" && (
        <Sandbox
          lang={lang}
          moolies={moolies}
          onSpend={(amount) => setMoolies((p) => Math.round((p - amount) * 100) / 100)}
          onEarn={(amount) => setMoolies((p) => Math.round((p + amount) * 100) / 100)}
          onClose={() => navigateTo("hub")}
        />
      )}

      {activeTab === "hub" && appStarted && !showLanding && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          zIndex: 50,
        }}>
          <Hub
            lang={lang}
            userName={userName}
            moolies={moolies}
            onNavigate={(view) => {
              if (view === "lab") {
                if (!currentData) {
                  setShowSubjectPicker(true);
                  return;
                }
              }
              navigateTo(view);
            }}
          />
        </div>
      )}

      {/* ARENA QUIZ */}
      {quizUnlocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#0c2d48",
            zIndex: 100,
          }}
        >
        <div
          style={{
            width: "100%",
            height: "100%",
            animation: quizResult === null
              ? "arenaPulse 2s ease-in-out infinite"
              : quizResult === false
                ? "arenaPulseLose 1.5s ease-in-out infinite"
                : undefined,
            background: quizResult === true
              ? "radial-gradient(ellipse at center, rgba(46,139,192,0.15) 0%, #0c2d48 50%, #091e30 100%)"
              : quizResult === false
                ? "radial-gradient(ellipse at center, rgba(255,107,107,0.06) 0%, #0c2d48 50%, #091e30 100%)"
                : "radial-gradient(ellipse at center, rgba(46,139,192,0.08) 0%, #0c2d48 60%, #091e30 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
            textAlign: "center",
          }}
        >
          {quizResult === null ? (
            <div style={{ animation: "fadeIn 0.5s ease-out" }}>
              <h1 style={{ fontSize: "5rem", marginBottom: 10, filter: "drop-shadow(0 0 30px rgba(46,139,192,0.4))" }}>👑</h1>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "2.6rem",
                  fontWeight: 900,
                  marginBottom: 6,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #b1d4e0, #2e8bc0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.quiz.bossFight[lang]}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", marginBottom: 6 }}>
                {t.quiz.demonstrateMastery[lang]}
              </p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.06em", marginBottom: 36 }}>
                {currentModule?.icon} {currentModule?.name?.toUpperCase()} &middot; {t.quiz.win[lang]} {currentModuleWins + 1}/{currentModule?.winsNeeded || 10}
              </p>
              {!quizStarted ? (
                <button
                  className="ws-btn"
                  onClick={() => setQuizStarted(true)}
                  style={{
                    padding: "20px 60px",
                    borderRadius: 20,
                    border: "none",
                    background: "linear-gradient(135deg, #2e8bc0, #145374)",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: "#fff",
                    boxShadow: "0 0 40px rgba(46,139,192,0.3), 0 8px 24px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                    fontFamily: FONT,
                    letterSpacing: "0.06em",
                  }}
                >
                  {t.quiz.beginChallenge[lang]}
                </button>
              ) : bossExplanation ? (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(46,139,192,0.06), rgba(177,212,224,0.04))",
                    padding: 30,
                    borderRadius: 28,
                    border: "1px solid rgba(46,139,192,0.2)",
                    width: "100%",
                    maxWidth: 380,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(46,139,192,0.08)",
                    animation: "popIn 0.5s ease-out",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: 12, filter: "drop-shadow(0 0 20px rgba(46,139,192,0.4))" }}>🧠</div>
                  <h3 style={{
                    color: "#2e8bc0", fontSize: "1.3rem", fontWeight: 900,
                    letterSpacing: "0.04em", marginBottom: 6,
                  }}>{t.quiz.holdUp[lang]}</h3>
                  <p style={{
                    color: "rgba(46,139,192,0.6)", fontSize: "0.68rem", fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20,
                  }}>{t.quiz.letsBreakDown[lang]}</p>
                  <p style={{
                    color: "rgba(255,255,255,0.85)", fontSize: "0.92rem",
                    lineHeight: 1.65, fontWeight: 500, margin: "0 0 20px 0",
                    textAlign: "left",
                  }}>
                    {bossExplanation}
                  </p>
                  <button
                    className="ws-btn"
                    onClick={() => speakExplanation(bossExplanation)}
                    style={{
                      padding: "8px 18px", borderRadius: 12, marginBottom: 20,
                      background: "rgba(46,139,192,0.1)", border: "1px solid rgba(46,139,192,0.25)",
                      color: "#2e8bc0", fontWeight: 700, fontSize: "0.75rem",
                      cursor: "pointer", fontFamily: FONT,
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <span>▶</span> {t.quiz.listenExplanation[lang]}
                  </button>
                  <button
                    className="ws-btn"
                    onClick={() => {
                      setBossExplanation(null);
                      setQuizStarted(false);
                      setQuizUnlocked(false);
                      setCompletedSlides((prev) => {
                        const removed = prev[prev.length - 1];
                        if (removed) setSlideAnswers((sa) => { const n = { ...sa }; delete n[removed]; return n; });
                        return prev.slice(0, -1);
                      });
                    }}
                    style={{
                      width: "100%", padding: 18, borderRadius: 18, border: "none",
                      background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
                      fontWeight: 900, color: "#000", fontSize: "1rem", fontFamily: FONT,
                      letterSpacing: "0.04em", cursor: "pointer",
                      boxShadow: "0 0 30px rgba(46,139,192,0.25), 0 6px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    {t.quiz.gotIt[lang]}
                  </button>
                </div>
              ) : !currentData.bossQuiz?.actionQuestion || !Array.isArray(currentData.bossQuiz?.options) || currentData.bossQuiz.options.length < 2 ? (
                <div style={{ textAlign: "center", padding: "30px 20px" }}>
                  <div style={{
                    width: 28, height: 28, margin: "0 auto 14px", borderRadius: "50%",
                    border: "2px solid rgba(46,139,192,0.2)", borderTopColor: "#2e8bc0",
                    animation: "ldSpin 0.7s linear infinite",
                  }} />
                  <p style={{ color: "rgba(177,212,224,0.4)", fontSize: "0.7rem", fontWeight: 700 }}>
                    {t.quiz.bossFight[lang]}...
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    padding: 26,
                    borderRadius: 28,
                    border: "1px solid rgba(255,255,255,0.08)",
                    width: "100%",
                    maxWidth: 360,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {currentData.bossQuiz?.contextSetup && (
                    <p style={{
                      color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", fontWeight: 600,
                      lineHeight: 1.5, marginBottom: 14, textAlign: "left",
                    }}>
                      {currentData.bossQuiz.contextSetup}
                    </p>
                  )}
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      marginBottom: 20,
                      lineHeight: 1.35,
                      letterSpacing: "-0.02em",
                      textAlign: "left",
                    }}
                  >
                    {currentData.bossQuiz.actionQuestion}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {(currentData.bossQuiz?.options || []).map((opt, i) => {
                      const colors = ["#FF6B6B", "#FFD93D", "#b1d4e0"];
                      return (
                        <button
                          className="ws-btn"
                          key={i}
                          onClick={() => {
                            const win = i === (currentData.bossQuiz?.correctIndex ?? -1);
                            if (win) {
                              setQuizResult(true);
                              setXp((p) => p + 50);
                              setMoolies((p) => p + 50);
                              setStreak((p) => p + 1);
                              setBossWins((p) => p + 1);
                              setModuleProgress((prev) => {
                                const newProg = { ...prev };
                                const curWins = (newProg[currentModuleIdx] || 0) + 1;
                                newProg[currentModuleIdx] = curWins;
                                if (curWins >= (currentModule?.winsNeeded || 10)) {
                                  setTimeout(() => {
                                    if (currentModuleIdx < MODULES.length - 1) {
                                      setCurrentModuleIdx((p) => p + 1);
                                    }
                                  }, 2000);
                                }
                                return newProg;
                              });
                            } else {
                              setStreak(0);
                              setBossExplanation(currentData.bossQuiz?.explanation || t.quiz.defaultBossExplanation[lang]);
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: 18,
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.9)",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: FONT,
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span style={{
                            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                            background: `${colors[i % 3]}12`,
                            border: `1px solid ${colors[i % 3]}30`,
                            display: "flex", justifyContent: "center", alignItems: "center",
                            fontSize: "0.65rem", fontWeight: 900, color: colors[i % 3],
                          }}>{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : showQuizSummary && quizResult ? (
            <div style={{
              animation: "fadeIn 0.8s ease-out both",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", textAlign: "center", padding: 32, maxWidth: 380,
            }}>
              <style>{`
                @keyframes moolieBounce {
                  0%, 100% { transform: translateY(0) scale(1); }
                  30% { transform: translateY(-18px) scale(1.1); }
                  50% { transform: translateY(-6px) scale(1.05); }
                  70% { transform: translateY(-10px) scale(1.08); }
                }
                @keyframes moolieGlow {
                  0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.3), 0 0 40px rgba(255,165,0,0.15); }
                  50% { box-shadow: 0 0 35px rgba(255,215,0,0.5), 0 0 60px rgba(255,165,0,0.25); }
                }
                @keyframes moolieTextPop {
                  0% { opacity: 0; transform: scale(0.5) translateY(10px); }
                  60% { opacity: 1; transform: scale(1.15) translateY(-2px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
              `}</style>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12,
                animation: "moolieBounce 1.2s ease-out, moolieGlow 2s ease-in-out infinite",
              }}>
                <img src="/moolie-coin.png" alt="Moolies" style={{ width: 72, height: 72, objectFit: "contain" }} />
              </div>
              <p style={{
                fontSize: "1rem", fontWeight: 900, letterSpacing: "0.04em",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                margin: "0 0 6px 0",
                animation: "moolieTextPop 0.8s ease-out 0.3s both",
              }}>
                {t.quiz.mooliesEarned[lang]}
              </p>
              <p style={{
                fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.25em",
                color: "rgba(177,212,224,0.5)", textTransform: "uppercase", marginBottom: 16,
              }}>
                {lang === "es" ? "SESIÓN COMPLETADA" : "SESSION COMPLETE"}
              </p>
              {quizSummaryText ? (
                <>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 14,
                    background: "rgba(46,139,192,0.12)", border: "1px solid rgba(46,139,192,0.2)",
                    marginBottom: 16,
                  }}>
                    <span style={{ fontSize: "0.7rem" }}>🎙️</span>
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 700, color: "rgba(177,212,224,0.6)",
                      letterSpacing: "0.06em",
                    }}>
                      {lang === "es" ? "Mensaje de voz" : "Voice message"}
                    </span>
                  </div>
                  <p style={{
                    color: "#fff", fontSize: "1.15rem", fontWeight: 800,
                    lineHeight: 1.4, letterSpacing: "-0.02em",
                    textShadow: "0 2px 12px rgba(0,0,0,0.5)", marginBottom: 32,
                  }}>
                    "{quizSummaryText}"
                  </p>
                </>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 32,
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(46,139,192,0.25)",
                    borderTopColor: "#2e8bc0",
                    animation: "ldSpin 0.8s linear infinite",
                  }} />
                  <span style={{ color: "rgba(177,212,224,0.4)", fontSize: "0.65rem", fontWeight: 700 }}>
                    {lang === "es" ? "Preparando resumen..." : "Preparing summary..."}
                  </span>
                </div>
              )}
              {selectedSubject && (
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  gap: 6, padding: "6px 14px", borderRadius: 20,
                  background: "rgba(177,212,224,0.1)", border: "1px solid rgba(177,212,224,0.2)",
                  marginBottom: 28,
                }}>
                  <span style={{
                    fontSize: "0.6rem", fontWeight: 700, color: "rgba(177,212,224,0.6)",
                    letterSpacing: "0.06em",
                  }}>
                    {selectedSubject}
                  </span>
                </div>
              )}
              <button
                className="ws-btn"
                onClick={() => {
                  stopElevenLabsAudio();
                  setShowQuizSummary(false);
                  setCountdown(10);
                  const ct = setInterval(() => setCountdown((p) => {
                    if (p <= 1) { clearInterval(ct); return 0; }
                    return p - 1;
                  }), 1000);
                }}
                style={{
                  padding: "16px 48px", borderRadius: 18, border: "none",
                  background: quizSummaryText
                    ? "linear-gradient(135deg, #2e8bc0, #145374)"
                    : "rgba(46,139,192,0.25)",
                  fontWeight: 900, fontSize: "0.95rem", color: "#fff",
                  fontFamily: FONT, letterSpacing: "0.04em", cursor: "pointer",
                  boxShadow: quizSummaryText
                    ? "0 0 30px rgba(46,139,192,0.25), 0 6px 20px rgba(0,0,0,0.4)"
                    : "none",
                  transition: "all 0.4s ease",
                }}
              >
                {quizSummaryText
                  ? (lang === "es" ? "Continuar →" : "Continue →")
                  : (lang === "es" ? "Saltar →" : "Skip →")}
              </button>
            </div>
          ) : (() => {
            const loseTitles = t.loseTitles[lang];
            const pick = quizResult && quizResultPick
              ? quizResultPick
              : loseTitles[Math.floor(Math.random() * loseTitles.length)];
            const shareText = quizResult
              ? translations.share.winText[lang](currentModule?.name || "", level, xp, bossWins, pick.emoji)
              : translations.share.loseText[lang](currentModule?.name || "", level, xp);
            const shareUrl = "https://moolab.app";
            const encodedText = encodeURIComponent(shareText);
            const encodedUrl = encodeURIComponent(shareUrl);
            return (
            <div style={{ animation: "popIn 0.5s ease-out" }}>
              <h1 style={{
                fontSize: "5.5rem",
                filter: quizResult
                  ? "drop-shadow(0 0 40px rgba(46,139,192,0.4))"
                  : "drop-shadow(0 0 40px rgba(255,107,107,0.3))",
              }}>{pick.emoji}</h1>
              <h2 style={{
                fontSize: "2.6rem", fontWeight: 900,
                letterSpacing: "-0.03em", margin: "0 0 6px 0",
                color: quizResult ? "#fff" : "#FF6B6B",
                textShadow: quizResult ? "0 2px 20px rgba(46,139,192,0.5)" : "0 2px 20px rgba(255,107,107,0.3)",
              }}>
                {pick.title}
              </h2>
              <p style={{
                color: quizResult ? "rgba(177,212,224,0.8)" : "rgba(255,107,107,0.7)",
                margin: "8px 0 20px 0", fontWeight: 700, fontSize: "0.85rem",
                textShadow: "0 1px 6px rgba(0,0,0,0.3)",
              }}>
                {quizResult ? `${pick.sub} ${t.quiz.xpAwarded[lang]}` : pick.sub}
              </p>

              {quizResult && (
                <div style={{ margin: "0 0 20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "relative", width: 56, height: 56, marginBottom: 4 }}>
                    <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#2e8bc0" strokeWidth="3"
                        strokeLinecap="round" strokeDasharray="151"
                        strokeDashoffset={151 - (151 * countdown / 10)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                      fontSize: "1.1rem", fontWeight: 900, color: "#fff",
                    }}>{countdown}</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", minWidth: 300 }}>
                {quizResult ? (
                  <button className="ws-btn" onClick={() => {
                    setQuizResult(null);
                    setQuizUnlocked(false);
                    setQuizStarted(false);
                    setShowQuizSummary(false);
                    setQuizSummaryText(null);
                    setQuizSummaryAudioUrl(null);
                    setQuizResultPick(null);
                    setShowSubjectPicker(true);
                    setCurrentData(null);
                    setLoading(false);
                  }} style={{
                    padding: 20, borderRadius: 18, border: "none",
                    background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
                    fontWeight: 900, color: "#000", fontSize: "1rem", fontFamily: FONT,
                    letterSpacing: "0.04em", cursor: "pointer",
                    boxShadow: "0 0 30px rgba(46,139,192,0.25), 0 6px 20px rgba(0,0,0,0.4)",
                  }}>{t.quiz.nextQuest[lang]}</button>
                ) : (
                  <button className="ws-btn" onClick={() => {
                    setQuizResult(null); setQuizStarted(false);
                    setQuizUnlocked(false); setCompletedSlides((p) => p.slice(0, -1));
                  }} style={{
                    padding: 20, borderRadius: 18, border: "none",
                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    fontWeight: 900, color: "#000", fontSize: "1rem", fontFamily: FONT,
                    letterSpacing: "0.04em", cursor: "pointer",
                    boxShadow: "0 0 30px rgba(255,107,107,0.25), 0 6px 20px rgba(0,0,0,0.4)",
                  }}>{t.quiz.tryAgain[lang]}</button>
                )}
              </div>

              <div style={{
                marginTop: 28, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.08)",
                width: "100%",
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14,
                }}>{t.quiz.shareProgress[lang]}</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="ws-btn" onClick={() => window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank")} style={{
                    flex: 1, minWidth: 60, padding: "12px 10px", borderRadius: 14,
                    background: "rgba(37,211,102,0.15)", color: "#25D366",
                    border: "1px solid rgba(37,211,102,0.25)", fontWeight: 800,
                    fontFamily: FONT, fontSize: "0.75rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zm-5.44 7.43h-.02c-1.84 0-3.65-.5-5.23-1.43l-.37-.22-3.9 1.02 1.04-3.8-.24-.39A10.39 10.39 0 012.04 12C2.04 6.48 6.5 2.02 12.04 2.02c2.67 0 5.18 1.04 7.07 2.93a9.93 9.93 0 012.93 7.07c0 5.52-4.5 10.02-10.01 10.02v-.23zm8.52-18.53A11.92 11.92 0 0012.04 0C5.46 0 .1 5.34.1 11.9c0 2.1.55 4.15 1.59 5.96L0 24l6.3-1.65a11.9 11.9 0 005.73 1.46h.01C18.58 23.81 24 18.47 24 11.9c0-3.18-1.24-6.17-3.45-8.42z"/></svg>
                    WhatsApp
                  </button>
                  <button className="ws-btn" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank")} style={{
                    flex: 1, minWidth: 60, padding: "12px 10px", borderRadius: 14,
                    background: "rgba(29,155,240,0.15)", color: "#1D9BF0",
                    border: "1px solid rgba(29,155,240,0.25)", fontWeight: 800,
                    fontFamily: FONT, fontSize: "0.75rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1D9BF0"><path d="M18.24 2.25h3.55l-7.76 8.87L23.52 21.75h-7.15l-5.6-7.32-6.41 7.32H.81l8.3-9.49L.48 2.25h7.33l5.06 6.69 5.37-6.69zm-1.25 17.52h1.97L7.12 4.26H5.01l11.98 15.51z"/></svg>
                    X
                  </button>
                  <button className="ws-btn" onClick={() => window.open(`https://www.instagram.com/`, "_blank")} style={{
                    flex: 1, minWidth: 60, padding: "12px 10px", borderRadius: 14,
                    background: "rgba(225,48,108,0.15)", color: "#E1306C",
                    border: "1px solid rgba(225,48,108,0.25)", fontWeight: 800,
                    fontFamily: FONT, fontSize: "0.75rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
                    Insta
                  </button>
                  <button className="ws-btn" onClick={() => {
                    if (navigator.share) { navigator.share({ title: "Moolab", text: shareText, url: shareUrl }); }
                    else { navigator.clipboard.writeText(`${shareText} ${shareUrl}`); }
                  }} style={{
                    flex: 1, minWidth: 60, padding: "12px 10px", borderRadius: 14,
                    background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.12)", fontWeight: 800,
                    fontFamily: FONT, fontSize: "0.75rem", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 000-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9a3 3 0 000 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 002.92 2.92A2.92 2.92 0 0021 19.08a2.92 2.92 0 00-3-3z"/></svg>
                    More
                  </button>
                </div>
              </div>
            </div>
            );
          })()}
        </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      {content}
    </AppLayout>
  );
}

export default App;
