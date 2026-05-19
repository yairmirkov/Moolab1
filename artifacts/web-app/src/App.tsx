import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import LandingPage from "./LandingPage";
import LandingPageES from "./LandingPageES";
import CommandCenter from "./CommandCenter";
import ConceptCard from "./ConceptCard";
import SharkGame from "./SharkGame";
import translations, { type Lang } from "./translations";
import { isElevenLabsAvailable, speakWithElevenLabs, stopElevenLabsAudio, speakPodcastLine, resolveVoiceLang, getVoiceIdForRole, fetchAudioBlob, playBlobAudio } from "./elevenlabs";
import { resolveVideoUrls } from "./pexelsVideo";
import TheVault from "./TheVault";
import { findEquippedTitle } from "./titles";
import Sandbox from "./Sandbox";
import AppLayout from "./AppLayout";
import Hub from "./Hub";
import { useFeed } from "./FeedContext";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import { buildCardPrompt, buildShortTextPrompt, pickVibeSeed, effectiveSkillLevel, type SkillLevel as PromptSkillLevel } from "./cardPrompt";

const RECENT_TITLES_MAX = 24;
const recentTitlesBySubject = new Map<string, string[]>();
function pushRecentTitles(subjectKey: string, titles: string[]) {
  if (!subjectKey || !titles.length) return;
  const arr = recentTitlesBySubject.get(subjectKey) || [];
  for (const t of titles) {
    if (!t) continue;
    arr.push(t);
  }
  while (arr.length > RECENT_TITLES_MAX) arr.shift();
  recentTitlesBySubject.set(subjectKey, arr);
}
function getRecentTitles(subjectKey: string): string[] {
  return recentTitlesBySubject.get(subjectKey) || [];
}

type TabId = "hub" | "lab" | "tank" | "vault";

const MODULE_ICONS = ["🐷", "📊", "💰", "📈", "💳", "🏛️", "🏠", "🪙"];
const MODULE_WINS_NEEDED = 10;

type AgeBand = "Kids" | "Teens" | "Adults";
const toBand = (ageGroup: string): AgeBand =>
  ageGroup === "Kids" || ageGroup === "Teens" || ageGroup === "Adults"
    ? (ageGroup as AgeBand)
    : "Teens";

const SUBJECT_UNLOCK_THRESHOLD = 3;
const SUBJECT_MASTERY_WINS = 10;
const SUBJECT_WINS_NEEDED = SUBJECT_MASTERY_WINS;

const COIN_REWARDS = {
  CORRECT_ANSWER: 5,
  QUIZ_WIN: 50,
  QUIZ_LOSS: 15,
  SUBJECT_UNLOCK: 100,
  SUBJECT_MASTERY: 250,
  LEVEL_GRADUATION: 1000,
  DAILY_BASE: 10,
  STREAK_7: 100,
  STREAK_30: 500,
  STREAK_100: 2000,
};

const getBonusSubjects = (_lang: Lang, _level: UserLevel): Array<{
  id: string; title: string; description: string; icon: string;
}> => {
  // Scaffolding for future bonus/seasonal subjects. Returning [] keeps the
  // pipeline ready without affecting graduation requirements.
  return [];
};

const getModules = (lang: Lang, level: UserLevel) => {
  const subs = translations.subjects[level][lang];
  const icons = translations.subjectIcons[level];
  const core = subs.map((s: { id: string; title: string; description: string }, i: number) => ({
    id: s.id,
    level,
    icon: icons[i] || "\u2728",
    name: s.title,
    topic: s.description,
    winsNeeded: SUBJECT_MASTERY_WINS,
    unlockThreshold: SUBJECT_UNLOCK_THRESHOLD,
    isBonus: false,
  }));
  const bonus = getBonusSubjects(lang, level).map((b) => ({
    id: b.id,
    level,
    icon: b.icon,
    name: b.title,
    topic: b.description,
    winsNeeded: SUBJECT_MASTERY_WINS,
    unlockThreshold: SUBJECT_UNLOCK_THRESHOLD,
    isBonus: true,
  }));
  return [...core, ...bonus];
};

const computeEffectiveLevel = (
  progress: Record<string, number>,
  override: UserLevel | "auto",
): UserLevel => {
  if (override !== "auto") return override;
  const masteredInLevel = (lvl: UserLevel) =>
    translations.subjects[lvl].en.filter(
      (s: { id: string }) => (progress[s.id] || 0) >= SUBJECT_MASTERY_WINS,
    ).length;
  if (masteredInLevel("intermediate") >= 5) return "expert";
  if (masteredInLevel("beginner") >= 5) return "intermediate";
  return "beginner";
};

// Strip leading option labels Gemini sometimes bakes in like "A. ", "(B) ", "C) ", "1. ", "1) "
const stripOptionPrefix = (raw: unknown): string => {
  if (typeof raw !== "string") return String(raw ?? "");
  return raw.replace(/^\s*(?:[\(\[]?\s*[A-Za-z0-9]\s*[\)\].:\-—]\s*)+/, "").trim();
};

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

type UserLevel = "beginner" | "intermediate" | "expert";

const computeUserLevel = (wins: number): UserLevel => {
  if (wins >= 7) return "expert";
  if (wins >= 3) return "intermediate";
  return "beginner";
};

const userLevelLabel = (level: UserLevel, lang: Lang = "en"): string => {
  if (lang === "es") return level === "beginner" ? "Principiante" : level === "intermediate" ? "Intermedio" : "Experto";
  return level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Expert";
};

const computeGradeLevel = (birthYear: string | undefined, ageGroup: string, lang: Lang = "en"): string => {
  const year = birthYear ? parseInt(birthYear, 10) : NaN;
  const now = new Date().getFullYear();
  const age = !isNaN(year) && year > 1900 && year <= now ? now - year : null;
  if (age !== null) {
    if (age >= 17) return lang === "es" ? "Universidad / Adulto" : "College / Adult";
    const grade = Math.max(1, Math.min(12, age - 5));
    if (lang === "es") return `${grade}º Grado (edad ${age})`;
    const suf = grade === 1 ? "st" : grade === 2 ? "nd" : grade === 3 ? "rd" : "th";
    return `${grade}${suf} Grade (age ${age})`;
  }
  if (ageGroup === "Kids") return lang === "es" ? "Grados 3-5 (edades 8-12)" : "Grades 3-5 (ages 8-12)";
  if (ageGroup === "Teens") return lang === "es" ? "Grados 6-10 (edades 13-16)" : "Grades 6-10 (ages 13-16)";
  return lang === "es" ? "Universidad / Adulto (17+)" : "College / Adult (17+)";
};

const generateCards = async (
  ageGroup: string,
  topic?: string,
  lang: Lang = "en",
  country?: string,
  batchSize: number = 10,
  opts?: { requestedTypes?: string[]; subjectTitle?: string; birthYear?: string; userLevel?: UserLevel; grade?: string | null; skillFloor?: PromptSkillLevel | null; subjectId?: string | null },
) => {
  const timerLabel = `Gemini API (batch=${batchSize})`;
  console.time(timerLabel);
  let timerEnded = false;
  const endTimer = () => { if (!timerEnded) { timerEnded = true; console.timeEnd(timerLabel); } };
  const subjectTitle = (opts?.subjectTitle || "").trim() || "(unspecified)";
  const subjectDescription = (topic || "").trim() || "(unspecified)";
  const computedSkill: PromptSkillLevel = (opts?.userLevel as PromptSkillLevel) || "beginner";
  const skillLevel = effectiveSkillLevel(computedSkill, opts?.skillFloor || null);
  const requestedTypes = opts?.requestedTypes || getRequestedTypes(0, batchSize);
  const subjectKey = opts?.subjectId || subjectTitle;
  const vibeSeed = pickVibeSeed();
  const prompt = buildCardPrompt({
    lang,
    grade: opts?.grade || null,
    birthYear: opts?.birthYear,
    ageGroup,
    skillLevel,
    subjectId: opts?.subjectId || null,
    subjectTitle,
    subjectDescription,
    country,
    requestedTypes,
    vibeSeed,
    recentTitles: getRecentTitles(subjectKey),
  });
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "/api"}/gemini/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      },
    );
    const data = await response.json();
    endTimer();
    const cleanText = (data?.text || "")
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
          lesson.miniGame.options = lesson.miniGame.options.map(stripOptionPrefix);
          const shuffled = shuffleOptions(lesson.miniGame.options, lesson.miniGame.correctIndex);
          lesson.miniGame.options = shuffled.options;
          lesson.miniGame.correctIndex = shuffled.correctIndex;
        }
        return lesson;
      });
    }
    if (parsed?.bossQuiz) {
      if (!parsed.bossQuiz.actionQuestion && parsed.bossQuiz.question) {
        parsed.bossQuiz.actionQuestion = parsed.bossQuiz.question;
      }
      if (parsed.bossQuiz.options) {
        parsed.bossQuiz.options = parsed.bossQuiz.options.map(stripOptionPrefix);
        const shuffled = shuffleOptions(parsed.bossQuiz.options, parsed.bossQuiz.correctIndex);
        parsed.bossQuiz.options = shuffled.options;
        parsed.bossQuiz.correctIndex = shuffled.correctIndex;
      }
    }
    if (parsed?.lessons?.length) {
      const newTitles = parsed.lessons
        .map((l: any) => (l.title || l.term || "").trim())
        .filter((s: string) => s.length > 0);
      pushRecentTitles(subjectKey, newTitles);
    }
    return parsed;
  } catch (e) {
    endTimer();
    return null;
  }
};

const SUBJECT_OPTIONS_LEGACY = {
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

const generateShortText = async (type: "intro" | "summary", opts: { name: string; ageGroup: string; subject: string; lang: Lang; grade?: string | null; birthYear?: string; skillLevel?: PromptSkillLevel | null }): Promise<string> => {
  const instruction = buildShortTextPrompt(type, {
    name: opts.name,
    lang: opts.lang,
    grade: opts.grade || null,
    birthYear: opts.birthYear,
    ageGroup: opts.ageGroup,
    skillLevel: opts.skillLevel || "beginner",
    subject: opts.subject,
  });
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "/api"}/gemini/generate`,
      { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ prompt: instruction }) },
    );
    const data = await response.json();
    return (data?.text || "").trim() || (type === "intro" ? `Hey ${opts.name}! Let's dive in!` : `Great job, ${opts.name}!`);
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

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const SMALL_FONT = "'Lato', system-ui, -apple-system, sans-serif";
const HEADING_FONT = "'Bricolage Grotesque', 'Lato', system-ui, sans-serif";

type ThemeId = "navy" | "sunset" | "mint" | "electric" | "neon_hacker" | "halloween" | "winter" | "spring" | "summer";
const THEMES: Record<ThemeId, {
  label: string; emoji: string;
  hubBg: string;
  slideBg: string;
  panelBg: string;
  accent: string;
  accent2: string;
}> = {
  navy: {
    label: "Navy", emoji: "🌊",
    hubBg: "radial-gradient(ellipse at top, #0a1f3a 0%, #050d1c 60%, #02060f 100%)",
    slideBg: "linear-gradient(160deg, #051528 0%, #020a14 100%)",
    panelBg: "linear-gradient(135deg, #0c2d48 0%, #061522 100%)",
    accent: "#2e8bc0", accent2: "#b1d4e0",
  },
  sunset: {
    label: "Sunset", emoji: "🌅",
    hubBg: "radial-gradient(ellipse at top, #ff8a5b 0%, #e64980 50%, #2a0e2e 100%)",
    slideBg: "linear-gradient(160deg, #ff8a5b 0%, #5a0e3a 100%)",
    panelBg: "linear-gradient(135deg, #e64980 0%, #4a0e3a 100%)",
    accent: "#ff8a5b", accent2: "#ffd1a3",
  },
  mint: {
    label: "Mint", emoji: "🍃",
    hubBg: "radial-gradient(ellipse at top, #5eead4 0%, #14b8a6 45%, #042f2e 100%)",
    slideBg: "linear-gradient(160deg, #042f2e 0%, #021412 100%)",
    panelBg: "linear-gradient(135deg, #14b8a6 0%, #042f2e 100%)",
    accent: "#5eead4", accent2: "#a7f3d0",
  },
  electric: {
    label: "Electric", emoji: "⚡",
    hubBg: "radial-gradient(ellipse at top, #a78bfa 0%, #7c3aed 45%, #1e0a3c 100%)",
    slideBg: "linear-gradient(160deg, #1e0a3c 0%, #0a0418 100%)",
    panelBg: "linear-gradient(135deg, #7c3aed 0%, #1e0a3c 100%)",
    accent: "#a78bfa", accent2: "#e9d5ff",
  },
  // ------- Cosmetic-driven themes (from equipped Vault items) -------
  neon_hacker: {
    label: "Neon Hacker", emoji: "💻",
    hubBg: "radial-gradient(ellipse at top, #001a14 0%, #000806 60%, #000000 100%)",
    slideBg: "linear-gradient(160deg, #001a14 0%, #000000 100%)",
    panelBg: "linear-gradient(135deg, #002a22 0%, #000806 100%)",
    accent: "#00ff87", accent2: "#60efff",
  },
  // ------- Seasonal themes -------
  halloween: {
    label: "Halloween", emoji: "🎃",
    hubBg: "radial-gradient(ellipse at top, #ff7518 0%, #6b1a8a 55%, #1a0a1f 100%)",
    slideBg: "linear-gradient(160deg, #2a0f1a 0%, #0a0510 100%)",
    panelBg: "linear-gradient(135deg, #6b1a8a 0%, #1a0a1f 100%)",
    accent: "#ff7518", accent2: "#c084fc",
  },
  winter: {
    label: "Winter", emoji: "❄️",
    hubBg: "radial-gradient(ellipse at top, #e0f2fe 0%, #7dd3fc 35%, #082f49 100%)",
    slideBg: "linear-gradient(160deg, #0c2d4c 0%, #04121f 100%)",
    panelBg: "linear-gradient(135deg, #1e40af 0%, #082f49 100%)",
    accent: "#7dd3fc", accent2: "#e0f2fe",
  },
  spring: {
    label: "Spring", emoji: "🌸",
    hubBg: "radial-gradient(ellipse at top, #fbcfe8 0%, #bef264 45%, #1a3a1a 100%)",
    slideBg: "linear-gradient(160deg, #2a3d1a 0%, #0f1a08 100%)",
    panelBg: "linear-gradient(135deg, #ec4899 0%, #4d7c0f 100%)",
    accent: "#f472b6", accent2: "#bef264",
  },
  summer: {
    label: "Summer", emoji: "🏖️",
    hubBg: "radial-gradient(ellipse at top, #fde68a 0%, #06b6d4 45%, #052e3a 100%)",
    slideBg: "linear-gradient(160deg, #064e62 0%, #021820 100%)",
    panelBg: "linear-gradient(135deg, #f59e0b 0%, #06b6d4 100%)",
    accent: "#fb923c", accent2: "#22d3ee",
  },
};

// Equipped Vault items can override the user-selected theme.
// Priority: seasonal pack > cosmetic theme > user preference.
function resolveEffectiveThemeId(equipped: string[], userTheme: ThemeId): ThemeId {
  if (equipped.includes("halloween_pack")) return "halloween";
  if (equipped.includes("winter_bundle")) return "winter";
  if (equipped.includes("spring_fresh")) return "spring";
  if (equipped.includes("summer_vibes")) return "summer";
  if (equipped.includes("neon_hacker")) return "neon_hacker";
  return userTheme;
}

const HYPE_LABELS = ["let's gooo", "you're cooking 🔥", "easy 💸", "fr fr", "no cap", "+vibes", "huge W", "bagged it", "money moves", "clean 🧼"];
const pickHype = (): string => HYPE_LABELS[Math.floor(Math.random() * HYPE_LABELS.length)];

let __audioCtx: AudioContext | null = null;
const getAudioCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!__audioCtx) {
    try { __audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { return null; }
  }
  if (__audioCtx.state === "suspended") __audioCtx.resume().catch(() => {});
  return __audioCtx;
};
const playTone = (freq: number, duration = 0.15, type: OscillatorType = "sine", gain = 0.12, slideTo?: number) => {
  const ctx = getAudioCtx(); if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch {}
};
const SFX = {
  flip: () => { playTone(520, 0.07, "triangle", 0.05); },
  correct: () => { playTone(660, 0.1, "sine", 0.15); setTimeout(() => playTone(990, 0.16, "sine", 0.15), 80); },
  wrong: () => { playTone(220, 0.18, "sawtooth", 0.08, 110); },
  coin: () => { playTone(880, 0.06, "square", 0.07); setTimeout(() => playTone(1320, 0.08, "square", 0.06), 50); },
};


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
  childAuthMode?: boolean;
}

function App({ demoMode = false, demoAgeGroup = "", childAuthMode = false }: AppProps) {
  const skipOnboarding = demoMode || childAuthMode;
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

  const t = translations;

  const auth = useAuth();
  const childGrade: string | null = auth?.child?.grade ?? null;
  const childSkillFloor: PromptSkillLevel | null = (auth?.child?.skillLevel as PromptSkillLevel) ?? null;

  const [appStarted, setAppStarted] = useState(skipOnboarding);
  const [ageGroup, setAgeGroup] = useState(skipOnboarding ? demoAgeGroup : "");
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
  const [userName, setUserName] = useState(() => skipOnboarding ? (loadStr("name", "") || "Demo") : loadStr("name", ""));
  const [birthYear, setBirthYear] = useState(() => loadStr("birth", ""));
  const [accountType, setAccountType] = useState(() => skipOnboarding ? "learner" : loadStr("acctType", ""));
  const [parentName, setParentName] = useState(() => loadStr("parentName", ""));
  const [userCountry, setUserCountry] = useState(() => loadStr("country", ""));
  const [countryLoading, setCountryLoading] = useState(false);
  const [generatedPin, setGeneratedPin] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [familyVersion, setFamilyVersion] = useState(0);
  const getFamilyState = (): { parent?: string; students?: { nickname: string; pin: string; birthYear: string; country: string }[] } => {
    try { return JSON.parse(localStorage.getItem("ws_family") || "{}"); } catch { return {}; }
  };
  type OnboardView =
    | "choose"
    | "kid-login"
    | "parent-signup"
    | "add-child"
    | "parent-home"
    | "parent-login";
  const [onboardView, setOnboardView] = useState<OnboardView>("choose");
  const [kidLoginError, setKidLoginError] = useState("");
  const [showModuleMap, setShowModuleMap] = useState(false);
  const [showParentDash, setShowParentDash] = useState(false);
  const [showLanding, setShowLanding] = useState(!skipOnboarding);
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const selectedSubjectRef = useRef<string | null>(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const [xp, setXp] = useState(() => load("xp", 0));
  const [streak, setStreak] = useState(() => load("streak", 0));
  const [level, setLevel] = useState(() => load("level", 1));
  const [bossWins, setBossWins] = useState(() => load("bossWins", 0));
  const [moolies, setMoolies] = useState(() => {
    if (demoMode) { save("moolies", 1000); return 1000; }
    return load("moolies", 0);
  });
  const [rewardToasts, setRewardToasts] = useState<Array<{ id: string; amount: number; label: string; big?: boolean }>>([]);
  const [confettiBurst, setConfettiBurst] = useState<number>(0);
  const awardMoolies = useCallback((amount: number, label: string, big = false) => {
    if (amount <= 0) return;
    setMoolies((p) => Math.round((p + amount) * 100) / 100);
    const id = Math.random().toString(36).slice(2);
    setRewardToasts((t) => [...t, { id, amount, label, big }]);
    if (big) setConfettiBurst((n) => n + 1);
    const ttl = big ? 3800 : 2200;
    setTimeout(() => {
      setRewardToasts((t) => t.filter((x) => x.id !== id));
    }, ttl);
  }, []);
  const dailyClaimRanRef = useRef(false);
  useEffect(() => {
    if (dailyClaimRanRef.current || demoMode) return;
    dailyClaimRanRef.current = true;
    const today = new Date().toISOString().slice(0, 10);
    const last = loadStr("lastDailyClaim", "");
    if (last === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const prevStreak = load("streak", 0);
    const newDays = last === yesterday ? prevStreak + 1 : 1;
    saveStr("lastDailyClaim", today);
    setStreak(newDays);
    const baseReward = COIN_REWARDS.DAILY_BASE * Math.min(5, Math.max(1, Math.ceil(newDays / 5)));
    setTimeout(() => {
      awardMoolies(baseReward, lang === "es" ? `Día ${newDays} 🔥` : `Day ${newDays} 🔥`);
      if (newDays === 7) setTimeout(() => awardMoolies(COIN_REWARDS.STREAK_7, lang === "es" ? "¡7 días seguidos!" : "7-day streak!", true), 700);
      if (newDays === 30) setTimeout(() => awardMoolies(COIN_REWARDS.STREAK_30, lang === "es" ? "¡30 días seguidos!" : "30-day streak!", true), 700);
      if (newDays === 100) setTimeout(() => awardMoolies(COIN_REWARDS.STREAK_100, lang === "es" ? "¡100 días seguidos!" : "100-day streak!", true), 700);
    }, 1200);
  }, [demoMode, awardMoolies, lang]);
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
  const [isWideViewport, setIsWideViewport] = useState<boolean>(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const appContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = appContainerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      const onResize = () => setIsWideViewport(window.innerWidth >= 1024);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setIsWideViewport(w >= 1024);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(() => load("modIdx", 0));
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("ws_modProg") || "{}");
      const keys = Object.keys(raw);
      const allNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
      return allNumeric ? {} : raw;
    } catch { return {}; }
  });

  const demoLevelOverrideRaw = (loadStr("demo_level", "auto") as UserLevel | "auto");
  const effectiveLevel = useMemo(
    () => computeEffectiveLevel(moduleProgress, demoMode ? demoLevelOverrideRaw : "auto"),
    [moduleProgress, demoMode, demoLevelOverrideRaw],
  );
  const MODULES = useMemo(() => getModules(lang, effectiveLevel), [lang, effectiveLevel]);

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
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => loadStr("sfxEnabled", "false") === "true");
  useEffect(() => { saveStr("sfxEnabled", String(sfxEnabled)); }, [sfxEnabled]);
  const sfxEnabledRef = useRef<boolean>(sfxEnabled);
  useEffect(() => { sfxEnabledRef.current = sfxEnabled; }, [sfxEnabled]);
  const playSfx = useCallback((kind: "flip" | "correct" | "wrong" | "coin") => {
    if (!sfxEnabledRef.current) return;
    SFX[kind]();
  }, []);
  const [themeId, setThemeId] = useState<ThemeId>(() => (loadStr("themeId", "navy") as ThemeId));
  useEffect(() => { saveStr("themeId", themeId); }, [themeId]);
  const effectiveThemeId = resolveEffectiveThemeId(equippedItems, themeId);
  const theme = THEMES[effectiveThemeId] || THEMES.navy;
  const [reactions, setReactions] = useState<Array<{ id: string; emoji: string; x: number; y: number; dx: number }>>([]);
  const spawnReactions = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const pool = ["👏", "🎉", "💯", "🔥", "✨", "🪙", "🚀"];
    const next = Array.from({ length: 6 }).map((_, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      emoji: pool[Math.floor(Math.random() * pool.length)],
      x: cx + (Math.random() - 0.5) * 60,
      y: cy,
      dx: (Math.random() - 0.5) * 140,
    }));
    setReactions((p) => [...p, ...next]);
    setTimeout(() => {
      setReactions((p) => p.filter((r) => !next.find((n) => n.id === r.id)));
    }, 1400);
  }, []);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1);
  const speechSpeedRef = useRef<number>(1);
  const progress = Math.min((completedSlides.length / 5) * 100, 100);

  const [flashBlue, setFlashBlue] = useState(false);

  const currentModule = MODULES[Math.min(currentModuleIdx, MODULES.length - 1)];
  const currentModuleWins = currentModule ? (moduleProgress[currentModule.id] || 0) : 0;
  const allModulesComplete = currentModuleIdx >= MODULES.length;

  const lastEffectiveLevelRef = useRef<UserLevel>(effectiveLevel);
  useEffect(() => {
    if (lastEffectiveLevelRef.current !== effectiveLevel) {
      lastEffectiveLevelRef.current = effectiveLevel;
      setCurrentModuleIdx(0);
    }
  }, [effectiveLevel]);

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

  const resetJourney = useCallback((subjectOverride?: string, modOverride?: { id?: string; name?: string; topic?: string; level?: UserLevel } | null) => {
    resetFeedSession();
    setLoading(true);
    setPreloadReady(false);
    setPreloadProgress("");
    setQuizUnlocked(false);
    setQuizStarted(false);
    setQuizResult(null);
    setRevealedExplanations({});
    setBossExplanation(null);
    summaryPrefetchKey.current = null;
    summaryShownKey.current = null;
    summaryAudioPlayedKey.current = null;
    setQuizSummaryText(null);
    setQuizSummaryAudioUrl(null);
    setRevealedSlides({});
    setAudioUnlocked(false);
    stopElevenLabsAudio();
    bufferCardAudioPlayed.clear();
    bufferCardObserved.clear();
    const mod = modOverride || MODULES[Math.min(currentModuleIdx, MODULES.length - 1)];
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
      grade: childGrade,
      birthYear,
      skillLevel: effectiveSkillLevel((mod?.level || effectiveLevel) as PromptSkillLevel, childSkillFloor),
    });

    const introFallback = currentLang === "es"
      ? `¡Hola${userName ? `, ${userName}` : ""}! Prepárate para una sesión increíble de aprendizaje financiero.`
      : `Hey${userName ? `, ${userName}` : ""}! Get ready for an awesome financial learning session.`;

    const userLevel: UserLevel = mod?.level || effectiveLevel;
    generateCards(ageGroup, topic, currentLang, country, 4, { requestedTypes: initialTypes, subjectTitle: subjectOverride || selectedSubjectRef.current || mod?.name, birthYear, userLevel, grade: childGrade, skillFloor: childSkillFloor, subjectId: mod?.id || selectedSubjectRef.current }).then(async (data) => {
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
    if (appStarted && ageGroup && accountType !== "parent") {
      navigateTo("hub");
    }
  }, [appStarted, ageGroup, accountType]);

  useEffect(() => {
    if (demoMode || accountType !== "learner") return;
    const handle = setTimeout(() => {
      api.syncChildProgress({
        xp: Math.floor(xp),
        level: Math.floor(level),
        streak: Math.floor(streak),
        bossWins: Math.floor(bossWins),
        moolies: Math.floor(moolies),
        lessonsCompleted: Object.values(moduleProgress).reduce((s: number, v: any) => s + (Number(v) || 0), 0),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(handle);
  }, [xp, level, streak, bossWins, moolies, moduleProgress, accountType, demoMode]);

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
          const userLevel2: UserLevel = currentModule?.level || effectiveLevel;
          const newData = await generateCards(ageGroup, selectedSubjectRef.current || currentModule?.topic, currentLang, loadStr("country", ""), 4, { requestedTypes: nextTypes, subjectTitle: selectedSubjectRef.current || currentModule?.name, birthYear, userLevel: userLevel2, grade: childGrade, skillFloor: childSkillFloor, subjectId: currentModule?.id || selectedSubjectRef.current });
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

  const summaryPrefetchKey = useRef<string | null>(null);
  const summaryShownKey = useRef<string | null>(null);
  const summaryAudioPlayedKey = useRef<string | null>(null);

  // Effect A: prefetch the summary the moment the user enters the quiz screen.
  // This way it's ready (or nearly ready) by the time they answer correctly.
  useEffect(() => {
    if (!quizStarted) return;
    const quizKey = `${userName}_${ageGroup}_${currentModule?.id ?? currentModuleIdx}`;
    if (summaryPrefetchKey.current === quizKey) return;
    summaryPrefetchKey.current = quizKey;

    const currentLang = langRef.current;
    let cancelled = false;

    setQuizSummaryText(null);
    setQuizSummaryAudioUrl(null);

    const fallbackText = currentLang === "es"
      ? "¡Gran trabajo en esta sección! Estás progresando increíblemente."
      : "Great job on this section! You're making awesome progress.";

    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled && !resolved) {
        console.warn("Summary generation timed out — using fallback");
        resolved = true;
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
          grade: childGrade,
          birthYear,
          skillLevel: effectiveSkillLevel((currentModule?.level || effectiveLevel) as PromptSkillLevel, childSkillFloor),
        });
        if (cancelled) return;
        clearTimeout(timeoutId);
        if (resolved) return;
        resolved = true;
        const finalText = summaryText || fallbackText;
        setQuizSummaryText(finalText);
        if (isElevenLabsAvailable()) {
          try {
            const r = await fetchAudioBlob(finalText, getVoiceIdForRole("Host", currentLang), { stability: 0.32, similarity_boost: 0.88, style: 0.85, use_speaker_boost: true });
            if (cancelled) return;
            if (r.url) setQuizSummaryAudioUrl(r.url);
          } catch (audioErr) {
            console.error("Summary audio fetch failed:", audioErr);
          }
        }
      } catch (err) {
        console.error("Summary generation failed:", err);
        if (!cancelled && !resolved) {
          clearTimeout(timeoutId);
          resolved = true;
          setQuizSummaryText(fallbackText);
        }
      }
    })();
    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [quizStarted, userName, ageGroup, currentModule]);

  // Effect B: on a correct answer, flip the summary screen on and pick a win title.
  useEffect(() => {
    if (quizResult !== true) {
      summaryShownKey.current = null;
      summaryAudioPlayedKey.current = null;
      return;
    }
    const quizKey = `${userName}_${ageGroup}_${currentModule?.id ?? currentModuleIdx}`;
    if (summaryShownKey.current === quizKey) return;
    summaryShownKey.current = quizKey;
    const currentLang = langRef.current;
    const winTitles = translations.winTitles[currentLang];
    const picked = winTitles[Math.floor(Math.random() * winTitles.length)];
    setQuizResultPick(picked);
    setShowQuizSummary(true);
    setConfettiBurst((n) => n + 1);
    setTimeout(() => setConfettiBurst((n) => n + 1), 600);
    setTimeout(() => setConfettiBurst((n) => n + 1), 1300);
    playSfx("correct");
    setTimeout(() => playSfx("coin"), 250);
  }, [quizResult, userName, ageGroup, currentModule]);

  // Effect C: autoplay the summary audio once both the win has happened AND the audio is ready.
  useEffect(() => {
    if (quizResult !== true || !quizSummaryAudioUrl) return;
    const quizKey = `${userName}_${ageGroup}_${currentModule?.id ?? currentModuleIdx}`;
    if (summaryAudioPlayedKey.current === quizKey) return;
    summaryAudioPlayedKey.current = quizKey;
    if (!isMutedRef.current && speechSpeedRef.current > 0) {
      playBlobAudio(quizSummaryAudioUrl, speechSpeedRef.current);
    }
  }, [quizResult, quizSummaryAudioUrl, userName, ageGroup, currentModule]);

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
      setOnboardView("parent-login");
      setShowLanding(false);
      setFadeIn(true);
      setTimeout(() => setFadeIn(false), 700);
    };
    const signUpHandler = () => {
      setOnboardView("choose");
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

    const stepContent = () => {
      if (onboardView === "choose") {
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
                  setUserName("");
                  setBirthYear("");
                  setKidLoginError("");
                  setOnboardView("kid-login");
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
                  setOnboardView("parent-signup");
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
              onClick={() => { setAccountType("parent"); saveStr("acctType", "parent"); setOnboardView("parent-login"); }}
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

      if (onboardView === "kid-login") {
        const pinNickname = userName;
        const pinCode = birthYear;
        const canLogin = pinNickname.trim().length > 0 && pinCode.length === 4;

        const attemptPinLogin = () => {
          if (!canLogin) return;
          const family = getFamilyState();
          const students = family.students || [];
          const match = students.find((s) => s.nickname.toLowerCase() === pinNickname.trim().toLowerCase() && s.pin === pinCode.trim());
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
            setKidLoginError(t.auth.incorrectPin[lang]);
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
                  onChange={(e) => { setUserName(e.target.value); setKidLoginError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") attemptPinLogin(); }}
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
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setBirthYear(v); setKidLoginError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") attemptPinLogin(); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)",
                    border: kidLoginError ? "1px solid rgba(220,53,69,0.45)" : "1px solid rgba(46,139,192,0.2)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "1.4rem",
                    outline: "none", caretColor: "#145374", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)", textAlign: "center",
                    letterSpacing: "0.5em",
                  }}
                />
              </div>
            </div>

            {kidLoginError && (
              <div style={{
                width: "100%", maxWidth: 340, marginBottom: 14, padding: "10px 14px",
                borderRadius: 10, background: "rgba(220,53,69,0.08)",
                border: "1px solid rgba(220,53,69,0.25)", color: "#b32a3a",
                fontSize: "0.72rem", fontWeight: 700, textAlign: "center",
              }}>
                {kidLoginError}
              </div>
            )}

            <button
              className="ws-btn"
              onClick={attemptPinLogin}
              disabled={!canLogin}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: canLogin
                  ? "linear-gradient(135deg, #2e8bc0, #b1d4e0)"
                  : "rgba(12,45,72,0.08)",
                color: canLogin ? "#fff" : "rgba(12,45,72,0.25)",
                fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
                cursor: canLogin ? "pointer" : "default",
                boxShadow: canLogin
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

      if (onboardView === "parent-signup") {
        const canContinue = parentName.trim().length > 0;
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

            <button
              className="ws-btn"
              onClick={() => {
                if (!canContinue) return;
                saveFamily({ ...familyState, parent: parentName });
                setGeneratedPin(String(Math.floor(1000 + Math.random() * 9000)));
                setUserName("");
                setBirthYear("");
                setUserCountry("");
                setOnboardView((familyState.students || []).length > 0 ? "parent-home" : "add-child");
              }}
              disabled={!canContinue}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: canContinue
                  ? "linear-gradient(135deg, #2e8bc0, #b1d4e0)"
                  : "rgba(12,45,72,0.08)",
                color: canContinue ? "#fff" : "rgba(12,45,72,0.25)",
                fontWeight: 900, fontSize: "1.05rem", letterSpacing: "0.06em",
                cursor: canContinue ? "pointer" : "default",
                boxShadow: canContinue
                  ? "0 0 40px rgba(46,139,192,0.2), 0 8px 24px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {lang === "es" ? "Continuar" : "Continue"}
            </button>

            <button
              className="ws-btn"
              onClick={() => setOnboardView("parent-login")}
              style={{
                background: "none", border: "none", color: "rgba(12,45,72,0.35)",
                fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem",
                cursor: "pointer", padding: "8px 0", marginTop: 16,
                textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >
              {t.auth.alreadyHaveAccount[lang]}
            </button>
          </>
        );
      }


      if (onboardView === "parent-login") {
        const canLogin = parentName.trim().length > 0;
        const handleLogin = () => {
          if (!canLogin) return;
          const students = familyState.students || [];
          setAccountType("parent");
          saveStr("acctType", "parent");
          saveFamily({ ...familyState, parent: parentName });
          if (students.length === 0) {
            setGeneratedPin(String(Math.floor(1000 + Math.random() * 9000)));
            setUserName("");
            setBirthYear("");
            setUserCountry("");
            setOnboardView("add-child");
            return;
          }
          const firstStudent = students[0];
          setUserName(firstStudent.nickname);
          saveStr("name", firstStudent.nickname);
          setBirthYear(firstStudent.birthYear);
          saveStr("birth", firstStudent.birthYear);
          setUserCountry(firstStudent.country || "");
          saveStr("country", firstStudent.country || "");
          startSession({ birthYear: firstStudent.birthYear, accountType: "parent" });
        };
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

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>{t.onboard.yourName[lang]}</label>
                <input
                  type="text"
                  placeholder={t.onboard.parentPlaceholder[lang]}
                  value={parentName}
                  onChange={(e) => { setParentName(e.target.value); saveStr("parentName", e.target.value); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
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

            <button
              className="ws-btn"
              onClick={handleLogin}
              disabled={!canLogin}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: canLogin
                  ? "linear-gradient(135deg, #0c2d48, #145374)"
                  : "rgba(12,45,72,0.08)",
                color: canLogin ? "#fff" : "rgba(12,45,72,0.25)",
                fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
                cursor: canLogin ? "pointer" : "default",
                boxShadow: canLogin
                  ? "0 0 40px rgba(12,45,72,0.3), 0 8px 24px rgba(0,0,0,0.12)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              {t.auth.enter[lang]}
            </button>

            <button
              className="ws-btn"
              onClick={() => setOnboardView("choose")}
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


      if (onboardView === "parent-home") {
        const students = familyState.students || [];
        const effectiveParent = parentName.trim() || familyState.parent || "";
        const canEnter = students.length > 0 && effectiveParent.length > 0;
        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#0c2d48" }}>
              {t.auth.commandCenter[lang]}
            </h2>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28 }}>
              {t.auth.setupProfiles[lang]}
            </p>

            {students.length > 0 && (
              <div style={{ width: "100%", maxWidth: 340, marginBottom: 16 }}>
                <label style={{ display: "block", color: "rgba(12,45,72,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8, paddingLeft: 4 }}>
                  {t.auth.studentProfiles[lang]}
                </label>
                {students.map((s, idx) => (
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
                        const updated = { ...familyState, students: students.filter((_, i) => i !== idx) };
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
              onClick={() => {
                setGeneratedPin(String(Math.floor(1000 + Math.random() * 9000)));
                setUserName("");
                setBirthYear("");
                setUserCountry("");
                setOnboardView("add-child");
              }}
              style={{
                width: "100%", maxWidth: 340, padding: "14px 20px", borderRadius: 16,
                background: "rgba(46,139,192,0.08)", border: "1px dashed rgba(46,139,192,0.25)",
                color: "#145374", fontFamily: FONT, fontWeight: 800, fontSize: "0.85rem",
                cursor: "pointer", marginBottom: 12,
              }}
            >
              + {t.auth.createStudentProfile[lang]}
            </button>

            {canEnter && (
              <button
                className="ws-btn"
                onClick={() => {
                  const parentVal = effectiveParent;
                  saveFamily({ ...familyState, parent: parentVal });
                  setParentName(parentVal);
                  saveStr("parentName", parentVal);
                  setAccountType("parent");
                  saveStr("acctType", "parent");
                  const firstStudent = students[0];
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

      if (onboardView === "add-child") {
        const newNickname = userName;
        const newBirthYear = birthYear;
        const newCountry = userCountry;
        const setNewNickname = setUserName;
        const setNewBirthYear = setBirthYear;
        const setNewCountry = setUserCountry;
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
                setUserCountry("");
                setOnboardView("parent-home");
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

        {onboardView !== "choose" && (
          <button
            className="ws-btn"
            onClick={() => {
              if (onboardView === "kid-login" || onboardView === "parent-signup" || onboardView === "parent-login") {
                setOnboardView("choose");
              } else if (onboardView === "add-child") {
                setOnboardView((familyState.students || []).length > 0 ? "parent-home" : "parent-signup");
              } else if (onboardView === "parent-home") {
                setOnboardView("parent-signup");
              }
            }}
            style={{
              position: "absolute", top: 20, left: 20, background: "none", border: "none",
              color: "rgba(12,45,72,0.4)", fontSize: "1.4rem", cursor: "pointer", fontFamily: FONT,
              zIndex: 10,
            }}
          >←</button>
        )}

        <div key={onboardView} style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "stepSlide 0.35s ease-out both", width: "100%" }}>
          {stepContent()}
        </div>
      </div>
    );
  }
  const handleParentLogout = () => {
    setAppStarted(false);
    setOnboardView("choose");
    setKidLoginError("");
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
      onCreateStudent={() => { setAppStarted(false); setGeneratedPin(String(Math.floor(1000 + Math.random() * 9000))); setUserName(""); setBirthYear(""); setUserCountry(""); setOnboardView("add-child"); }}
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

  if (showSubjectPicker && !loading && !currentData) {
    const levelLabel = effectiveLevel === "beginner"
      ? (lang === "es" ? "Principiante" : "Beginner")
      : effectiveLevel === "intermediate"
        ? (lang === "es" ? "Intermedio" : "Intermediate")
        : (lang === "es" ? "Experto" : "Expert");
    const levelAccent = effectiveLevel === "beginner" ? "#4ade80" : effectiveLevel === "intermediate" ? "#fbbf24" : "#a78bfa";
    const completedCount = MODULES.filter((m) => (moduleProgress[m.id] || 0) >= m.winsNeeded).length;
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center",
        background: "radial-gradient(ellipse at top, #0a1f3a 0%, #050d1c 60%, #02060f 100%)",
        fontFamily: FONT, padding: "20px 20px 40px", color: "#e6f0ff",
      }}>
        <style>{`
          @keyframes subjectFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes subjectGlow { 0%,100% { box-shadow: 0 0 0 1px rgba(120,180,255,0.12), 0 8px 24px rgba(0,0,0,0.4); } 50% { box-shadow: 0 0 0 1px rgba(120,180,255,0.28), 0 12px 32px rgba(46,139,192,0.25); } }
          @keyframes ringSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>

        {/* Top bar with back button */}
        <div style={{
          width: "100%", maxWidth: 440, display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, animation: "subjectFadeIn 0.5s ease-out both",
        }}>
          <button
            onClick={() => { setShowSubjectPicker(false); navigateTo("hub"); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#cfe1f5", fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.02em",
            }}
          >
            <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>←</span>
            {lang === "es" ? "Hub" : "Hub"}
          </button>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 12px", borderRadius: 999,
            background: `${levelAccent}15`, border: `1px solid ${levelAccent}55`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: levelAccent, boxShadow: `0 0 8px ${levelAccent}` }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: levelAccent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {levelLabel}
            </span>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 440, width: "100%", marginBottom: 24, animation: "subjectFadeIn 0.55s ease-out 0.05s both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: 18, marginBottom: 14,
            background: "linear-gradient(135deg, rgba(46,139,192,0.25), rgba(120,180,255,0.08))",
            border: "1px solid rgba(120,180,255,0.2)",
            fontSize: "1.6rem",
          }}>🧪</div>
          <h2 style={{
            fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6,
            background: "linear-gradient(135deg, #ffffff 0%, #b1d4e0 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {lang === "es" ? "¿Qué dominamos hoy?" : "What are we mastering today?"}
          </h2>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(207,225,245,0.5)", letterSpacing: "0.01em", margin: 0 }}>
            {lang === "es" ? "Elige un tema para tu sesión" : "Pick a subject for your session"}
            <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
            <span style={{ color: levelAccent, fontWeight: 800 }}>{completedCount}/{MODULES.length}</span>
          </p>
        </div>

        {/* Subjects list — one wide button per row */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          width: "100%", maxWidth: 440,
        }}>
          {(() => {
            const NEONS = [
              "#ff2d95", // hot pink
              "#39ff14", // neon green
              "#ff9500", // neon orange
              "#00d4ff", // electric blue
              "#bf5cff", // neon purple
              "#ffe600", // neon yellow
              "#ff3366", // neon red
              "#00ffc8", // neon teal
              "#ff6ec7", // bubblegum
              "#7afcff", // ice cyan
            ];
            return MODULES.map((mod, i) => {
            const wins = moduleProgress[mod.id] || 0;
            const pct = Math.min((wins / mod.winsNeeded) * 100, 100);
            const isComplete = wins >= mod.winsNeeded;
            const prevWins = i > 0 ? (moduleProgress[MODULES[i - 1].id] || 0) : Infinity;
            const prevUnlockAt = i > 0 ? (MODULES[i - 1].unlockThreshold || SUBJECT_UNLOCK_THRESHOLD) : 0;
            const isLocked = i > 0 && prevWins < prevUnlockAt;
            const isCurrent = i === currentModuleIdx && !isComplete;
            const unlockMarkerPct = Math.min((mod.unlockThreshold / mod.winsNeeded) * 100, 100);
            const isExpanded = expandedSubjectId === mod.id;
            const neon = NEONS[i % NEONS.length];
            return (
              <button
                key={mod.id}
                className="ws-btn"
                onClick={() => {
                  if (isLocked) {
                    setExpandedSubjectId(isExpanded ? null : mod.id);
                    return;
                  }
                  if (!isExpanded) {
                    setExpandedSubjectId(mod.id);
                    return;
                  }
                  setCurrentModuleIdx(i);
                  setSelectedSubject(mod.name);
                  selectedSubjectRef.current = mod.name;
                  setShowSubjectPicker(false);
                  navigateTo("lab");
                  resetJourney(mod.name, mod);
                }}
                style={{
                  position: "relative", overflow: "hidden",
                  padding: "14px 16px", borderRadius: 16,
                  background: isLocked
                    ? "rgba(255,255,255,0.025)"
                    : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${neon}${isExpanded ? "ee" : isCurrent ? "aa" : "66"}`,
                  boxShadow: isLocked
                    ? "none"
                    : isExpanded
                      ? `0 0 0 1px ${neon}55, 0 8px 28px ${neon}55`
                      : `0 4px 14px ${neon}26`,
                  cursor: "pointer",
                  fontFamily: FONT, textAlign: "left",
                  display: "flex", flexDirection: "column", gap: 0,
                  opacity: isLocked ? 0.55 : 1,
                  animation: `subjectFadeIn 0.5s ease-out ${0.1 + i * 0.06}s both`,
                  transition: "transform 0.15s, border-color 0.6s ease, background 0.6s ease, box-shadow 0.6s ease",
                }}
                onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.985)"; }}
                onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, width: "100%" }}>
                <div style={{
                  flexShrink: 0, width: 44, height: 44, borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isLocked ? "rgba(255,255,255,0.04)" : `${neon}1f`,
                  border: `1px solid ${isLocked ? "rgba(255,255,255,0.08)" : `${neon}66`}`,
                  fontSize: "1.4rem",
                  filter: isLocked ? "grayscale(1)" : "none",
                  transition: "background 0.6s ease, border-color 0.6s ease",
                }}>
                  {mod.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: "0.85rem", fontWeight: 800, color: "#e6f0ff",
                      letterSpacing: "-0.01em", lineHeight: 1.2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{mod.name}</span>
                    <span style={{
                      flexShrink: 0, fontSize: "0.6rem", fontWeight: 800,
                      color: isComplete ? "#4ade80" : "rgba(207,225,245,0.6)",
                      letterSpacing: "0.04em",
                    }}>
                      {isLocked ? "🔒" : isComplete ? `★ ${wins}/${mod.winsNeeded}` : `${wins}/${mod.winsNeeded}`}
                    </span>
                  </div>
                  <div style={{ position: "relative", width: "100%", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: isComplete
                        ? "linear-gradient(90deg, #4ade80, #22c55e)"
                        : `linear-gradient(90deg, ${neon}, ${neon}aa)`,
                      transition: "width 0.6s ease, background 0.6s ease",
                    }} />
                    {!isComplete && unlockMarkerPct < 100 && (
                      <div title={lang === "es" ? "Desbloqueo" : "Unlock"} style={{
                        position: "absolute", top: -2, bottom: -2,
                        left: `calc(${unlockMarkerPct}% - 1px)`, width: 2,
                        background: wins >= mod.unlockThreshold ? "rgba(74,222,128,0.85)" : "rgba(255,255,255,0.45)",
                        borderRadius: 1,
                      }} />
                    )}
                  </div>
                </div>
                <span style={{
                  flexShrink: 0, fontSize: "1rem",
                  color: isLocked ? "rgba(207,225,245,0.25)" : "rgba(207,225,245,0.55)",
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                }}>›</span>
                </div>
                {isExpanded && (
                  <div style={{
                    marginTop: 12, paddingTop: 12, borderTop: `1px solid ${neon}33`,
                    width: "100%", display: "flex", flexDirection: "column", gap: 10,
                    animation: "subjectFadeIn 0.25s ease-out both",
                  }}>
                    <p style={{
                      margin: 0, fontSize: "0.78rem", lineHeight: 1.5,
                      color: "rgba(207,225,245,0.85)", fontWeight: 500,
                    }}>
                      {mod.topic}
                    </p>
                    {!isLocked ? (
                      <div style={{
                        display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 999,
                        background: `linear-gradient(135deg, ${neon}, ${neon}cc)`,
                        color: "#0a0a0f", fontWeight: 800, fontSize: "0.72rem",
                        letterSpacing: "0.02em",
                        boxShadow: `0 4px 14px ${neon}66`,
                      }}>
                        {isComplete
                          ? (lang === "es" ? "Practicar otra vez →" : "Practice again →")
                          : wins > 0
                            ? (lang === "es" ? "Continuar →" : "Continue →")
                            : (lang === "es" ? "Empezar →" : "Start →")}
                      </div>
                    ) : (
                      <div style={{
                        fontSize: "0.68rem", fontWeight: 700, color: "rgba(207,225,245,0.55)",
                        letterSpacing: "0.02em",
                      }}>
                        🔒 {lang === "es"
                          ? `Gana ${prevUnlockAt} en el tema anterior para desbloquear`
                          : `Earn ${prevUnlockAt} wins in the previous subject to unlock`}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          });
          })()}
        </div>

        <p style={{
          marginTop: 18, maxWidth: 440, width: "100%", textAlign: "center",
          fontSize: "0.62rem", fontWeight: 600, color: "rgba(207,225,245,0.4)", letterSpacing: "0.02em",
        }}>
          {lang === "es"
            ? `Gana ${SUBJECT_UNLOCK_THRESHOLD} para desbloquear el siguiente · Domina los 5 con ${SUBJECT_MASTERY_WINS} para graduarte`
            : `${SUBJECT_UNLOCK_THRESHOLD} wins to unlock the next · Master all 5 with ${SUBJECT_MASTERY_WINS} to graduate`}
        </p>
      </div>
    );
  }

  if (activeTab === "lab" && (loading || !currentData))
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
          @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
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
          <SharkGame
            progress={preloadProgress}
            lang={lang}
            onCoinCollected={() => {
              setMoolies((p) => Math.round((p + 1) * 100) / 100);
              playSfx("coin");
            }}
          />
        )}
      </div>
    );

  const isPhoneShapedView = activeTab === "lab" && !isWideViewport;
  const content = (
    <div
      ref={appContainerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: isPhoneShapedView ? 480 : "100%",
        margin: "0 auto",
        background: "#000",
        height: "100%",
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

      {/* COIN STICKER PROGRESS — top center */}
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        zIndex: 15, pointerEvents: "none",
        display: activeTab === "lab" ? "flex" : "none",
        gap: 6, alignItems: "center",
        padding: "6px 12px", borderRadius: 20,
        background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = completedSlides.length > i;
          return (
            <span key={i} style={{
              fontSize: "1.1rem",
              filter: filled ? "none" : "grayscale(1) opacity(0.35)",
              transform: filled ? "scale(1.05)" : "scale(0.85)",
              transition: "transform 0.3s ease, filter 0.3s ease",
              display: "inline-block",
              animation: filled ? `stickerPop 0.5s ease-out ${i * 0.04}s both` : "none",
            }}>🪙</span>
          );
        })}
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
            {MODULES.filter((m) => (moduleProgress[m.id] || 0) >= m.winsNeeded).length}/{MODULES.length} {t.moduleMap.completed[lang]}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
            {MODULES.map((mod, idx) => {
              const wins = moduleProgress[mod.id] || 0;
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
        {(currentData?.lessons ?? []).map((card, i) => {
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
                      if (!isFetchingRef.current && currentData && currentData.lessons.length > 1) {
                        const totalSlides = currentData.lessons.length;
                        const triggerIdx = totalSlides - 3;
                        if (i >= triggerIdx || isIntro) {
                          isFetchingRef.current = true;
                          setIsFetchingMore(true);
                          const currentLang = langRef.current;
                          const nextTypes = getRequestedTypes(totalSlides, 4);
                          const userLevel3: UserLevel = currentModule?.level || effectiveLevel;
                          generateCards(ageGroup, selectedSubjectRef.current || currentModule?.topic, currentLang, loadStr("country", ""), 4, { requestedTypes: nextTypes, subjectTitle: selectedSubjectRef.current || currentModule?.name, birthYear, userLevel: userLevel3, grade: childGrade, skillFloor: childSkillFloor, subjectId: currentModule?.id || selectedSubjectRef.current }).then(async (newData) => {
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
                {(() => {
                  const INTRO_NEONS = ["#ff2d95","#39ff14","#ff9500","#00d4ff","#bf5cff","#ffe600","#ff3366","#00ffc8","#ff6ec7","#7afcff"];
                  const seed = (currentModule?.id || selectedSubject || card.id || "intro") as string;
                  let h1 = 0, h2 = 0;
                  for (let k = 0; k < seed.length; k++) { h1 = (h1 * 31 + seed.charCodeAt(k)) >>> 0; h2 = (h2 * 17 + seed.charCodeAt(k) * 7) >>> 0; }
                  const nA = INTRO_NEONS[h1 % INTRO_NEONS.length];
                  let nB = INTRO_NEONS[h2 % INTRO_NEONS.length];
                  if (nB === nA) nB = INTRO_NEONS[(h2 + 3) % INTRO_NEONS.length];
                  const introWords = (lang === "es"
                    ? ["¡Vamos!", "¡Empecemos!", "¡A jugar!", "¡A romperla!", "¡Modo titán!"]
                    : ["Let's Go!", "Game On!", "Suit Up!", "Let's Cook!", "Titan Mode!"]);
                  const winWords = (lang === "es"
                    ? ["¡Lo lograste!", "¡Bien hecho!", "¡Imparable!", "¡Eres leyenda!"]
                    : ["You did it!", "Crushed it!", "Unstoppable!", "Legend!"]);
                  const word = (isIntro ? introWords : winWords)[h1 % (isIntro ? introWords.length : winWords.length)];
                  return (
                    <div style={{
                      position: "relative", zIndex: 1, textAlign: "center",
                      animation: "enterFadeIn 0.8s ease-out both", maxWidth: 360,
                    }}>
                      <div style={{
                        position: "relative", display: "inline-block", marginBottom: 18,
                      }}>
                        <div style={{
                          position: "absolute", inset: -18, borderRadius: "50%",
                          background: `radial-gradient(circle, ${nA}55 0%, transparent 70%)`,
                          filter: "blur(8px)",
                          animation: "moolieGlow 2.4s ease-in-out infinite",
                        }} />
                        <div style={{
                          fontSize: "3.4rem", position: "relative",
                          animation: "moolieBounce 1.2s ease-out, floatY 3s ease-in-out 1.2s infinite",
                          filter: `drop-shadow(0 0 16px ${nA}99)`,
                        }}>
                          {isIntro ? "🧪" : "🏆"}
                        </div>
                      </div>
                      <h1 style={{
                        fontFamily: HEADING_FONT,
                        fontSize: "2.2rem", fontWeight: 900,
                        letterSpacing: "-0.03em", lineHeight: 1,
                        margin: "0 0 6px 0",
                        background: `linear-gradient(135deg, ${nA}, #fff 50%, ${nB})`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        textShadow: `0 0 30px ${nA}55`,
                        animation: "moolieTextPop 0.8s ease-out 0.2s both",
                      }}>
                        {word}
                      </h1>
                      <p style={{
                        fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.28em",
                        color: nA, textTransform: "uppercase", marginBottom: 18,
                        textShadow: `0 0 10px ${nA}66`,
                      }}>
                        {isIntro
                          ? (lang === "es" ? "TU SESIÓN DE HOY" : "TODAY'S SESSION")
                          : (lang === "es" ? "SESIÓN COMPLETADA" : "SESSION COMPLETE")}
                      </p>

                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 14px", borderRadius: 14,
                        background: `${nB}18`, border: `1px solid ${nB}66`,
                        boxShadow: `0 0 14px ${nB}33`,
                        marginBottom: 18,
                      }}>
                        <span style={{ fontSize: "0.7rem" }}>🎙️</span>
                        <span style={{
                          fontSize: "0.55rem", fontWeight: 800, color: "#fff",
                          letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>
                          {lang === "es" ? "Mensaje de voz" : "Voice message"}
                        </span>
                      </div>
                      <div style={{
                        position: "relative",
                        background: "rgba(0,0,0,0.35)",
                        border: `1.5px solid ${nA}66`,
                        borderRadius: 22, padding: "20px 22px",
                        boxShadow: `0 0 0 1px ${nA}22, 0 0 30px ${nA}33, inset 0 1px 0 rgba(255,255,255,0.04)`,
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                      }}>
                        <span style={{
                          position: "absolute", top: -10, left: 14,
                          fontSize: "1.6rem", color: nA, fontFamily: HEADING_FONT,
                          fontWeight: 900, lineHeight: 1, textShadow: `0 0 12px ${nA}99`,
                        }}>“</span>
                        <p style={{
                          color: "#fff", fontSize: "1.05rem", fontWeight: 700,
                          lineHeight: 1.45, letterSpacing: "-0.01em",
                          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                          margin: 0,
                        }}>
                          {card.desc}
                        </p>
                      </div>
                      {selectedSubject && (
                        <div style={{
                          marginTop: 18, display: "inline-flex", alignItems: "center",
                          gap: 6, padding: "6px 14px", borderRadius: 20,
                          background: `${nA}15`, border: `1px solid ${nA}55`,
                          boxShadow: `0 0 12px ${nA}33`,
                        }}>
                          <span style={{
                            fontSize: "0.6rem", fontWeight: 800, color: "#fff",
                            letterSpacing: "0.08em", textTransform: "uppercase",
                          }}>
                            {selectedSubject}
                          </span>
                        </div>
                      )}
                      <p style={{
                        marginTop: 26, fontSize: "0.62rem", fontWeight: 700,
                        color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        animation: "floatY 2s ease-in-out infinite",
                      }}>
                        {lang === "es" ? "Desliza para continuar ↓" : "Swipe to continue ↓"}
                      </p>
                    </div>
                  );
                })()}
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
                isWide={isWideViewport}
              />
            );
          }

          const answered = slideAnswers[card.id];
          const isCorrect = answered !== undefined && answered === card.miniGame?.correctIndex;
          const setupText = card.miniGame?.contextSetup;
          const autoReveal = !setupText || (typeof setupText === "string" && setupText.length < 80);
          const effectiveRevealed = revealedSlides[card.id] || autoReveal;
          const CARD_NEONS = ["#ff2d95","#39ff14","#ff9500","#00d4ff","#bf5cff","#ffe600","#ff3366","#00ffc8","#ff6ec7","#7afcff"];
          let __h = 0; for (let __i = 0; __i < (card.id || "").length; __i++) __h = (__h * 31 + (card.id as string).charCodeAt(__i)) >>> 0;
          const cardNeon = CARD_NEONS[__h % CARD_NEONS.length];

          return (
            <div
              key={card.id}
              style={{
                width: "100%",
                height: "100dvh",
                position: "relative",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                overflow: "hidden",
                background: isWideViewport ? theme.slideBg : "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isWideViewport ? 32 : 0,
              }}
            >
              <div style={{
                position: "relative",
                width: "100%",
                maxWidth: isWideViewport ? 1024 : "100%",
                height: isWideViewport ? "75dvh" : "100dvh",
                margin: "0 auto",
                borderRadius: isWideViewport ? 28 : 0,
                transform: isWideViewport ? "rotate(-0.4deg)" : "none",
                overflow: "hidden",
                display: "flex",
                flexDirection: isWideViewport ? "row" : "column",
                boxShadow: isWideViewport
                  ? "0 30px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)"
                  : "none",
                background: "#000",
              }}>
                <div style={{
                  position: isWideViewport ? "relative" : "absolute",
                  inset: isWideViewport ? undefined : 0,
                  width: isWideViewport ? "50%" : "100%",
                  height: isWideViewport ? "100%" : "100%",
                  flexShrink: 0,
                  background: "#000",
                  overflow: "hidden",
                  zIndex: 0,
                }}>
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
                  {!isWideViewport && (
                    <div style={{
                      position: "absolute", left: 0, right: 0, bottom: 0,
                      height: "70%",
                      background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.85) 100%)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }} />
                  )}
                </div>

                <div style={{
                  position: isWideViewport ? "relative" : "absolute",
                  left: isWideViewport ? undefined : 0,
                  right: isWideViewport ? undefined : 0,
                  bottom: isWideViewport ? undefined : 0,
                  width: isWideViewport ? "50%" : "100%",
                  height: isWideViewport ? "100%" : "auto",
                  maxHeight: isWideViewport ? undefined : "70dvh",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: isWideViewport ? "center" : "flex-end",
                  alignItems: "flex-start",
                  padding: isWideViewport ? 48 : "20px 20px 32px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  background: isWideViewport ? theme.panelBg : "transparent",
                  zIndex: 2,
                  animation: "fadeIn 0.5s ease-out both",
                  gap: 4,
                  pointerEvents: "auto",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <h1
                    style={{
                      color: "#fff",
                      fontFamily: HEADING_FONT,
                      fontSize: "clamp(1.7rem, 6.6vw, 2.5rem)",
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.05,
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
                    border: `1.5px solid ${cardNeon}`,
                    boxShadow: `0 0 0 1px ${cardNeon}33, 0 8px 32px ${cardNeon}55, inset 0 1px 0 rgba(255,255,255,0.05)`,
                    width: "100%",
                    maxWidth: 400,
                    maxHeight: "60vh",
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                  }}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
                      {setupText && (
                        <>
                          <div style={{
                            color: cardNeon, fontSize: "0.55rem", fontWeight: 800,
                            letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10,
                            textShadow: `0 0 8px ${cardNeon}66`,
                          }}>{t.slide.part1[lang]}</div>
                          <p style={{
                            color: "#fff", fontSize: "clamp(0.82rem, 3.2vw, 0.96rem)", fontWeight: 700,
                            lineHeight: 1.45, marginBottom: 18,
                            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                            textAlign: "left",
                          }}>
                            {setupText}
                          </p>
                          <div style={{
                            height: 1, width: "100%", marginBottom: 14,
                            background: `linear-gradient(90deg, transparent, ${cardNeon}55, transparent)`,
                          }} />
                        </>
                      )}
                      <div style={{
                        color: cardNeon, fontSize: "0.55rem", fontWeight: 800,
                        letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10,
                        textShadow: `0 0 8px ${cardNeon}66`,
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
                              onClick={(e) => {
                                if (slideAnswers[card.id] === undefined) {
                                  setSlideAnswers((p) => ({ ...p, [card.id]: idx }));
                                  if (idx === (card.miniGame?.correctIndex ?? -1)) {
                                    setCompletedSlides((p) => [...p, card.id]);
                                    setXp((p) => p + 10);
                                    awardMoolies(COIN_REWARDS.CORRECT_ANSWER, pickHype());
                                    triggerGreenFlash();
                                    playSfx("correct");
                                    setTimeout(() => playSfx("coin"), 180);
                                    spawnReactions(e.currentTarget as HTMLElement);
                                    if (completedSlides.length + 1 >= 5) {
                                      const bq = currentData?.bossQuiz;
                                      if (bq?.actionQuestion && Array.isArray(bq.options) && bq.options.length >= 2) {
                                        setTimeout(() => setQuizUnlocked(true), 800);
                                      }
                                    }
                                  } else {
                                    playSfx("wrong");
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
            padding: "calc(env(safe-area-inset-top, 0) + 60px) 30px calc(env(safe-area-inset-bottom, 0) + 80px)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            animation: "popIn 0.35s ease-out both",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
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

          {(() => {
            const hasSharkBorder = equippedItems.includes("shark_border");
            const hasNeonHacker = equippedItems.includes("neon_hacker");
            const hasDiamondTrail = equippedItems.includes("diamond_trail");
            const hasGradientAvatar = equippedItems.includes("gradient_avatar");
            const hasLionFrame = equippedItems.includes("lion_frame");
            const hasHolographic = equippedItems.includes("holographic_border");
            const hasGoldCrown = equippedItems.includes("gold_crown");
            const hasAnyBorder = hasSharkBorder || hasNeonHacker || hasDiamondTrail || hasGradientAvatar || hasLionFrame || hasHolographic;
            const borderGrad = hasSharkBorder
              ? "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)"
              : hasNeonHacker
              ? "linear-gradient(135deg, #00ff87, #60efff, #00ff87)"
              : hasDiamondTrail
              ? "linear-gradient(135deg, #a78bfa, #60a5fa, #a78bfa)"
              : hasGradientAvatar
              ? "linear-gradient(135deg, #ff2d95, #ff9500, #39ff14, #00d4ff, #bf5cff)"
              : hasLionFrame
              ? "linear-gradient(135deg, #ff9500, #ff6b35, #ff2d00)"
              : hasHolographic
              ? "linear-gradient(135deg, #60efff, #ff2d95, #39ff14, #bf5cff)"
              : "linear-gradient(135deg, rgba(46,139,192,0.3), rgba(177,212,224,0.2))";
            const borderWidth = hasAnyBorder ? 3 : 2;
            const glowShadow = hasSharkBorder
              ? "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,165,0,0.2)"
              : hasNeonHacker
              ? "0 0 20px rgba(0,255,135,0.4), 0 0 40px rgba(96,239,255,0.2)"
              : hasDiamondTrail
              ? "0 0 20px rgba(167,139,250,0.4), 0 0 40px rgba(96,165,250,0.2)"
              : hasGradientAvatar
              ? "0 0 22px rgba(255,45,149,0.35), 0 0 44px rgba(96,239,255,0.18)"
              : hasLionFrame
              ? "0 0 22px rgba(255,149,0,0.4), 0 0 44px rgba(255,107,53,0.2)"
              : hasHolographic
              ? "0 0 22px rgba(96,239,255,0.35), 0 0 44px rgba(191,92,255,0.2)"
              : "none";
            const initials = (userName || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
            const equippedTitle = findEquippedTitle(equippedItems);

            return (
              <>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 24, marginBottom: 16, width: "100%", maxWidth: 300,
                }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ position: "relative", width: 90, height: 90 }}>
                      {hasGoldCrown && (
                        <div style={{
                          position: "absolute", top: -22, left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "1.8rem", filter: "drop-shadow(0 2px 6px rgba(255,215,0,0.5))",
                          pointerEvents: "none", zIndex: 2,
                        }}>👑</div>
                      )}
                      <div style={{
                        width: 90, height: 90, borderRadius: "50%",
                        background: borderGrad, padding: borderWidth,
                        boxShadow: glowShadow,
                        animation: hasAnyBorder ? "avatarGlow 3s ease-in-out infinite" : "none",
                      }}>
                        <div style={{
                          width: "100%", height: "100%", borderRadius: "50%",
                          background: "linear-gradient(135deg, #0c2d48, #145374)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "1.8rem", fontWeight: 900, color: "#b1d4e0",
                          letterSpacing: "0.05em",
                        }}>
                          {initials}
                        </div>
                      </div>
                    </div>
                    {equippedTitle && (
                      <div style={{
                        fontSize: "0.55rem", fontWeight: 800, color: "#b1d4e0",
                        letterSpacing: "0.05em", textAlign: "center",
                      }}>{equippedTitle.emoji} {equippedTitle.label[lang]}</div>
                    )}
                    <div style={{ fontSize: "0.45rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {lang === "es" ? "AVATAR" : "AVATAR"}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 70, background: "rgba(255,255,255,0.06)" }} />

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ position: "relative", width: 90, height: 90 }}>
                      <svg width="90" height="90" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
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
                        <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff" }}>{level}</div>
                        <div style={{ fontSize: "0.4rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>{t.profile.level[lang]}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.45rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                      {xp % (level * 50)} / {level * 50} XP
                    </div>
                  </div>
                </div>

                <style>{`
                  @keyframes avatarGlow {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(1.2); }
                  }
                `}</style>
              </>
            );
          })()}

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
              { label: t.profile.moolies[lang], val: Math.round(moolies * 100) / 100, color: "#FFD700" },
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

          {/* Module Switcher (Testing) — moved up so it isn't cut off the screen */}
          <div style={{
            width: "100%", maxWidth: 300, marginTop: 24,
            padding: "16px 18px", borderRadius: 18,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              color: "rgba(255,255,255,0.2)", fontSize: "0.5rem", fontWeight: 700,
              letterSpacing: "0.12em", marginBottom: 10, textAlign: "center",
            }}>{t.profile.switchModule[lang]}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MODULES.map((mod, idx) => {
                const prevWinsHere = idx > 0 ? (moduleProgress[MODULES[idx - 1].id] || 0) : Infinity;
                const prevUnlockAtHere = idx > 0 ? (MODULES[idx - 1].unlockThreshold || SUBJECT_UNLOCK_THRESHOLD) : 0;
                const locked = idx > 0 && prevWinsHere < prevUnlockAtHere;
                const isActive = idx === currentModuleIdx;
                return (
                  <button
                    className="ws-btn"
                    key={mod.id}
                    onClick={() => {
                      if (locked) return;
                      setCurrentModuleIdx(idx);
                      setShowProfile(false);
                      resetJourney();
                    }}
                    disabled={locked}
                    style={{
                      padding: "10px 14px", borderRadius: 12, fontFamily: FONT,
                      background: isActive
                        ? "rgba(46,139,192,0.1)"
                        : locked ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.02)",
                      border: isActive
                        ? "1px solid rgba(46,139,192,0.3)"
                        : locked ? "1px dashed rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.05)",
                      color: isActive
                        ? "#2e8bc0"
                        : locked ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.5)",
                      fontWeight: 700, fontSize: "0.7rem",
                      cursor: locked ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      opacity: locked ? 0.55 : 1,
                    }}
                  >
                    <span style={{ filter: locked ? "grayscale(0.7)" : "none" }}>{mod.icon}</span>
                    <span>{mod.name}</span>
                    {locked ? (
                      <span style={{
                        marginLeft: "auto", fontSize: "0.55rem", fontWeight: 800,
                        color: "rgba(255,255,255,0.35)", display: "inline-flex",
                        alignItems: "center", gap: 4,
                      }}>
                        🔒 {lang === "es" ? "Bloqueado" : "Locked"}
                      </span>
                    ) : isActive ? (
                      <span style={{ marginLeft: "auto", fontSize: "0.5rem", fontWeight: 800, color: "#2e8bc0" }}>{t.moduleMap.active[lang]}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Controls */}
          <div style={{
            width: "100%", maxWidth: 300, marginTop: 12,
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

            {/* SFX Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 600, fontFamily: FONT }}>
                {lang === "es" ? "Efectos" : "SFX"}
              </span>
              <button
                className="ws-btn"
                onClick={() => { setSfxEnabled((v) => { if (!v) SFX.coin(); return !v; }); }}
                style={{
                  padding: "8px 16px", borderRadius: 12, fontFamily: FONT,
                  background: sfxEnabled ? "rgba(46,139,192,0.12)" : "rgba(255,255,255,0.05)",
                  border: sfxEnabled ? "1px solid rgba(46,139,192,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  color: sfxEnabled ? "#2e8bc0" : "rgba(255,255,255,0.5)",
                  fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                  minWidth: 60, textAlign: "center",
                }}
              >
                {sfxEnabled ? "🔔 On" : "🔕 Off"}
              </button>
            </div>

            {/* Theme Picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", fontWeight: 600, fontFamily: FONT }}>
                {lang === "es" ? "Tema" : "Vibe"}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                {(Object.keys(THEMES) as ThemeId[]).map((id) => {
                  const tdef = THEMES[id];
                  const active = themeId === id;
                  return (
                    <button
                      key={id}
                      className="ws-btn"
                      onClick={() => setThemeId(id)}
                      style={{
                        padding: "10px 8px", borderRadius: 12, fontFamily: FONT,
                        background: tdef.panelBg,
                        border: active ? `2px solid ${tdef.accent}` : "1px solid rgba(255,255,255,0.08)",
                        color: "#fff", fontWeight: 700, fontSize: "0.7rem",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
                      }}
                    >
                      <span>{tdef.emoji}</span> {tdef.label}
                    </button>
                  );
                })}
              </div>
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
          userStats={{
            bossWins,
            level,
            streak,
            moolies,
            subjectsMastered: Object.values(moduleProgress).filter((v: number) => v >= SUBJECT_MASTERY_WINS).length,
            totalXp: xp,
          }}
          onPurchase={(itemId, cost) => {
            setMoolies((p) => Math.round((p - cost) * 100) / 100);
            setUnlockedItems((prev) => [...prev, itemId]);
            setEquippedItems((prev) => [...prev, itemId]);
          }}
          onEquip={(itemId) => {
            setEquippedItems((prev) =>
              prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
            );
          }}
          onEquipTitle={(titleId) => {
            setEquippedItems((prev) => {
              const withoutTitles = prev.filter((x) => !x.startsWith("title_"));
              return titleId ? [...withoutTitles, `title_${titleId}`] : withoutTitles;
            });
          }}
          onBuyConsumable={(itemId, cost) => {
            setMoolies((p) => Math.round((p - cost) * 100) / 100);
            try {
              const cur = JSON.parse(localStorage.getItem("ws_consumables") || "{}");
              cur[itemId] = (cur[itemId] || 0) + 1;
              localStorage.setItem("ws_consumables", JSON.stringify(cur));
            } catch {
              localStorage.setItem("ws_consumables", JSON.stringify({ [itemId]: 1 }));
            }
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
            xp={xp}
            level={level}
            streak={streak}
            bossWins={bossWins}
            equippedItems={equippedItems}
            themeBg={theme.hubBg}
            onOpenProfile={() => setShowProfile(true)}
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
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
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
            justifyContent: quizStarted && quizResult === null ? "flex-start" : "center",
            alignItems: "center",
            padding: quizStarted && quizResult === null ? "24px 16px calc(env(safe-area-inset-bottom, 0) + 32px) 16px" : 30,
            textAlign: "center",
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {quizResult === null ? (() => {
            const BOSS_NEONS = ["#ff2d95","#39ff14","#ff9500","#00d4ff","#bf5cff","#ffe600","#ff3366","#00ffc8","#ff6ec7","#7afcff"];
            const seed = (currentModule?.id || "boss") as string;
            let bh = 0; for (let bi = 0; bi < seed.length; bi++) bh = (bh * 31 + seed.charCodeAt(bi)) >>> 0;
            const neonA = BOSS_NEONS[bh % BOSS_NEONS.length];
            const neonB = BOSS_NEONS[(bh + 3) % BOSS_NEONS.length];
            return (
            <div style={{ animation: "fadeIn 0.5s ease-out", position: "relative" }}>
                    <style>{`
                      @keyframes bossCrownFloat { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
                      @keyframes bossOrbSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
                      @keyframes bossBtnPulse { 0%,100%{box-shadow:0 0 32px ${neonA}88, 0 0 80px ${neonB}55, 0 12px 28px rgba(0,0,0,0.5)} 50%{box-shadow:0 0 48px ${neonA}cc, 0 0 120px ${neonB}99, 0 12px 32px rgba(0,0,0,0.6)} }
                      @keyframes bossTitleGlow { 0%,100%{filter:drop-shadow(0 0 12px ${neonA}66)} 50%{filter:drop-shadow(0 0 24px ${neonA}cc) drop-shadow(0 0 40px ${neonB}66)} }
                    `}</style>
                    {!quizStarted && (
                      <div style={{
                        position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
                        width: 360, height: 360, borderRadius: "50%",
                        background: `radial-gradient(circle, ${neonA}22 0%, ${neonB}11 40%, transparent 70%)`,
                        pointerEvents: "none", animation: "bossOrbSpin 24s linear infinite",
                      }} />
                    )}
                    <h1 style={{
                      fontSize: quizStarted ? "2.4rem" : "6rem",
                      marginBottom: quizStarted ? 4 : 8,
                      position: "relative", display: "inline-block",
                      filter: `drop-shadow(0 0 ${quizStarted ? 14 : 30}px ${neonA}99)`,
                      animation: "bossCrownFloat 3.4s ease-in-out infinite",
                    }}>👑</h1>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: quizStarted ? "clamp(1.4rem, 5vw, 1.8rem)" : "clamp(2.4rem, 9vw, 3.4rem)",
                        fontWeight: 900,
                        marginBottom: quizStarted ? 8 : 10,
                        letterSpacing: "-0.04em",
                        lineHeight: 0.95,
                        fontFamily: HEADING_FONT,
                        background: `linear-gradient(135deg, ${neonA} 0%, #ffffff 50%, ${neonB} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        animation: "bossTitleGlow 2.6s ease-in-out infinite",
                        textTransform: "uppercase",
                      }}
                    >
                      {t.quiz.bossFight[lang]}
                    </h2>
                    {!quizStarted && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "6px 14px", borderRadius: 999,
                        background: `${neonA}15`, border: `1px solid ${neonA}55`,
                        marginBottom: 10,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: neonA, boxShadow: `0 0 10px ${neonA}` }} />
                        <span style={{
                          color: neonA, fontWeight: 900, fontSize: "0.62rem",
                          letterSpacing: "0.16em", textTransform: "uppercase",
                          textShadow: `0 0 10px ${neonA}88`,
                        }}>{t.quiz.demonstrateMastery[lang]}</span>
                      </div>
                    )}
                    <p style={{
                      color: "rgba(255,255,255,0.55)", fontWeight: 700, fontSize: "0.65rem",
                      letterSpacing: "0.08em",
                      marginBottom: quizStarted ? 18 : 36,
                      fontFamily: FONT,
                    }}>
                      {currentModule?.icon} {currentModule?.name?.toUpperCase()} <span style={{ color: neonB, opacity: 0.6 }}>·</span> {t.quiz.win[lang]} <span style={{ color: neonA, fontWeight: 900 }}>{currentModuleWins + 1}/{currentModule?.winsNeeded || 10}</span>
                    </p>
                    {!quizStarted ? (
                      <button
                        className="ws-btn"
                        onClick={() => setQuizStarted(true)}
                        style={{
                          padding: "20px 64px",
                          borderRadius: 999,
                          border: `2px solid ${neonA}`,
                          background: `linear-gradient(135deg, ${neonA}, ${neonB})`,
                          fontWeight: 900,
                          fontSize: "1.15rem",
                          color: "#0a0a0f",
                          cursor: "pointer",
                          fontFamily: HEADING_FONT,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          animation: "bossBtnPulse 2.2s ease-in-out infinite",
                          transition: "transform 0.15s ease",
                        }}
                        onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.96)"; }}
                        onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                        onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                      >
                        ⚡ {t.quiz.beginChallenge[lang]}
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
                    background: "rgba(0,0,0,0.55)",
                    padding: 22,
                    borderRadius: 24,
                    border: `1.5px solid ${neonA}`,
                    width: "100%",
                    maxWidth: 420,
                    margin: "0 auto",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: `0 0 0 1px ${neonA}33, 0 8px 32px ${neonA}55, 0 0 60px ${neonB}33, inset 0 1px 0 rgba(255,255,255,0.04)`,
                  }}
                >
                  {currentData.bossQuiz?.contextSetup && (
                    <>
                      <div style={{
                        color: neonA, fontSize: "0.55rem", fontWeight: 800,
                        letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, textAlign: "left",
                        textShadow: `0 0 8px ${neonA}66`,
                      }}>{t.slide.part1[lang]}</div>
                      <p style={{
                        color: "#fff", fontSize: "0.82rem", fontWeight: 700,
                        lineHeight: 1.5, marginBottom: 14, textAlign: "left",
                        textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                      }}>
                        {currentData.bossQuiz.contextSetup}
                      </p>
                      <div style={{
                        height: 1, width: "100%", marginBottom: 14,
                        background: `linear-gradient(90deg, transparent, ${neonA}55, transparent)`,
                      }} />
                    </>
                  )}
                  <div style={{
                    color: neonB, fontSize: "0.55rem", fontWeight: 800,
                    letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, textAlign: "left",
                    textShadow: `0 0 8px ${neonB}66`,
                  }}>{t.slide.part2[lang]}</div>
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "1.05rem",
                      fontWeight: 900,
                      marginBottom: 18,
                      lineHeight: 1.3,
                      letterSpacing: "-0.02em",
                      textAlign: "left",
                      fontFamily: HEADING_FONT,
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
                      const optNeons = ["#ff2d95","#39ff14","#ff9500","#00d4ff","#bf5cff","#ffe600"];
                      const optNeon = optNeons[i % optNeons.length];
                      const colors = [optNeon, optNeon, optNeon];
                      return (
                        <button
                          className="ws-btn"
                          key={i}
                          onClick={() => {
                            const win = i === (currentData.bossQuiz?.correctIndex ?? -1);
                            if (win) {
                              playSfx("correct");
                              setTimeout(() => playSfx("coin"), 220);
                              setTimeout(() => playSfx("coin"), 440);
                              setQuizResult(true);
                              setXp((p) => p + 50);
                              awardMoolies(COIN_REWARDS.QUIZ_WIN, lang === "es" ? "¡Victoria del Quiz!" : "Quiz Win!");
                              setBossWins((p) => p + 1);
                              setModuleProgress((prev) => {
                                const newProg = { ...prev };
                                const key = currentModule?.id;
                                if (!key) return prev;
                                const prevWins = newProg[key] || 0;
                                const curWins = prevWins + 1;
                                newProg[key] = curWins;
                                const unlockAt = currentModule?.unlockThreshold || SUBJECT_UNLOCK_THRESHOLD;
                                // Auto-advance to next subject the moment user crosses the unlock threshold.
                                if (prevWins < unlockAt && curWins >= unlockAt) {
                                  const willPromote = MODULES.every(
                                    (m) => (newProg[m.id] || 0) >= m.winsNeeded,
                                  );
                                  if (!willPromote) {
                                    setTimeout(() => {
                                      if (currentModuleIdx < MODULES.length - 1) {
                                        setCurrentModuleIdx((p) => p + 1);
                                      }
                                    }, 2000);
                                  }
                                  setTimeout(() => {
                                    awardMoolies(COIN_REWARDS.SUBJECT_UNLOCK, lang === "es" ? "¡Siguiente tema desbloqueado!" : "Next subject unlocked!", true);
                                  }, 600);
                                }
                                if (prevWins < SUBJECT_MASTERY_WINS && curWins >= SUBJECT_MASTERY_WINS) {
                                  setTimeout(() => {
                                    awardMoolies(COIN_REWARDS.SUBJECT_MASTERY, lang === "es" ? "¡Tema Dominado!" : "Subject Mastered!", true);
                                  }, 900);
                                  const willPromote = MODULES.every((m) => (newProg[m.id] || 0) >= m.winsNeeded);
                                  if (willPromote) {
                                    setTimeout(() => {
                                      awardMoolies(COIN_REWARDS.LEVEL_GRADUATION, lang === "es" ? "🎓 ¡Nivel Graduado!" : "🎓 Level Graduated!", true);
                                    }, 1800);
                                  }
                                }
                                return newProg;
                              });
                            } else {
                              awardMoolies(COIN_REWARDS.QUIZ_LOSS, lang === "es" ? "Premio de consolación" : "Consolation prize");
                              setBossExplanation(currentData.bossQuiz?.explanation || t.quiz.defaultBossExplanation[lang]);
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: 14,
                            borderRadius: 16,
                            border: `1.5px solid ${optNeon}88`,
                            background: `${optNeon}12`,
                            color: "#fff",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: FONT,
                            fontSize: "0.88rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            boxShadow: `0 0 14px ${optNeon}33`,
                            textAlign: "left",
                            transition: "transform 0.15s ease, box-shadow 0.2s ease",
                          }}
                          onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.98)"; }}
                          onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                          onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                        >
                          <span style={{ flex: 1, textAlign: "center" }}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            );
          })() : showQuizSummary && quizResult ? (
            <div style={{
              animation: "fadeIn 0.8s ease-out both",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", textAlign: "center", padding: 32, maxWidth: 400,
              position: "relative",
            }}>
              <style>{`
                @keyframes moolieBounce {
                  0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
                  20% { transform: translateY(-22px) scale(1.15) rotate(-8deg); }
                  40% { transform: translateY(-4px) scale(1.05) rotate(6deg); }
                  60% { transform: translateY(-14px) scale(1.1) rotate(-4deg); }
                  80% { transform: translateY(-2px) scale(1.03) rotate(2deg); }
                }
                @keyframes moolieGlow {
                  0%, 100% { box-shadow: 0 0 30px rgba(255,215,0,0.55), 0 0 60px rgba(255,165,0,0.3), 0 0 90px rgba(255,140,0,0.15); }
                  50% { box-shadow: 0 0 50px rgba(255,215,0,0.8), 0 0 90px rgba(255,165,0,0.5), 0 0 130px rgba(255,140,0,0.25); }
                }
                @keyframes moolieTextPop {
                  0% { opacity: 0; transform: scale(0.5) translateY(10px); }
                  60% { opacity: 1; transform: scale(1.2) translateY(-2px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes celebFlare {
                  0% { opacity: 0; transform: scale(0.6) rotate(-10deg); }
                  60% { opacity: 1; transform: scale(1.25) rotate(8deg); }
                  100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                @keyframes sparkleFloat {
                  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.85; }
                  50% { transform: translateY(-6px) rotate(12deg); opacity: 1; }
                }
                @keyframes warmHalo {
                  0%, 100% { opacity: 0.55; transform: scale(1); }
                  50% { opacity: 0.85; transform: scale(1.08); }
                }
              `}</style>
              <div aria-hidden style={{
                position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
                width: 360, height: 360, borderRadius: "50%", pointerEvents: "none",
                background: "radial-gradient(circle, rgba(255,200,80,0.22) 0%, rgba(255,140,40,0.08) 45%, transparent 70%)",
                animation: "warmHalo 3.5s ease-in-out infinite",
                filter: "blur(8px)", zIndex: 0,
              }} />
              <div style={{
                fontSize: "2.2rem", marginBottom: 4, letterSpacing: "0.3em",
                animation: "celebFlare 0.7s cubic-bezier(.34,1.56,.64,1) both",
                position: "relative", zIndex: 1,
              }}>
                <span style={{ display: "inline-block", animation: "sparkleFloat 2.4s ease-in-out infinite" }}>🎉</span>
                <span style={{ display: "inline-block", animation: "sparkleFloat 2.4s ease-in-out 0.4s infinite" }}>✨</span>
                <span style={{ display: "inline-block", animation: "sparkleFloat 2.4s ease-in-out 0.8s infinite" }}>🎊</span>
              </div>
              <div style={{
                width: 92, height: 92, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
                animation: "moolieBounce 1.4s cubic-bezier(.34,1.56,.64,1), moolieGlow 2s ease-in-out infinite",
                position: "relative", zIndex: 1,
              }}>
                <img src="/moolie-coin.png" alt="Moolies" style={{ width: 84, height: 84, objectFit: "contain" }} />
              </div>
              <p style={{
                fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.01em",
                background: "linear-gradient(135deg, #FFE066, #FFB347, #FF9533)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                margin: "0 0 6px 0",
                animation: "moolieTextPop 0.8s cubic-bezier(.34,1.56,.64,1) 0.3s both",
                textShadow: "0 0 28px rgba(255,180,60,0.35)",
                position: "relative", zIndex: 1,
              }}>
                {t.quiz.mooliesEarned[lang]}
              </p>
              <p style={{
                fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.3em",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                textTransform: "uppercase", marginBottom: 18,
                position: "relative", zIndex: 1,
              }}>
                ★ {lang === "es" ? "SESIÓN COMPLETADA" : "SESSION COMPLETE"} ★
              </p>
              {quizSummaryText ? (
                <>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 14px", borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,140,40,0.12))",
                    border: "1px solid rgba(255,200,80,0.4)",
                    marginBottom: 18, position: "relative", zIndex: 1,
                    boxShadow: "0 0 18px rgba(255,180,60,0.2)",
                  }}>
                    <span style={{ fontSize: "0.8rem" }}>🎙️</span>
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 800, color: "#FFD78A",
                      letterSpacing: "0.08em",
                    }}>
                      {lang === "es" ? "Mensaje de voz" : "Voice message"}
                    </span>
                  </div>
                  <p style={{
                    color: "#fff", fontSize: "1.18rem", fontWeight: 800,
                    lineHeight: 1.42, letterSpacing: "-0.02em",
                    textShadow: "0 2px 16px rgba(255,180,60,0.25), 0 2px 8px rgba(0,0,0,0.5)",
                    marginBottom: 32, position: "relative", zIndex: 1,
                  }}>
                    "{quizSummaryText}"
                  </p>
                </>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 32,
                  position: "relative", zIndex: 1,
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(255,200,80,0.3)",
                    borderTopColor: "#FFB347",
                    animation: "ldSpin 0.8s linear infinite",
                  }} />
                  <span style={{ color: "rgba(255,215,140,0.7)", fontSize: "0.65rem", fontWeight: 700 }}>
                    {lang === "es" ? "Preparando tu recap..." : "Cooking up your recap..."}
                  </span>
                </div>
              )}
              {selectedSubject && (
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  gap: 6, padding: "6px 14px", borderRadius: 20,
                  background: "rgba(255,200,80,0.1)", border: "1px solid rgba(255,200,80,0.25)",
                  marginBottom: 28, position: "relative", zIndex: 1,
                }}>
                  <span style={{
                    fontSize: "0.6rem", fontWeight: 800, color: "rgba(255,215,140,0.85)",
                    letterSpacing: "0.08em", textTransform: "uppercase",
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
                  padding: "16px 52px", borderRadius: 20, border: "none",
                  background: quizSummaryText
                    ? "linear-gradient(135deg, #FFD24A, #FF9533)"
                    : "rgba(255,180,60,0.25)",
                  fontWeight: 900, fontSize: "1rem",
                  color: quizSummaryText ? "#1a1207" : "#fff",
                  fontFamily: FONT, letterSpacing: "0.05em", cursor: "pointer",
                  boxShadow: quizSummaryText
                    ? "0 0 36px rgba(255,180,60,0.5), 0 8px 22px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)"
                    : "none",
                  transition: "all 0.4s ease", position: "relative", zIndex: 1,
                  textShadow: quizSummaryText ? "0 1px 0 rgba(255,255,255,0.3)" : "none",
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
      <RewardOverlay toasts={rewardToasts} burstKey={confettiBurst} />
      <style>{`
        @keyframes stickerPop { 0%{transform:scale(0.4) rotate(-12deg);opacity:0} 60%{transform:scale(1.2) rotate(6deg);opacity:1} 100%{transform:scale(1.05) rotate(0)} }
        @keyframes reactionFly { 0%{transform:translate(-50%,-50%) scale(0.6);opacity:0} 20%{transform:translate(calc(-50% + var(--rx,0px) * 0.3),calc(-50% - 30px)) scale(1.2);opacity:1} 100%{transform:translate(calc(-50% + var(--rx,0px)),calc(-50% - 200px)) scale(0.9);opacity:0} }
      `}</style>
      {reactions.length > 0 && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }}>
          {reactions.map((r) => (
            <span key={r.id} style={{
              position: "absolute",
              left: r.x, top: r.y,
              fontSize: "1.6rem",
              animation: "reactionFly 1.4s cubic-bezier(.2,.6,.3,1) forwards",
              // @ts-ignore
              "--rx": `${r.dx}px`,
            } as any}>{r.emoji}</span>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function RewardOverlay({ toasts, burstKey }: { toasts: Array<{ id: string; amount: number; label: string; big?: boolean }>; burstKey: number }) {
  const [pieces, setPieces] = useState<Array<{ id: string; left: number; delay: number; rot: number; color: string; emoji: string }>>([]);
  useEffect(() => {
    if (!burstKey) return;
    const colors = ["#FFD700", "#FFA500", "#2e8bc0", "#b1d4e0", "#ff7a59", "#a78bfa"];
    const emojis = ["🪙", "✨", "⭐", "💎", "🎉"];
    const burst = Array.from({ length: 36 }).map((_, i) => ({
      id: `${burstKey}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      rot: (Math.random() - 0.5) * 720,
      color: colors[i % colors.length],
      emoji: emojis[i % emojis.length],
    }));
    setPieces(burst);
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [burstKey]);

  return (
    <>
      <style>{`
        @keyframes mooliesToastIn {
          0% { opacity: 0; transform: translateY(-12px) scale(0.85); }
          15% { opacity: 1; transform: translateY(0) scale(1.06); }
          25% { transform: translateY(0) scale(1); }
          80% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(0.95); }
        }
        @keyframes mooliesToastBig {
          0% { opacity: 0; transform: translateY(-20px) scale(0.6); }
          12% { opacity: 1; transform: translateY(0) scale(1.18); }
          22% { transform: translateY(0) scale(0.98); }
          32% { transform: translateY(0) scale(1.05); }
          80% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.95); }
        }
        @keyframes confettiFall {
          0% { opacity: 0; transform: translate3d(0, -20vh, 0) rotate(0deg); }
          10% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(var(--dx, 0px), 110vh, 0) rotate(var(--rot, 360deg)); }
        }
      `}</style>
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: "none", zIndex: 9999, overflow: "hidden",
        }}
      >
        {pieces.length > 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {pieces.map((p) => (
              <div
                key={p.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${p.left}%`,
                  fontSize: "1.4rem",
                  color: p.color,
                  // @ts-ignore custom prop
                  "--rot": `${p.rot}deg`,
                  "--dx": `${(p.left - 50) * 0.6}px`,
                  animation: `confettiFall 2.8s cubic-bezier(.2,.55,.4,1) ${p.delay}s forwards`,
                  textShadow: `0 0 8px ${p.color}80`,
                } as any}
              >
                {p.emoji}
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: t.big ? "12px 22px" : "8px 16px",
                borderRadius: 999,
                background: t.big
                  ? "linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,165,0,0.18))"
                  : "rgba(8, 16, 32, 0.85)",
                border: t.big
                  ? "1px solid rgba(255,215,0,0.55)"
                  : "1px solid rgba(255,215,0,0.35)",
                boxShadow: t.big
                  ? "0 8px 32px rgba(255,180,0,0.45), 0 0 24px rgba(255,215,0,0.35)"
                  : "0 4px 18px rgba(0,0,0,0.45)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                color: "#fff",
                fontWeight: 800,
                fontSize: t.big ? "0.95rem" : "0.78rem",
                letterSpacing: "-0.01em",
                animation: `${t.big ? "mooliesToastBig" : "mooliesToastIn"} ${t.big ? "3.6s" : "2.1s"} ease-out forwards`,
              }}
            >
              <img src="/moolie-coin.png" alt="" style={{ width: t.big ? 28 : 20, height: t.big ? 28 : 20, objectFit: "contain" }} />
              <span style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 900,
              }}>
                +{t.amount}
              </span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
