import { useState, useEffect, useRef, useCallback } from "react";
import LandingPage from "./LandingPage";
import LandingPageES from "./LandingPageES";

const MODULES = [
  { id: 0, name: "Saving Basics", icon: "🐷", topic: "saving money, piggy banks, emergency funds, saving strategies", winsNeeded: 10 },
  { id: 1, name: "Smart Budgeting", icon: "📊", topic: "budgeting, tracking expenses, needs vs wants, spending plans", winsNeeded: 10 },
  { id: 2, name: "Earning Money", icon: "💰", topic: "earning income, allowance, side hustles, entrepreneurship", winsNeeded: 10 },
  { id: 3, name: "Investing 101", icon: "📈", topic: "investing basics, stocks, compound interest, index funds", winsNeeded: 10 },
  { id: 4, name: "Credit & Debt", icon: "💳", topic: "credit scores, debt management, loans, interest rates", winsNeeded: 10 },
  { id: 5, name: "Taxes & Gov", icon: "🏛️", topic: "taxes, government spending, tax filing, deductions", winsNeeded: 10 },
  { id: 6, name: "Real Estate", icon: "🏠", topic: "real estate, renting vs buying, mortgages, property value", winsNeeded: 10 },
  { id: 7, name: "Crypto & Digital", icon: "🪙", topic: "cryptocurrency, digital assets, blockchain, DeFi basics", winsNeeded: 10 },
];

const shuffleOptions = (options: string[], correctIndex: number) => {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) };
};

const coreDoctrine = `You must strictly adhere to the Moolab Financial Doctrine. Do NOT teach passive, slow-growth financial advice (like clipping coupons or relying solely on low-yield savings). Instead, focus on: 1) Calculated Risk & Volatility: Teach that market volatility (especially in high-growth or tech sectors) is an opportunity to be capitalized on, not feared. 2) Leverage & Asymmetric Upside: Teach the mechanics of using leverage (safely and smartly) to multiply gains. 3) Ownership Over Wages: Prioritize building scalable businesses, acquiring digital real estate, and owning assets over just trading time for an hourly wage. 4) Speed & Execution: Emphasize that money moves fast, and waiting on the sidelines costs you opportunity.`;

const sharkByAge: Record<string, string> = {
  Kids: "Scale doctrine for kids: Explain 'leverage' using game mechanics (using tools to multiply your loot collection speed). Explain 'volatility' as timing the market for rare digital drops. Teach ownership through building digital businesses (Roblox games, YouTube channels). Frame speed as 'first movers get the best loot.'",
  Teens: "Scale doctrine for teens: Focus on high-velocity side hustles, recognizing trends before the masses, and reinvesting profits aggressively to scale. Teach leverage through digital audience building and compounding content. Show how creators who move first on platforms capture outsized returns.",
  Adults: "Scale doctrine for young adults: Directly tackle leveraging capital, capitalizing on high-volatility assets (growth stocks, crypto, options basics), aggressive portfolio expansion, real estate leverage through low down-payment strategies, and building equity in businesses vs. trading hours for wages.",
};

const generateCards = async (ageGroup, topic?: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  let persona =
    ageGroup === "Kids"
      ? "You are The Cool Tech-Mentor for ages 8-12. Speak to them like future founders — never talk down. Use modern digital examples (Robux economy, YouTuber business models, in-app purchases) as real logic puzzles. Tone: 'I'm going to show you how the world actually works so you can win.' Be sharp, respectful, and fascinating."
      : ageGroup === "Teens"
        ? "You are The High-Performance Coach for ages 13-17. Focus on the transition from consumer to owner. Talk about the mechanics of the creator economy, digital leverage, and building real competitive edges. Tone: sharp, authentic, direct. No forced slang — just real talk about building an edge and thinking like a strategist."
        : "You are The Wealth Strategist for ages 18-21. Zero fluff. Focus on aggressive mastery of the global financial system — credit engineering, tax optimization, investment vehicles, asset allocation. Tone: elite, sophisticated, and focused on high-level execution. Think MasterClass instructor meets Wall Street analyst.";
  const ageShark = sharkByAge[ageGroup] || sharkByAge.Adults;
  const topicLine = topic ? ` All lessons MUST focus on the topic of: ${topic}.` : "";
  const prompt = `${persona} ${coreDoctrine} ${ageShark} Generate 10 unique financial lessons with diverse topics. Each lesson MUST have a completely different question - never repeat similar questions. Titles should be concise and professional (2-4 words). Descriptions should be insightful one-liners that reveal a non-obvious truth. For every question, provide an explanation field: a 2-3 sentence charismatic, highly encouraging explanation of why the correct answer is right. Speak like a beloved, brilliant professor. Start with phrases like 'Great guess, but think about it this way...' or 'Almost! Here is the secret...' or 'Good thinking — and here is why...'.${topicLine} RAW JSON ONLY. Structure: {"lessons": [{"id": 1, "title": "Title", "desc": "1-sentence", "miniGame": {"question": "Q", "options": ["A", "B"], "correctIndex": 0, "explanation": "Why correct answer is right"}}], "bossQuiz": {"question": "Final Q", "options": ["A", "B", "C"], "correctIndex": 0, "explanation": "Why correct answer is right"}}`;
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
    const cleanText = data.candidates[0].content.parts[0].text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanText);
    if (parsed?.lessons) {
      parsed.lessons = parsed.lessons.map((lesson: any) => {
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
    return null;
  }
};

const allVideos = [
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
  "https://videos.pexels.com/video-files/1093658/1093658-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1093665/1093665-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1321208/1321208-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/1437396/1437396-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/1580507/1580507-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/1851190/1851190-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2098989/2098989-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2257010/2257010-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2278095/2278095-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2516159/2516159-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2519660/2519660-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/2620041/2620041-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2759477/2759477-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2792370/2792370-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2795167/2795167-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795173/2795173-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795391/2795391-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795407/2795407-hd_1920_1080_25fps.mp4",
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
const getVideoForCard = (cardId: string): string => {
  if (!cardVideoMap.has(cardId)) cardVideoMap.set(cardId, getNextVideo());
  return cardVideoMap.get(cardId)!;
};

const bgGradients = [
  "radial-gradient(ellipse at 20% 50%, #064e3b 0%, #0f172a 60%, #020617 100%)",
  "radial-gradient(ellipse at 80% 30%, #1e3a5f 0%, #0c1524 50%, #020617 100%)",
  "radial-gradient(ellipse at 50% 80%, #312e81 0%, #0f172a 55%, #020617 100%)",
  "radial-gradient(ellipse at 30% 20%, #7c2d12 0%, #1c1917 55%, #020617 100%)",
  "radial-gradient(ellipse at 70% 60%, #065f46 0%, #0f172a 55%, #020617 100%)",
  "radial-gradient(ellipse at 40% 40%, #1e40af 0%, #0f172a 55%, #020617 100%)",
];

const studyBeats = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
];

const radioTips: Record<string, string[]> = {
  Kids: [
    "Interesting move there. Most people just spend, but you're starting to see the pattern. That's how you turn a small skin into a major asset. Let's keep that momentum.",
    "Here's something most adults don't even know. Every Robux purchase is a micro-transaction. And the company that made Roblox? They turned those tiny purchases into billions. That's the power of scale.",
    "Think about your favorite YouTuber. They didn't just get lucky. They built a system — content, audience, revenue. That's a business model. And you can learn to build one too.",
    "You just made a smart call. The difference between someone who builds wealth and someone who doesn't? Patience. One day of waiting before buying saves more money than you'd think.",
    "Every big company started as someone's idea. Apple started in a garage. The question isn't whether you can build something — it's what you'll build first.",
    "Here's the real game. When you save half of what you earn, you're not losing money — you're funding your future self. That's what smart operators do.",
    "Most people think money is about earning more. But the real secret? It's about keeping more of what you already have. That's the first rule of building wealth.",
    "Notice how games make you want to spend? That's called design psychology. Once you see it, you can't unsee it. And that awareness? That's your superpower.",
    "Fun fact — the word 'invest' comes from the Latin word for 'to clothe.' You're literally dressing your future in better options. Every smart choice layers on protection.",
    "You're already ahead of most people your age. Why? Because you're learning how money actually works instead of just spending it. That's called a strategic advantage.",
  ],
  Teens: [
    "You're reading the room perfectly. In a world of consumers, you're choosing to be an architect. That's where the real equity is. Stay focused.",
    "Here's the shift most people miss. Scrolling is consuming. Creating is owning. Every hour you spend building something — a brand, a skill, a side project — compounds over time.",
    "Compound interest isn't just a math concept. It's the single most powerful force in personal finance. Einstein reportedly called it the eighth wonder of the world. Start now and the math works in your favor.",
    "Think about this. If you invest fifty dollars a month starting today, by the time you're forty, you could be looking at six figures. Not from luck — from consistency.",
    "Credit scores are just trust scores. Banks, landlords, even some employers check them. Building yours early gives you leverage that most people don't have until their thirties.",
    "The creator economy isn't a trend — it's the new infrastructure. Whether it's content, code, or design, the people who own their output will own their income.",
    "Most financial advice tells you to cut spending. Better advice? Increase your value. Learn a skill that pays. Then the budgeting takes care of itself.",
    "Scholarships aren't charity — they're competitive awards for people who put in the work. Every application is a chance to get paid for being prepared. Don't leave that on the table.",
    "The 48-hour rule is one of the most effective tools against impulse spending. If you still want it two days later, it might be worth it. If not, you just saved yourself.",
    "Here's what separates builders from consumers — builders ask 'how was this made?' every time they see something. Start asking that question, and everything changes.",
  ],
  Adults: [
    "High-level execution. We're looking at the macro-level now. Remember — leverage is a tool, not a trap, if you know the math. Let's move to the next asset class.",
    "Your credit utilization ratio directly impacts your score. Keep it under thirty percent, but the real operators keep it under ten. That signals discipline to the system.",
    "Tax-advantaged accounts aren't optional at this level — they're essential infrastructure. Every dollar in a Roth IRA grows tax-free. That's not a suggestion, that's a strategy.",
    "Diversification isn't about spreading money thin. It's about strategic allocation across uncorrelated assets. Real estate, index funds, bonds — each serves a different function in the portfolio.",
    "Your emergency fund isn't an investment — it's insurance. Three to six months of runway means you make decisions from strength, not desperation. That changes everything.",
    "Dollar-cost averaging removes emotion from investing. Consistent contributions regardless of market conditions — that's how institutions operate, and it's available to you right now.",
    "Real estate as a first purchase isn't about the dream home. It's about acquiring an appreciating asset with leveraged capital. Think like an investor, not a homeowner.",
    "Debt has a hierarchy. High-interest consumer debt is the first target — every dollar of interest is a dollar that could have been compounding in your favor instead.",
    "Automation is the key to consistent wealth building. Set up automatic transfers to savings and investments. Remove the decision from the process, and the results compound.",
    "The gap between financial literacy and financial mastery is execution. Knowing what to do is common. Doing it consistently and systematically — that's rare, and that's where the edge is.",
  ],
};

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

function App() {
  const [appStarted, setAppStarted] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFetchingRef = useRef(false);
  const [completedSlides, setCompletedSlides] = useState([]);
  const [slideAnswers, setSlideAnswers] = useState({});
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [muted, setMuted] = useState(false);
  const [userName, setUserName] = useState(() => loadStr("name", ""));
  const [birthYear, setBirthYear] = useState(() => loadStr("birth", ""));
  const [accountType, setAccountType] = useState(() => loadStr("acctType", ""));
  const [parentName, setParentName] = useState(() => loadStr("parentName", ""));
  const [onboardStep, setOnboardStep] = useState(() => {
    const savedType = loadStr("acctType", "");
    const savedName = loadStr("name", "");
    if (savedType && savedName) return 2;
    if (savedType) return 2;
    return 0;
  });
  const [showModuleMap, setShowModuleMap] = useState(false);
  const [showParentDash, setShowParentDash] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  const [xp, setXp] = useState(() => load("xp", 0));
  const [streak, setStreak] = useState(() => load("streak", 0));
  const [level, setLevel] = useState(() => load("level", 1));
  const [bossWins, setBossWins] = useState(() => load("bossWins", 0));
  const [currentModuleIdx, setCurrentModuleIdx] = useState(() => load("modIdx", 0));
  const [moduleProgress, setModuleProgress] = useState<Record<number, number>>(() => {
    try { return JSON.parse(localStorage.getItem("ws_modProg") || "{}"); } catch { return {}; }
  });

  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [bossExplanation, setBossExplanation] = useState<string | null>(null);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [radioLive, setRadioLive] = useState(false);
  const radioSpeakingRef = useRef(false);
  const slidesScrolledRef = useRef(0);
  const lastRadioSlideRef = useRef(-1);
  const usedTipsRef = useRef<Set<number>>(new Set());
  const feedRef = useRef<HTMLDivElement | null>(null);

  const progress = Math.min((completedSlides.length / 5) * 100, 100);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [flashGreen, setFlashGreen] = useState(false);

  const currentModule = MODULES[Math.min(currentModuleIdx, MODULES.length - 1)];
  const currentModuleWins = moduleProgress[currentModuleIdx] || 0;
  const allModulesComplete = currentModuleIdx >= MODULES.length;

  useEffect(() => {
    save("xp", xp);
    save("streak", streak);
    save("level", level);
    save("bossWins", bossWins);
    save("modIdx", currentModuleIdx);
    localStorage.setItem("ws_modProg", JSON.stringify(moduleProgress));
  }, [xp, streak, level, bossWins, currentModuleIdx, moduleProgress]);

  const resetJourney = useCallback(() => {
    setLoading(true);
    setCompletedSlides([]);
    setSlideAnswers({});
    setQuizUnlocked(false);
    setQuizStarted(false);
    setQuizResult(null);
    setRevealedExplanations({});
    setBossExplanation(null);
    slidesScrolledRef.current = 0;
    lastRadioSlideRef.current = -1;
    usedTipsRef.current.clear();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    radioSpeakingRef.current = false;
    setRadioLive(false);
    const mod = MODULES[Math.min(currentModuleIdx, MODULES.length - 1)];
    generateCards(ageGroup, mod?.topic).then((data) => {
      if (data) {
        data.lessons = data.lessons.map((l) => ({
          ...l,
          id: Math.random().toString(36).substr(2, 9),
        }));
        setCurrentData(data);
      }
      setLoading(false);
    });
  }, [ageGroup, currentModuleIdx]);

  useEffect(() => {
    if (appStarted && ageGroup && accountType !== "parent") resetJourney();
  }, [appStarted, ageGroup, accountType, resetJourney]);

  const triggerRadioHost = useCallback((forceAgeGroup?: string) => {
    const ag = forceAgeGroup || ageGroup;
    if (radioSpeakingRef.current || isMutedRef.current || !ag) return;
    const tips = radioTips[ag] || radioTips.Teens;
    if (usedTipsRef.current.size >= tips.length) usedTipsRef.current.clear();
    let tipIdx: number;
    do { tipIdx = Math.floor(Math.random() * tips.length); } while (usedTipsRef.current.has(tipIdx));
    usedTipsRef.current.add(tipIdx);
    const tip = tips[tipIdx];

    radioSpeakingRef.current = true;
    setRadioLive(true);

    if (musicRef.current) musicRef.current.volume = 0.05;

    const restoreAudio = () => {
      radioSpeakingRef.current = false;
      setRadioLive(false);
      if (musicRef.current && !isMutedRef.current) musicRef.current.volume = 0.15;
    };

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(tip);
      utter.rate = 1.05;
      utter.pitch = 1.1;
      utter.volume = 0.8;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => /samantha|karen|daniel|google.*us|natural/i.test(v.name));
      if (preferred) utter.voice = preferred;
      utter.onend = restoreAudio;
      utter.onerror = restoreAudio;
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(restoreAudio, 5000);
    }
  }, [ageGroup]);

  const startSession = () => {
    const age = getAgeFromYear(birthYear);
    setAgeGroup(getAgeGroup(age));
    setAppStarted(true);
    if (accountType === "parent") return;
    const randomTrack =
      studyBeats[Math.floor(Math.random() * studyBeats.length)];
    if (!musicRef.current) {
      musicRef.current = new Audio(randomTrack);
      musicRef.current.loop = true;
      musicRef.current.volume = 0.15;
    }
    musicRef.current.play().catch(() => {});
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  };

  const handleScroll = async (e: any) => {
    if (!currentData || quizUnlocked) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(Math.min((scrollTop / maxScroll) * 100, 100));
    }

    const currentSlideIdx = Math.round(scrollTop / clientHeight);

    if (currentSlideIdx !== lastRadioSlideRef.current) {
      lastRadioSlideRef.current = currentSlideIdx;
      slidesScrolledRef.current += 1;
      if (slidesScrolledRef.current > 0 && slidesScrolledRef.current % 5 === 0) {
        triggerRadioHost();
      }
    }

    const totalSlides = currentData.lessons?.length || 0;
    const slidesFromEnd = totalSlides - currentSlideIdx;

    if (slidesFromEnd <= 3 && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setIsFetchingMore(true);
      const newData = await generateCards(ageGroup, currentModule?.topic);
      if (newData) {
        const nl = newData.lessons.slice(0, 5).map((l) => ({
          ...l,
          id: Math.random().toString(36).substr(2, 9),
        }));
        setCurrentData((p) => ({ ...p, lessons: [...p.lessons, ...nl] }));
      }
      setIsFetchingMore(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (quizResult !== true) return;
    const t = setInterval(
      () =>
        setCountdown((p) => {
          if (p <= 1) {
            clearInterval(t);
            resetJourney();
            return 10;
          }
          return p - 1;
        }),
      1000,
    );
    return () => clearInterval(t);
  }, [quizResult, resetJourney]);

  const triggerGreenFlash = () => {
    setFlashGreen(true);
    setTimeout(() => setFlashGreen(false), 300);
  };

  const speakExplanation = (text: string) => {
    if (isMutedRef.current || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /samantha|karen|daniel|google.*us|natural/i.test(v.name));
    if (preferred) utter.voice = preferred;
    if (musicRef.current) musicRef.current.volume = 0.05;
    utter.onend = () => { if (musicRef.current && !isMutedRef.current) musicRef.current.volume = 0.15; };
    utter.onerror = () => { if (musicRef.current && !isMutedRef.current) musicRef.current.volume = 0.15; };
    window.speechSynthesis.speak(utter);
  };

  if (showLanding) {
    const parentLoginHandler = () => {
      setAccountType("parent");
      saveStr("acctType", "parent");
      setOnboardStep(2);
      setShowLanding(false);
      setFadeIn(true);
      setTimeout(() => setFadeIn(false), 700);
    };
    const testAppHandler = () => {
      setShowLanding(false);
      setFadeIn(true);
      setTimeout(() => setFadeIn(false), 700);
    };
    const landingLang = new URLSearchParams(window.location.search).get("lang");
    if (landingLang === "es") {
      return <LandingPageES onParentLogin={parentLoginHandler} onTestApp={testAppHandler} />;
    }
    return <LandingPage onParentLogin={parentLoginHandler} onTestApp={testAppHandler} />;
  }

  if (!appStarted) {
    const canFinish = accountType === "parent"
      ? (parentName.trim() && userName.trim() && birthYear)
      : (userName.trim() && birthYear);

    const stepContent = () => {
      if (onboardStep === 0) {
        return (
          <>
            <div style={{fontSize:"4rem",marginBottom:8,animation:"splashFloat 3s ease-in-out infinite",filter:"drop-shadow(0 0 25px rgba(16,185,129,0.3))"}}>💸</div>
            <h1 style={{
              fontSize: "3.2rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 6px 0", textAlign: "center",
              background: "linear-gradient(135deg, #059669, #10b981, #047857)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Moolab</h1>
            <p style={{
              color: "rgba(26,60,42,0.35)", fontWeight: 800, letterSpacing: "0.2em", fontSize: "0.65rem",
              marginBottom: 6, textTransform: "uppercase",
              animation: "splashPulse 3s ease-in-out infinite",
            }}>SWIPE &middot; LEARN &middot; EARN</p>
            <p style={{ color: "rgba(26,60,42,0.4)", fontSize: "0.75rem", fontWeight: 600, maxWidth: 280, textAlign: "center", lineHeight: 1.5, marginBottom: 36 }}>
              Financial literacy for kids &amp; teens. Learn money skills through bite-sized lessons and games.
            </p>
            <button
              className="ws-btn"
              onClick={() => setOnboardStep(1)}
              style={{
                width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
                border: "none", fontFamily: FONT,
                background: "linear-gradient(135deg, #10b981, #34d399)",
                color: "#fff", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
                cursor: "pointer",
                boxShadow: "0 0 40px rgba(16,185,129,0.2), 0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              GET STARTED
            </button>
            <p style={{ color: "rgba(26,60,42,0.2)", fontSize: "0.6rem", fontWeight: 600, marginTop: 14 }}>
              Free &middot; No ads &middot; Safe for kids
            </p>
          </>
        );
      }

      if (onboardStep === 1) {
        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>👋</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#1a3c2a" }}>Who's signing up?</h2>
            <p style={{ color: "rgba(26,60,42,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 32 }}>
              This helps us personalize the experience
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
              {[
                { key: "learner", icon: "🎒", title: "I'm a Kid or Teen", desc: "I want to learn about money" },
                { key: "parent", icon: "👨‍👩‍👧", title: "I'm a Parent", desc: "Setting this up for my child" },
              ].map((opt) => (
                <button
                  className="ws-btn"
                  key={opt.key}
                  onClick={() => {
                    setAccountType(opt.key);
                    saveStr("acctType", opt.key);
                    setOnboardStep(2);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    width: "100%", padding: "18px 20px", borderRadius: 18,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(16,185,129,0.15)",
                    color: "#1a3c2a", fontFamily: FONT, cursor: "pointer", textAlign: "left",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "1.6rem" }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{opt.title}</div>
                    <div style={{ fontWeight: 500, fontSize: "0.65rem", color: "rgba(26,60,42,0.4)", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        );
      }

      if (onboardStep === 2) {
        return (
          <>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>
              {accountType === "parent" ? "👨‍👩‍👧" : "✏️"}
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em", color: "#1a3c2a" }}>
              {accountType === "parent" ? "Parent Setup" : "Tell us about you"}
            </h2>
            <p style={{ color: "rgba(26,60,42,0.4)", fontSize: "0.7rem", fontWeight: 600, marginBottom: 28 }}>
              {accountType === "parent" ? "We'll personalize lessons for your child" : "We'll pick the right level for you"}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340, marginBottom: 20 }}>
              {accountType === "parent" && (
                <div>
                  <label style={{ display: "block", color: "rgba(26,60,42,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>YOUR NAME</label>
                  <input
                    type="text"
                    placeholder="Parent's name"
                    value={parentName}
                    onChange={(e) => { setParentName(e.target.value); saveStr("parentName", e.target.value); }}
                    style={{
                      width: "100%", padding: "14px 18px", borderRadius: 14,
                      background: "rgba(255,255,255,0.7)", border: "1px solid rgba(16,185,129,0.2)",
                      color: "#1a3c2a", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                      outline: "none", caretColor: "#059669", boxSizing: "border-box",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    }}
                  />
                </div>
              )}
              <div>
                <label style={{ display: "block", color: "rgba(26,60,42,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {accountType === "parent" ? "CHILD'S NAME" : "YOUR NAME"}
                </label>
                <input
                  type="text"
                  placeholder={accountType === "parent" ? "Child's first name" : "What's your name?"}
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); saveStr("name", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(16,185,129,0.2)",
                    color: "#1a3c2a", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", caretColor: "#059669", boxSizing: "border-box",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(26,60,42,0.45)", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                  {accountType === "parent" ? "CHILD'S BIRTH YEAR" : "YOUR BIRTH YEAR"}
                </label>
                <select
                  value={birthYear}
                  onChange={(e) => { setBirthYear(e.target.value); saveStr("birth", e.target.value); }}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(16,185,129,0.2)",
                    color: birthYear ? "#1a3c2a" : "rgba(26,60,42,0.35)", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", colorScheme: "light",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(26,60,42,0.3)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="" disabled>Select year</option>
                  {Array.from({ length: 22 }, (_, i) => new Date().getFullYear() - 4 - i).map((yr) => (
                    <option key={yr} value={String(yr)} style={{ background: "#fff", color: "#1a3c2a" }}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {birthYear && (
              <div style={{
                marginBottom: 20, padding: "8px 16px", borderRadius: 12,
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                animation: "ageBtn 0.3s ease-out both",
              }}>
                <span style={{ color: "#059669", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                  {(() => {
                    const age = getAgeFromYear(birthYear);
                    const group = getAgeGroup(age);
                    if (group === "Kids") return "🌟 TECH-MENTOR TRACK — Ages 8-12";
                    if (group === "Teens") return "🔥 PERFORMANCE TRACK — Ages 13-16";
                    return "💎 STRATEGIST TRACK — Ages 17+";
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
                  ? "linear-gradient(135deg, #10b981, #34d399)"
                  : "rgba(26,60,42,0.08)",
                color: canFinish ? "#fff" : "rgba(26,60,42,0.25)",
                fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
                cursor: canFinish ? "pointer" : "default",
                boxShadow: canFinish
                  ? "0 0 40px rgba(16,185,129,0.2), 0 8px 24px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.3s ease",
              }}
            >
              START LEARNING
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
          background: "linear-gradient(160deg, #f0faf4 0%, #e6f7ed 30%, #d4f1e0 60%, #f5faf7 100%)",
          color: "#1a3c2a",
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
          @keyframes stepSlide { from{transform:translateX(30px);opacity:0} to{transform:translateX(0);opacity:1} }
          .ws-btn { transition: transform 0.12s cubic-bezier(0.25,0.46,0.45,0.94) !important; }
          .ws-btn:active { transform: scale(0.96) !important; }
        `}</style>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)",top:"15%",left:"-10%",filter:"blur(60px)",animation:"orbDrift1 10s ease-in-out infinite"}} />
        <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,0.08) 0%,transparent 70%)",bottom:"18%",right:"-8%",filter:"blur(60px)",animation:"orbDrift2 12s ease-in-out infinite"}} />

        {onboardStep > 0 && (
          <button
            className="ws-btn"
            onClick={() => setOnboardStep(onboardStep - 1)}
            style={{
              position: "absolute", top: 20, left: 20, background: "none", border: "none",
              color: "rgba(26,60,42,0.4)", fontSize: "1.4rem", cursor: "pointer", fontFamily: FONT,
              zIndex: 10,
            }}
          >←</button>
        )}

        {onboardStep > 0 && (
          <div style={{ position: "absolute", top: 28, display: "flex", gap: 6 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                width: s <= onboardStep ? 24 : 8, height: 4, borderRadius: 2,
                background: s <= onboardStep ? "#059669" : "rgba(26,60,42,0.12)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        )}

        <div key={onboardStep} style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "stepSlide 0.35s ease-out both", width: "100%" }}>
          {stepContent()}
        </div>
      </div>
    );
  }

  const totalModulesComplete = Object.values(moduleProgress).filter((w) => w >= 3).length;
  const overallPct = Math.round((totalModulesComplete / MODULES.length) * 100);

  const parentDashContent = (
    <div style={{
      width: "100vw", minHeight: "100dvh",
      background: "linear-gradient(160deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)",
      color: "#fff", fontFamily: FONT, overflowY: "auto",
    }}>
      <style>{`
        @keyframes pdFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .pd-card { animation: pdFadeIn 0.4s ease-out both; }
      `}</style>

      <div style={{ padding: "24px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>
            {accountType === "parent" ? "PARENT DASHBOARD" : "PARENT VIEW"}
          </div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
            {accountType === "parent" ? `Hi, ${parentName || "Parent"}` : "What Your Parent Sees"}
          </h1>
        </div>
        {accountType === "parent" ? (
          <button className="ws-btn" onClick={() => {
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
          }} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "8px 14px", color: "rgba(255,255,255,0.5)",
            fontFamily: FONT, fontWeight: 700, fontSize: "0.65rem", cursor: "pointer",
          }}>LOG OUT</button>
        ) : (
          <button className="ws-btn" onClick={() => setShowParentDash(false)} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: "1.2rem",
            cursor: "pointer", fontFamily: FONT,
          }}>✕</button>
        )}
      </div>

      <div style={{ padding: "20px 20px 8px" }}>
        <div style={{
          background: "rgba(6,214,160,0.04)", border: "1px solid rgba(6,214,160,0.1)",
          borderRadius: 20, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
        }} className="pd-card">
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(6,214,160,0.2), rgba(0,245,212,0.1))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem", border: "2px solid rgba(6,214,160,0.3)",
          }}>
            {userName ? userName.charAt(0).toUpperCase() : "?"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-0.01em" }}>{userName || "Learner"}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", fontWeight: 600, marginTop: 2 }}>
              {(() => {
                const age = getAgeFromYear(birthYear);
                const g = getAgeGroup(age);
                return g === "Kids" ? `Age ~${age} · Tech-Mentor Track` : g === "Teens" ? `Age ~${age} · Performance Track` : `Age ~${age} · Strategist Track`;
              })()}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#FFD93D" }}>{level}</div>
            <div style={{ fontSize: "0.45rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>LEVEL</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "TOTAL XP", val: xp, color: "#06D6A0", icon: "⚡" },
          { label: "BOSS WINS", val: bossWins, color: "#FFD93D", icon: "🏆" },
          { label: "STREAK", val: streak, color: "#FF6B6B", icon: "🔥" },
        ].map((s, i) => (
          <div key={s.label} className="pd-card" style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 18, padding: "18px 12px", textAlign: "center",
            animationDelay: `${i * 0.08}s`,
          }}>
            <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ color: s.color, fontSize: "1.6rem", fontWeight: 900, textShadow: `0 0 15px ${s.color}30` }}>{s.val}</div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 800 }}>Module Progress</div>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#06D6A0" }}>{totalModulesComplete}/{MODULES.length} Complete</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18, padding: "6px 0", overflow: "hidden",
        }}>
          {MODULES.map((mod, idx) => {
            const wins = moduleProgress[idx] || 0;
            const done = wins >= mod.winsNeeded;
            const isActive = idx === currentModuleIdx && !done;
            const pct = Math.round((wins / mod.winsNeeded) * 100);
            return (
              <div key={mod.id} className="pd-card" style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                borderBottom: idx < MODULES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                animationDelay: `${idx * 0.05}s`,
              }}>
                <div style={{ fontSize: "1.2rem", width: 28, textAlign: "center" }}>{mod.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.75rem", color: done ? "#06D6A0" : isActive ? "#fff" : "rgba(255,255,255,0.4)" }}>
                      {mod.name}
                    </span>
                    <span style={{ fontSize: "0.5rem", fontWeight: 700, color: done ? "#06D6A0" : isActive ? "#FFD93D" : "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                      {done ? "COMPLETE ✓" : isActive ? "IN PROGRESS" : `${wins}/${mod.winsNeeded}`}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 2,
                      background: done ? "#06D6A0" : isActive ? "linear-gradient(90deg, #FFD93D, #FF6B6B)" : "rgba(255,255,255,0.1)",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: 12 }}>Learning Insights</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Current Module", val: allModulesComplete ? "All Done!" : currentModule.name, sub: allModulesComplete ? "🎉" : currentModule.icon, color: "#E040FB" },
            { label: "Overall Progress", val: `${overallPct}%`, sub: `${totalModulesComplete} of ${MODULES.length}`, color: "#06D6A0" },
            { label: "XP Per Level", val: `${xp % (level * 50)}/${level * 50}`, sub: "to next level", color: "#FFD93D" },
            { label: "Sessions Played", val: bossWins + (streak > 0 ? streak : 0), sub: "total rounds", color: "#118AB2" },
          ].map((s, i) => (
            <div key={s.label} className="pd-card" style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "16px 14px",
              animationDelay: `${i * 0.08}s`,
            }}>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>{s.label.toUpperCase()}</div>
              <div style={{ color: s.color, fontSize: "1.1rem", fontWeight: 900 }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.55rem", fontWeight: 600, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 40px", textAlign: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.1)", fontSize: "0.55rem", fontWeight: 600 }}>
          Moolab · {accountType === "parent" ? "Parent Dashboard" : "Transparency View"}
        </div>
      </div>
    </div>
  );

  if (accountType === "parent" && appStarted) {
    return parentDashContent;
  }

  if (loading || !currentData)
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(160deg, #f0faf4 0%, #e6f7ed 30%, #d4f1e0 60%, #f5faf7 100%)",
          color: "#1a3c2a",
          fontFamily: FONT,
        }}
      >
        <style>{`
          @keyframes ldSpin { to{transform:rotate(360deg)} }
          @keyframes ldBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
        <div style={{ fontSize: "3rem", marginBottom: 16, animation: "ldBounce 2s ease-in-out infinite" }}>🧠</div>
        <div style={{ width:40,height:40,margin:"0 auto 16px",borderRadius:"50%",border:"3px solid rgba(16,185,129,0.12)",borderTopColor:"#059669",animation:"ldSpin 0.7s linear infinite" }} />
        <p style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em", background:"linear-gradient(90deg,#059669,#10b981)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
          Curating your feed...
        </p>
      </div>
    );

  return (
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
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes vidFade { from{opacity:0;transform:scale(1.04)} to{opacity:1;transform:scale(1)} }
        @keyframes arenaPulse {
          0%, 100% { background: radial-gradient(ellipse at center, rgba(6,214,160,0.06) 0%, #050505 60%, #020202 100%); }
          50% { background: radial-gradient(ellipse at center, rgba(6,214,160,0.12) 0%, #080808 55%, #020202 100%); }
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
        @keyframes greenFlash {
          0% { box-shadow: inset 0 0 0 3px rgba(6,214,160,0.9), 0 0 30px rgba(6,214,160,0.4); }
          100% { box-shadow: inset 0 0 0 0px rgba(6,214,160,0), 0 0 0px rgba(6,214,160,0); }
        }
        .ws-btn { transition: transform 0.12s cubic-bezier(0.25,0.46,0.45,0.94) !important; }
        .ws-btn:active { transform: scale(0.96) !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* GREEN FLASH HAPTIC OVERLAY */}
      {flashGreen && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          zIndex: 999, pointerEvents: "none", borderRadius: 0,
          animation: "greenFlash 0.3s ease-out forwards",
        }} />
      )}

      {/* GLOW LINE — left edge scroll progress */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: 3, height: "100%",
        zIndex: 15, pointerEvents: "none",
        background: "rgba(255,255,255,0.03)",
      }}>
        <div style={{
          width: "100%",
          height: `${scrollProgress}%`,
          background: "linear-gradient(180deg, #06D6A0, #00F5D4, #118AB2)",
          borderRadius: "0 0 2px 0",
          transition: "height 0.3s ease-out",
          boxShadow: scrollProgress > 0 ? "0 0 8px rgba(6,214,160,0.5), 0 0 20px rgba(6,214,160,0.2)" : "none",
          animation: scrollProgress > 0 ? "glowPulse 2s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* HEADER HUD */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          padding: "40px 20px 20px",
          zIndex: 10,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              className="ws-btn"
              onClick={() => setShowProfile(true)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "10px 16px",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.75rem",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                fontFamily: FONT,
                letterSpacing: "0.04em",
              }}
            >
              💸 {userName || "PROFILE"}
            </button>
            <button
              className="ws-btn"
              onClick={() => setShowParentDash(true)}
              style={{
                background: "rgba(224,64,251,0.06)",
                border: "1px solid rgba(224,64,251,0.15)",
                borderRadius: 14,
                padding: "10px 12px",
                color: "#E040FB",
                fontWeight: 800,
                fontSize: "0.75rem",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                fontFamily: FONT,
              }}
            >
              👪
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {radioLive && (
              <div style={{
                background: "rgba(255,40,40,0.15)",
                border: "1px solid rgba(255,60,60,0.4)",
                borderRadius: 12,
                padding: "6px 12px",
                display: "flex", alignItems: "center", gap: 6,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                animation: "radioGlow 1.5s ease-in-out infinite",
              }}>
                <span style={{ fontSize: "0.8rem" }}>🎙️</span>
                <span style={{
                  color: "#ff4444",
                  fontWeight: 800,
                  fontSize: "0.6rem",
                  letterSpacing: "0.08em",
                  fontFamily: FONT,
                  textShadow: "0 0 8px rgba(255,68,68,0.5)",
                }}>LIVE</span>
              </div>
            )}
            <button
              className="ws-btn"
              onClick={() => {
                const newMuted = !isMuted;
                isMutedRef.current = newMuted;
                if (musicRef.current) {
                  if (newMuted) { musicRef.current.volume = 0; musicRef.current.pause(); }
                  else { musicRef.current.volume = 0.15; musicRef.current.play().catch(() => {}); }
                }
                if (newMuted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                if (newMuted) {
                  radioSpeakingRef.current = false;
                  setRadioLive(false);
                }
                setIsMuted(newMuted);
              }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "8px 10px",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                fontSize: "1rem",
                lineHeight: 1,
              }}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
            <div style={{
              padding: "5px 10px", borderRadius: 10,
              background: "rgba(255,217,61,0.08)", border: "1px solid rgba(255,217,61,0.15)",
            }}>
              <span style={{ color: "#FFD93D", fontWeight: 800, fontSize: "0.65rem" }}>LVL {level}</span>
            </div>
            <span style={{
              color: "#06D6A0", fontWeight: 900, fontSize: "0.75rem",
              textShadow: "0 0 12px rgba(6,214,160,0.4)",
              letterSpacing: "0.02em",
            }}>
              {xp} XP
            </span>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: 4,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 2,
            marginTop: 14,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: progress >= 100
                ? "linear-gradient(90deg, #FFD93D, #FF6B6B, #E040FB)"
                : "linear-gradient(90deg, #06D6A0, #00F5D4)",
              borderRadius: 2,
              transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: progress > 0 ? "0 0 10px rgba(6,214,160,0.4)" : "none",
            }}
          />
        {/* Module indicator */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowModuleMap(true); }}
          style={{
            marginTop: 10, display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "6px 12px", cursor: "pointer",
            pointerEvents: "auto", width: "fit-content",
          }}
        >
          <span style={{ fontSize: "0.9rem" }}>{currentModule?.icon}</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.08em" }}>
            MODULE {currentModuleIdx + 1}: {currentModule?.name?.toUpperCase()}
          </span>
          <span style={{
            color: "#06D6A0", fontWeight: 800, fontSize: "0.55rem",
            marginLeft: 4, padding: "2px 6px", borderRadius: 6,
            background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.2)",
          }}>
            {currentModuleWins}/{currentModule?.winsNeeded || 10}
          </span>
        </button>
        </div>
      </div>

      {/* MODULE MAP */}
      {showModuleMap && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(5,5,10,0.97)", zIndex: 200,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "50px 24px 30px", overflowY: "auto",
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
            background: "linear-gradient(135deg, #06D6A0, #00F5D4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>MODULE MAP</h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 600, marginBottom: 24, letterSpacing: "0.1em" }}>
            {Object.entries(moduleProgress).filter(([, v]) => v >= 3).length}/{MODULES.length} COMPLETED
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
                    ? "rgba(6,214,160,0.06)"
                    : isComplete
                      ? "rgba(255,217,61,0.04)"
                      : "rgba(255,255,255,0.02)",
                  border: isCurrent
                    ? "1px solid rgba(6,214,160,0.25)"
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
                      : "rgba(6,214,160,0.04)",
                    transition: "width 0.5s ease",
                  }} />

                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      background: isComplete
                        ? "rgba(255,217,61,0.12)"
                        : isCurrent
                          ? "rgba(6,214,160,0.12)"
                          : "rgba(255,255,255,0.04)",
                      border: isComplete
                        ? "1px solid rgba(255,217,61,0.3)"
                        : isCurrent
                          ? "1px solid rgba(6,214,160,0.25)"
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
                              : "linear-gradient(90deg, #06D6A0, #00F5D4)",
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
                        background: "rgba(6,214,160,0.15)", border: "1px solid rgba(6,214,160,0.3)",
                        fontSize: "0.5rem", fontWeight: 800, color: "#06D6A0",
                        letterSpacing: "0.08em", flexShrink: 0,
                      }}>ACTIVE</div>
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
        }}
      >
        {currentData.lessons.map((card, i) => {
          const answered = slideAnswers[card.id];
          const isCorrect = answered !== undefined && answered === card.miniGame.correctIndex;

          return (
            <div
              key={card.id}
              style={{
                height: "100dvh",
                width: "100%",
                position: "relative",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                background: "#080808",
                overflow: "hidden",
              }}
            >
              <div
                key={`bg-${card.id}`}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  background: bgGradients[i % bgGradients.length],
                }}
              />
              <video
                key={`v-${card.id}`}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.35,
                  animation: "vidFade 0.8s ease-out both",
                }}
              >
                <source src={getVideoForCard(card.id)} type="video/mp4" />
              </video>

              {/* Dark gradient overlay */}
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.95) 100%)",
                zIndex: 1,
              }} />

              <div
                style={{
                  position: "absolute",
                  bottom: 55,
                  left: 20,
                  width: "calc(100% - 40px)",
                  zIndex: 2,
                  animation: "fadeIn 0.5s ease-out both",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(card.title)}`}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "transparent",
                      border: "2px solid rgba(6,214,160,0.4)",
                      boxShadow: "0 0 15px rgba(6,214,160,0.15)",
                    }}
                  />
                  <h1
                    style={{
                      color: "#fff",
                      fontSize: "1.8rem",
                      fontWeight: 900,
                      margin: 0,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                      textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                    }}
                  >
                    {card.title}
                  </h1>
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    marginBottom: 20,
                    fontSize: "1rem",
                    lineHeight: 1.5,
                    fontWeight: 600,
                    textShadow: "0 1px 8px rgba(0,0,0,0.7)",
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
                  }}
                >
                  <p
                    style={{
                      color: "#fff",
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      marginBottom: 16,
                      lineHeight: 1.4,
                      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    {card.miniGame.question}
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    {card.miniGame.options.map((opt, idx) => {
                      const isAnswered = answered !== undefined;
                      const isSelected = answered === idx;
                      const isRight = idx === card.miniGame.correctIndex;

                      let bg = "rgba(255,255,255,0.07)";
                      let border = "1px solid rgba(255,255,255,0.08)";
                      if (isAnswered && isSelected) {
                        if (isRight) { bg = "rgba(6,214,160,0.2)"; border = "1px solid rgba(6,214,160,0.5)"; }
                        else { bg = "rgba(231,111,81,0.2)"; border = "1px solid rgba(231,111,81,0.5)"; }
                      } else if (isAnswered && isRight) {
                        bg = "rgba(6,214,160,0.08)"; border = "1px solid rgba(6,214,160,0.2)";
                      }

                      return (
                        <button
                          className="ws-btn"
                          key={idx}
                          onClick={() => {
                            if (slideAnswers[card.id] === undefined) {
                              setSlideAnswers((p) => ({ ...p, [card.id]: idx }));
                              if (idx === card.miniGame.correctIndex) {
                                setCompletedSlides((p) => [...p, card.id]);
                                setXp((p) => p + 10);
                                triggerGreenFlash();
                                setTimeout(() => triggerRadioHost(), 1200);
                                if (completedSlides.length + 1 >= 5)
                                  setTimeout(() => setQuizUnlocked(true), 800);
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
                      color: "#06D6A0",
                      letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center",
                    }}>
                      +10 XP — WELL PLAYED
                    </div>
                  )}
                  {answered !== undefined && !isCorrect && (
                    <div style={{
                      marginTop: 14,
                      background: "linear-gradient(135deg, rgba(6,214,160,0.08), rgba(0,245,212,0.06))",
                      border: "1px solid rgba(6,214,160,0.2)",
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
                          color: "#06D6A0", fontWeight: 800, fontSize: "0.65rem",
                          letterSpacing: "0.1em", textTransform: "uppercase",
                        }}>INSIGHT UNLOCKED</span>
                      </div>
                      {!revealedExplanations[card.id] ? (
                        <button
                          className="ws-btn"
                          onClick={() => setRevealedExplanations(p => ({ ...p, [card.id]: true }))}
                          style={{
                            width: "100%", padding: "10px 16px", borderRadius: 12,
                            background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.25)",
                            color: "#06D6A0", fontWeight: 700, fontSize: "0.78rem",
                            cursor: "pointer", fontFamily: FONT,
                          }}
                        >
                          🧠 Tap to understand why
                        </button>
                      ) : (
                        <div>
                          <p style={{
                            color: "rgba(255,255,255,0.85)", fontSize: "0.82rem",
                            lineHeight: 1.55, fontWeight: 500, margin: "0 0 10px 0",
                          }}>
                            {card.miniGame.explanation || "The correct answer builds on a key principle. Review the lesson to see the full picture."}
                          </p>
                          <button
                            className="ws-btn"
                            onClick={() => speakExplanation(card.miniGame.explanation || "Review the lesson to understand this concept better.")}
                            style={{
                              padding: "6px 14px", borderRadius: 10,
                              background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.2)",
                              color: "#06D6A0", fontWeight: 700, fontSize: "0.68rem",
                              cursor: "pointer", fontFamily: FONT,
                              display: "flex", alignItems: "center", gap: 6,
                            }}
                          >
                            <span style={{ fontSize: "0.8rem" }}>▶</span> Listen
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
                  <stop offset="0%" stopColor="#06D6A0" />
                  <stop offset="100%" stopColor="#00F5D4" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#fff" }}>{level}</div>
              <div style={{ fontSize: "0.45rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>LEVEL</div>
            </div>
          </div>

          <h2 style={{
            color: "#fff", fontSize: "1.6rem", fontWeight: 900,
            background: "linear-gradient(135deg, #06D6A0, #00F5D4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 6px 0",
          }}>
            {userName ? userName.toUpperCase() : "YOUR PROFILE"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", fontWeight: 600, margin: "0 0 30px 0" }}>
            {xp} / {level * 50} XP to next level
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
              { label: "TOTAL XP", val: xp, color: "#06D6A0" },
              { label: "BOSS WINS", val: bossWins, color: "#FFD93D" },
              { label: "STREAK", val: `${streak}🔥`, color: "#FF6B6B" },
              { label: "MODULE", val: Math.floor(bossWins / 3) + 1, color: "#E040FB" },
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

          {/* Module Switcher (Testing) */}
          <div style={{
            width: "100%", maxWidth: 300, marginTop: 24,
            padding: "16px 18px", borderRadius: 18,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              color: "rgba(255,255,255,0.2)", fontSize: "0.5rem", fontWeight: 700,
              letterSpacing: "0.12em", marginBottom: 10, textAlign: "center",
            }}>SWITCH MODULE (DEV)</div>
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
                    background: idx === currentModuleIdx ? "rgba(6,214,160,0.1)" : "rgba(255,255,255,0.02)",
                    border: idx === currentModuleIdx ? "1px solid rgba(6,214,160,0.3)" : "1px solid rgba(255,255,255,0.05)",
                    color: idx === currentModuleIdx ? "#06D6A0" : "rgba(255,255,255,0.5)",
                    fontWeight: 700, fontSize: "0.7rem", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span>{mod.icon}</span>
                  <span>{mod.name}</span>
                  {idx === currentModuleIdx && (
                    <span style={{ marginLeft: "auto", fontSize: "0.5rem", fontWeight: 800, color: "#06D6A0" }}>ACTIVE</span>
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

      {/* ARENA QUIZ */}
      {quizUnlocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#050505",
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
              ? "radial-gradient(ellipse at center, rgba(6,214,160,0.04) 0%, #050505 50%, #020202 100%)"
              : "transparent",
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
              <h1 style={{ fontSize: "5rem", marginBottom: 10, filter: "drop-shadow(0 0 30px rgba(255,217,61,0.4))" }}>👑</h1>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "2.6rem",
                  fontWeight: 900,
                  marginBottom: 6,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #FFD93D, #FF6B6B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BOSS FIGHT
              </h2>
              <p style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", marginBottom: 6 }}>
                DEMONSTRATE MASTERY
              </p>
              <p style={{ color: "rgba(255,255,255,0.2)", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.06em", marginBottom: 36 }}>
                {currentModule?.icon} {currentModule?.name?.toUpperCase()} &middot; WIN {currentModuleWins + 1}/{currentModule?.winsNeeded || 10}
              </p>
              {!quizStarted ? (
                <button
                  className="ws-btn"
                  onClick={() => setQuizStarted(true)}
                  style={{
                    padding: "20px 60px",
                    borderRadius: 20,
                    border: "none",
                    background: "linear-gradient(135deg, #FFD93D, #FF6B6B)",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    boxShadow: "0 0 40px rgba(255,217,61,0.25), 0 8px 24px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                    fontFamily: FONT,
                    letterSpacing: "0.06em",
                  }}
                >
                  BEGIN CHALLENGE
                </button>
              ) : bossExplanation ? (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(6,214,160,0.06), rgba(0,245,212,0.04))",
                    padding: 30,
                    borderRadius: 28,
                    border: "1px solid rgba(6,214,160,0.2)",
                    width: "100%",
                    maxWidth: 380,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(6,214,160,0.08)",
                    animation: "popIn 0.5s ease-out",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: 12, filter: "drop-shadow(0 0 20px rgba(6,214,160,0.4))" }}>🧠</div>
                  <h3 style={{
                    color: "#06D6A0", fontSize: "1.3rem", fontWeight: 900,
                    letterSpacing: "0.04em", marginBottom: 6,
                  }}>HOLD UP</h3>
                  <p style={{
                    color: "rgba(6,214,160,0.6)", fontSize: "0.68rem", fontWeight: 700,
                    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20,
                  }}>LET'S BREAK THIS DOWN</p>
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
                      background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.25)",
                      color: "#06D6A0", fontWeight: 700, fontSize: "0.75rem",
                      cursor: "pointer", fontFamily: FONT,
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <span>▶</span> Listen to explanation
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
                      background: "linear-gradient(135deg, #06D6A0, #00F5D4)",
                      fontWeight: 900, color: "#000", fontSize: "1rem", fontFamily: FONT,
                      letterSpacing: "0.04em", cursor: "pointer",
                      boxShadow: "0 0 30px rgba(6,214,160,0.25), 0 6px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    Got it! Let's keep scrolling
                  </button>
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
                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      marginBottom: 24,
                      lineHeight: 1.35,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {currentData.bossQuiz.question}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {currentData.bossQuiz.options.map((opt, i) => {
                      const colors = ["#FF6B6B", "#FFD93D", "#00F5D4"];
                      return (
                        <button
                          className="ws-btn"
                          key={i}
                          onClick={() => {
                            const win = i === currentData.bossQuiz.correctIndex;
                            if (win) {
                              setQuizResult(true);
                              setXp((p) => p + 50);
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
                              setBossExplanation(currentData.bossQuiz.explanation || "The correct answer connects to a deeper principle. Review the lessons to strengthen your understanding before the next attempt.");
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
          ) : (() => {
            const winTitles = [
              { emoji: "🏆", title: "MASTERY ACHIEVED", sub: "Exceptional performance. That's how it's done." },
              { emoji: "⚡", title: "FLAWLESS EXECUTION", sub: "Precision under pressure. Well played." },
              { emoji: "💎", title: "ELITE STATUS", sub: "You've proven your understanding at the highest level." },
              { emoji: "🚀", title: "BREAKTHROUGH", sub: "That's the kind of thinking that builds real wealth." },
              { emoji: "👑", title: "CERTIFIED", sub: "Knowledge confirmed. You've earned this." },
              { emoji: "🎯", title: "PRECISION", sub: "Sharp analysis, sharp results." },
              { emoji: "💰", title: "STRATEGIC WIN", sub: "Smart decisions lead to smart outcomes." },
              { emoji: "🌟", title: "OUTSTANDING", sub: "Consistently excellent. Keep compounding." },
              { emoji: "🧠", title: "DEEP MASTERY", sub: "You see what others miss. That's the edge." },
              { emoji: "🔥", title: "TOP PERFORMER", sub: "Results speak for themselves." },
            ];
            const loseTitles = [
              { emoji: "📊", title: "REVIEW & RETURN", sub: "Revisit the material. The concepts are worth mastering." },
              { emoji: "🔄", title: "NOT YET", sub: "Close, but mastery requires precision. Go again." },
              { emoji: "💪", title: "RESILIENCE", sub: "Every expert failed first. The next attempt is sharper." },
              { emoji: "📖", title: "STUDY MODE", sub: "Revisit the lessons with fresh eyes. You'll see it differently." },
              { emoji: "🎯", title: "RECALIBRATE", sub: "Adjust your approach and come back stronger." },
            ];
            const pick = quizResult
              ? winTitles[Math.floor(Math.random() * winTitles.length)]
              : loseTitles[Math.floor(Math.random() * loseTitles.length)];
            const shareText = quizResult
              ? `${pick.emoji} Just achieved mastery in ${currentModule?.name} on Moolab. Level ${level} | ${xp} XP | ${bossWins} Wins. Building real financial intelligence.`
              : `Sharpening my financial skills on Moolab. ${currentModule?.name} — challenging but worth mastering. Level ${level} | ${xp} XP.`;
            const shareUrl = "https://moolab.app";
            const encodedText = encodeURIComponent(shareText);
            const encodedUrl = encodeURIComponent(shareUrl);
            return (
            <div style={{ animation: "popIn 0.5s ease-out" }}>
              <h1 style={{
                fontSize: "5.5rem",
                filter: quizResult
                  ? "drop-shadow(0 0 40px rgba(255,217,61,0.5))"
                  : "drop-shadow(0 0 40px rgba(255,107,107,0.5))",
              }}>{pick.emoji}</h1>
              <h2 style={{
                color: "#fff", fontSize: "2.6rem", fontWeight: 900,
                letterSpacing: "-0.03em", margin: "0 0 6px 0",
                background: quizResult
                  ? "linear-gradient(135deg, #FFD93D, #FFFFFF, #FFD93D)"
                  : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {pick.title}
              </h2>
              <p style={{
                color: quizResult ? "rgba(255,255,255,0.75)" : "rgba(255,107,107,0.7)",
                margin: "8px 0 20px 0", fontWeight: 700, fontSize: "0.85rem",
                textShadow: "0 1px 6px rgba(0,0,0,0.5)",
              }}>
                {quizResult ? `${pick.sub} +50 XP awarded.` : pick.sub}
              </p>

              {quizResult && (
                <div style={{ margin: "0 0 20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "relative", width: 56, height: 56, marginBottom: 4 }}>
                    <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#06D6A0" strokeWidth="3"
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
                  <button className="ws-btn" onClick={resetJourney} style={{
                    padding: 20, borderRadius: 18, border: "none",
                    background: "linear-gradient(135deg, #06D6A0, #00F5D4)",
                    fontWeight: 900, color: "#000", fontSize: "1rem", fontFamily: FONT,
                    letterSpacing: "0.04em", cursor: "pointer",
                    boxShadow: "0 0 30px rgba(6,214,160,0.25), 0 6px 20px rgba(0,0,0,0.4)",
                  }}>NEXT QUEST 🚀</button>
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
                  }}>TRY AGAIN 💪</button>
                )}
              </div>

              <div style={{
                marginTop: 28, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.08)",
                width: "100%",
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14,
                }}>Share your progress</p>
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
}

export default App;
