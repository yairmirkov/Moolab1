import { useState, useEffect, useRef, useCallback } from "react";

const generateCards = async (ageGroup) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  let tone = "";
  if (ageGroup === "8-12") {
    tone = "You are a fun older sibling. Simple words, many emojis.";
  } else if (ageGroup === "13-16") {
    tone = "You are a Gen-Z side-hustler. Fast-paced, slang, real talk.";
  } else {
    tone = "You are a Wall Street Shark. Investing, wealth, and leverage.";
  }

  const prompt = `${tone}
  Generate 4 unique financial lessons. Return ONLY raw JSON. No markdown.
  STRICT UI RULES: 
  - Each question must have EITHER 2 or 3 options (AI choice).
  - Each option must be MAX 3 words. Short & punchy.
  - Never generate 4 options.
  Structure: { "lessons": [{ "id": 1, "title": "Title", "desc": "1-sentence", "color": "#hex", "miniGame": { "question": "Q", "options": ["Option 1", "Option 2"], "correctIndex": 0 } }], "bossQuiz": { "question": "Final Q", "options": ["Option 1", "Option 2", "Option 3"], "correctIndex": 0 } }`;

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
    let aiText = data.candidates[0].content.parts[0].text;
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(aiText);
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

const pxVid = (id: number, fps = 25) =>
  `https://videos.pexels.com/video-files/${id}/${id}-sd_640_360_${fps}fps.mp4`;

const videoBank: { keywords: string[]; url: string }[] = [
  { keywords: ["money", "dollar", "cash", "earn", "income", "wage", "pay", "salary"], url: pxVid(3943716, 25) },
  { keywords: ["save", "saving", "piggy", "jar", "emergency", "rainy", "deposit"], url: pxVid(5537791, 30) },
  { keywords: ["invest", "stock", "market", "trade", "portfolio", "growth", "compound"], url: pxVid(7579958, 30) },
  { keywords: ["budget", "plan", "track", "expense", "spending", "cost"], url: pxVid(5377325, 30) },
  { keywords: ["shop", "buy", "purchase", "store", "consumer", "want", "retail"], url: pxVid(5632399, 25) },
  { keywords: ["coin", "change", "penny", "cent", "quarter", "gold"], url: pxVid(3945079, 25) },
  { keywords: ["credit", "card", "debit", "swipe", "debt", "loan", "borrow"], url: pxVid(4386431, 30) },
  { keywords: ["business", "entrepreneur", "company", "startup", "hustle", "side"], url: pxVid(3184292, 30) },
  { keywords: ["toy", "game", "play", "fun", "kid", "child"], url: pxVid(3209037, 25) },
  { keywords: ["house", "home", "rent", "mortgage", "apartment", "property"], url: pxVid(2510363, 25) },
  { keywords: ["food", "eat", "grocery", "meal", "snack", "lunch"], url: pxVid(3298572, 25) },
  { keywords: ["school", "education", "learn", "college", "book", "tuition"], url: pxVid(5198148, 25) },
  { keywords: ["crypto", "bitcoin", "digital", "blockchain", "nft"], url: pxVid(4992549, 25) },
  { keywords: ["bank", "account", "withdraw", "atm", "check"], url: pxVid(6266398, 30) },
  { keywords: ["goal", "target", "dream", "future", "retire", "freedom", "success"], url: pxVid(3129671, 30) },
  { keywords: ["tax", "government", "refund", "deduction"], url: pxVid(6774733, 30) },
  { keywords: ["insurance", "protect", "risk", "safety", "secure"], url: pxVid(3195394, 25) },
  { keywords: ["allowance", "chore", "parent", "family", "gift"], url: pxVid(4812201, 25) },
  { keywords: ["donate", "charity", "give", "help", "generous", "share"], url: pxVid(4475523, 25) },
  { keywords: ["work", "job", "career", "office", "profession"], url: pxVid(4063586, 25) },
  { keywords: ["rich", "wealth", "luxury", "expensive", "premium", "diamond"], url: pxVid(3163534, 30) },
  { keywords: ["interest", "rate", "percent", "apy", "yield", "return"], url: pxVid(2795167, 25) },
  { keywords: ["need", "want", "smart", "wise", "decision", "choice"], url: pxVid(857195, 25) },
  { keywords: ["profit", "revenue", "gain", "win", "reward", "bonus"], url: pxVid(852164, 25) },
  { keywords: ["price", "value", "worth", "deal", "bargain", "discount"], url: pxVid(856973, 25) },
  { keywords: ["wallet", "pocket", "bill", "receipt", "tip"], url: pxVid(4763824, 30) },
  { keywords: ["team", "group", "partner", "network", "connect"], url: pxVid(1851190, 25) },
  { keywords: ["phone", "app", "tech", "computer", "online", "digital"], url: pxVid(5765826, 25) },
  { keywords: ["math", "number", "calculate", "count", "add", "subtract"], url: pxVid(2611150, 30) },
  { keywords: ["rule", "lesson", "strategy", "method", "system", "habit"], url: pxVid(3571264, 25) },
];

const moduleSubjects = [
  "The Basics", "Budgeting 101", "Smart Saving", "Investing 101",
  "Credit & Debt", "Entrepreneurship", "Taxes & Gov", "Wealth Building",
  "Side Hustles", "Real Estate", "Crypto Basics", "Money Mindset",
];

const slideAccents = [
  { c1: "#FF6B6B", c2: "#FF8E53" },
  { c1: "#00F5D4", c2: "#7B61FF" },
  { c1: "#FFD93D", c2: "#FF6B6B" },
  { c1: "#06D6A0", c2: "#118AB2" },
  { c1: "#E040FB", c2: "#536DFE" },
  { c1: "#00B4D8", c2: "#48CAE4" },
  { c1: "#FF9F1C", c2: "#FF6B6B" },
  { c1: "#7B61FF", c2: "#00F5D4" },
];

function loadPersisted(key: string, fallback: number): number {
  try { const v = localStorage.getItem(`ws_${key}`); return v ? parseInt(v, 10) : fallback; } catch { return fallback; }
}
function savePersisted(key: string, val: number) {
  try { localStorage.setItem(`ws_${key}`, String(val)); } catch {}
}

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

  const [xp, setXp] = useState(() => loadPersisted("xp", 0));
  const [streak, setStreak] = useState(() => loadPersisted("streak", 0));
  const [level, setLevel] = useState(() => loadPersisted("level", 1));
  const [bossWins, setBossWins] = useState(() => loadPersisted("bossWins", 0));
  const [showProfile, setShowProfile] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSlideRef = useRef(0);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const mediaMap = useRef(new Map<string, { videoUrl: string; songNum: number }>());
  const usedVideoIndices = useRef(new Set<number>());
  const songCounter = useRef(0);

  const progress = Math.min((completedSlides.length / 3) * 100, 100);
  const moduleNum = Math.floor(bossWins / 3) + 1;
  const moduleProgress = bossWins % 3;
  const currentSubject = moduleSubjects[(moduleNum - 1) % moduleSubjects.length];
  const xpForNextLevel = level * 50;
  const levelProgress = Math.min((xp % xpForNextLevel) / xpForNextLevel * 100, 100);

  useEffect(() => { savePersisted("xp", xp); }, [xp]);
  useEffect(() => { savePersisted("streak", streak); }, [streak]);
  useEffect(() => { savePersisted("level", level); }, [level]);
  useEffect(() => { savePersisted("bossWins", bossWins); }, [bossWins]);

  useEffect(() => {
    if (xp > 0 && xp >= level * 50) {
      setLevel((prev) => { const next = prev + 1; return next; });
    }
  }, [xp, level]);

  function assignMedia(lessonId: string, title: string, desc: string) {
    if (mediaMap.current.has(lessonId)) return mediaMap.current.get(lessonId)!;

    const text = `${title} ${desc}`.toLowerCase();
    let bestIdx = -1;
    let bestScore = 0;

    for (let i = 0; i < videoBank.length; i++) {
      if (usedVideoIndices.current.has(i)) continue;
      let score = 0;
      for (const kw of videoBank[i].keywords) {
        if (text.includes(kw)) score++;
      }
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }

    if (bestIdx === -1) {
      for (let i = 0; i < videoBank.length; i++) {
        if (!usedVideoIndices.current.has(i)) { bestIdx = i; break; }
      }
    }

    if (bestIdx === -1) {
      usedVideoIndices.current.clear();
      bestIdx = 0;
    }

    usedVideoIndices.current.add(bestIdx);
    songCounter.current = (songCounter.current % 16) + 1;

    const entry = { videoUrl: videoBank[bestIdx].url, songNum: songCounter.current };
    mediaMap.current.set(lessonId, entry);
    return entry;
  }

  useEffect(() => {
    if (appStarted && ageGroup !== "") {
      resetJourney();
    }
  }, [appStarted, ageGroup]);

  useEffect(() => {
    if (!currentData || !feedRef.current) return;

    const feed = feedRef.current;
    let lastIndex = -1;

    const detectSlide = () => {
      const h = window.innerHeight || feed.clientHeight;
      const idx = Math.round(feed.scrollTop / h);
      if (idx === lastIndex) return;
      lastIndex = idx;
      currentSlideRef.current = idx;

      if (!isMuted && audioRef.current && currentData.lessons[idx]) {
        const media = mediaMap.current.get(currentData.lessons[idx].id);
        if (media) {
          const newSrc = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${media.songNum}.mp3`;
          if (audioRef.current.src !== newSrc) {
            audioRef.current.src = newSrc;
            audioRef.current.play().catch(() => {});
          }
        }
      }
    };

    feed.addEventListener("scroll", detectSlide, { passive: true });
    detectSlide();

    return () => feed.removeEventListener("scroll", detectSlide);
  }, [currentData, isMuted]);

  useEffect(() => {
    if (quizResult !== true) { setCountdown(10); return; }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); resetJourney(); return 10; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizResult]);

  const startAudio = useCallback(() => {
    if (audioRef.current) return;
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`;
    audioRef.current = audio;
    audio.play().then(() => { setIsMuted(false); }).catch(() => {});
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (!audio) {
        if (!next) startAudio();
        return next;
      }
      if (next) {
        audio.pause();
      } else {
        if (currentData && currentData.lessons[currentSlideRef.current]) {
          const media = mediaMap.current.get(currentData.lessons[currentSlideRef.current].id);
          if (media) audio.src = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${media.songNum}.mp3`;
        }
        audio.play().catch(() => {});
      }
      return next;
    });
  }, [currentData, startAudio]);

  const resetJourney = () => {
    setLoading(true);
    setCompletedSlides([]);
    setSlideAnswers({});
    setQuizUnlocked(false);
    setQuizStarted(false);
    setQuizResult(null);
    generateCards(ageGroup).then((newData) => {
      if (newData) {
        newData.lessons = newData.lessons.map((l) => ({
          ...l,
          id: Math.random().toString(36).substr(2, 9),
        }));
        setCurrentData(newData);
      }
      setLoading(false);
    });
  };

  const handleScroll = async (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollHeight - scrollTop <= clientHeight * 2 &&
      !isFetchingRef.current
    ) {
      isFetchingRef.current = true;
      setIsFetchingMore(true);
      const newData = await generateCards(ageGroup);
      if (newData && newData.lessons) {
        const newLessons = newData.lessons.map((l) => ({
          ...l,
          id: Math.random().toString(36).substr(2, 9),
        }));
        setCurrentData((prev) => ({
          ...prev,
          lessons: [...prev.lessons, ...newLessons],
        }));
      }
      setIsFetchingMore(false);
      isFetchingRef.current = false;
    }
  };

  const handleMiniGame = (lessonId, selectedIndex, correctIndex) => {
    if (slideAnswers[lessonId] !== undefined) return;
    setSlideAnswers((prev) => ({ ...prev, [lessonId]: selectedIndex }));
    if (selectedIndex === correctIndex) {
      const newCompleted = [...completedSlides, lessonId];
      setCompletedSlides(newCompleted);
      setXp((prev) => prev + 10);
      if (newCompleted.length >= 3)
        setTimeout(() => setQuizUnlocked(true), 800);
    }
  };

  const handleShare = (platform) => {
    const shareText = `Crushed the ${ageGroup} Boss Fight on WealthScroll! 👑 Check it out:`;
    const url = window.location.href;
    if (platform === "native" && navigator.share) {
      navigator.share({ title: "WealthScroll", text: shareText, url });
    } else if (platform === "wa") {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + url)}`,
      );
    } else if (platform === "x") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      );
    }
  };

  if (!appStarted) {
    return (
      <div style={{
        width: "100vw", height: "100dvh", background: "linear-gradient(160deg, #0f0c29 0%, #302b63 40%, #24243e 100%)",
        color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        fontFamily: "'Inter', system-ui, sans-serif", padding: "20px", position: "relative", overflow: "hidden",
      }}>
        <style>{`
          @keyframes splashFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
          @keyframes splashPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
          @keyframes orbDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-50px) scale(1.2)} }
          @keyframes orbDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(0.9)} }
          @keyframes ageBtn { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        `}</style>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,107,0.12) 0%,transparent 70%)",top:"12%",left:"-8%",filter:"blur(50px)",animation:"orbDrift1 8s ease-in-out infinite"}} />
        <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,245,212,0.1) 0%,transparent 70%)",bottom:"15%",right:"-5%",filter:"blur(50px)",animation:"orbDrift2 9s ease-in-out infinite"}} />

        <div style={{fontSize:"4.5rem",marginBottom:8,animation:"splashFloat 3s ease-in-out infinite",filter:"drop-shadow(0 0 30px rgba(255,217,61,0.4))"}}>💸</div>
        <h1 style={{
          fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 4px 0", textAlign: "center",
          background: "linear-gradient(135deg, #06D6A0, #00F5D4, #118AB2)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>WealthScroll</h1>
        <p style={{
          color: "rgba(255,255,255,0.35)", fontWeight: 800, letterSpacing: "0.2em", fontSize: "0.7rem",
          marginBottom: 12, textTransform: "uppercase",
          animation: "splashPulse 3s ease-in-out infinite",
        }}>SWIPE &middot; LEARN &middot; EARN</p>

        {/* Persistent Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
          {[
            { label: "XP", val: xp, color: "#06D6A0" },
            { label: "LVL", val: level, color: "#FFD93D" },
            { label: "STREAK", val: streak, color: "#FF6B6B" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
          {[
            { age: "8-12", label: "EXPLORER", sub: "Ages 8-12", color: "#FFD93D", icon: "🌟" },
            { age: "13-16", label: "HUSTLER", sub: "Ages 13-16", color: "#FF6B6B", icon: "🔥" },
            { age: "17-21", label: "INVESTOR", sub: "Ages 17-21", color: "#00F5D4", icon: "💎" },
          ].map((lvl, i) => (
            <button
              key={lvl.age}
              onClick={() => {
                setAgeGroup(lvl.age);
                setAppStarted(true);
                startAudio();
              }}
              style={{
                padding: "18px 20px", borderRadius: 18,
                background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                color: "#fff", border: `1px solid ${lvl.color}25`,
                fontWeight: 800, fontSize: "0.95rem", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                boxShadow: `0 0 30px ${lvl.color}10, inset 0 1px 0 rgba(255,255,255,0.05)`,
                animation: `ageBtn 0.5s ease-out ${i * 0.1}s both`,
                transition: "transform 0.15s ease, border-color 0.2s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.borderColor = `${lvl.color}60`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = `${lvl.color}25`; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${lvl.color}25, ${lvl.color}10)`,
                border: `1px solid ${lvl.color}30`,
                display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.3rem",
              }}>{lvl.icon}</div>
              <div>
                <div style={{ letterSpacing: "0.06em", fontSize: "0.85rem" }}>LVL {i + 1}: {lvl.label}</div>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontWeight: 600, marginTop: 2 }}>{lvl.sub}</div>
              </div>
              <div style={{ marginLeft: "auto", color: `${lvl.color}80`, fontSize: "1.2rem" }}>&#8250;</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading || !currentData) {
    return (
      <div style={{
        height: "100dvh", display: "flex", justifyContent: "center", alignItems: "center",
        background: "linear-gradient(160deg, #0f0c29 0%, #302b63 40%, #24243e 100%)",
        color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", position: "relative", overflow: "hidden",
      }}>
        <style>{`
          @keyframes ldSpin { to{transform:rotate(360deg)} }
          @keyframes ldBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes ldDot { 0%,20%{opacity:0} 50%{opacity:1} 100%{opacity:0} }
        `}</style>
        <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,214,160,0.1) 0%,transparent 70%)",top:"25%",right:"10%",filter:"blur(60px)"}} />
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16, animation: "ldBounce 2s ease-in-out infinite" }}>🧠</div>
          <div style={{ width:44,height:44,margin:"0 auto 18px",borderRadius:"50%",border:"3px solid rgba(255,255,255,0.08)",borderTopColor:"#06D6A0",borderRightColor:"#FF6B6B",animation:"ldSpin 0.7s linear infinite" }} />
          <p style={{ fontSize:"1.15rem",fontWeight:800,letterSpacing:"-0.02em",background:"linear-gradient(90deg,#FF6B6B,#FFD93D,#00F5D4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
            Curating your feed...
          </p>
          <div style={{ display:"flex",gap:5,justifyContent:"center",marginTop:8 }}>
            {[0,1,2].map(i => <div key={i} style={{width:6,height:6,borderRadius:"50%",background:["#FF6B6B","#FFD93D","#00F5D4"][i],animation:`ldDot 1.4s ease-in-out ${i*0.2}s infinite`}} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "relative", width: "100vw", maxWidth: 430, margin: "0 auto",
      background: "#000", height: "100dvh", overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes popIn { 0%{transform:scale(0.3) rotate(-5deg);opacity:0} 50%{transform:scale(1.08) rotate(1deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        @keyframes confetti { 0%{transform:scale(0);opacity:1} 50%{transform:scale(1.5);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes optSlide { from{transform:translateX(-16px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes blobA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-40px) scale(1.15)} 66%{transform:translate(-25px,-15px) scale(.92)} }
        @keyframes blobB { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,30px) scale(.9)} 66%{transform:translate(20px,15px) scale(1.1)} }
        @keyframes vidFade { from{opacity:0;transform:scale(1.06)} to{opacity:1;transform:scale(1)} }
        @keyframes cdPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes ringProgress { from{stroke-dashoffset:157} }
        .mg-opt:active{transform:scale(.95)!important}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {/* HUD Header */}
      <div style={{
        position: "absolute", top: 0, width: "100%", padding: "10px 16px 16px", zIndex: 10,
        background: "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.65) 60%, transparent 100%)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      }}>
        {/* Subject Bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
          padding: "5px 10px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6,
            background: "linear-gradient(135deg, #E040FB, #536DFE)",
            display: "flex", justifyContent: "center", alignItems: "center", fontSize: "9px",
          }}>📚</div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.06em" }}>
            MODULE {moduleNum}: {currentSubject.toUpperCase()}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 14, height: 4, borderRadius: 2,
                background: i < moduleProgress ? "#E040FB" : "rgba(255,255,255,0.1)",
                transition: "background 0.3s ease",
              }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Profile Button */}
            <button
              onClick={() => setShowProfile(true)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#06D6A0,#00F5D4)",
                display: "flex", justifyContent: "center", alignItems: "center", fontSize: "13px",
              }}
            >💸</button>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.1em" }}>WEALTHSCROLL</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              padding: "3px 8px", borderRadius: 8,
              background: "rgba(255,217,61,0.1)", border: "1px solid rgba(255,217,61,0.2)",
            }}>
              <span style={{ color: "#FFD93D", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.06em" }}>
                LVL {level}
              </span>
            </div>
            <span style={{ color: "#06D6A0", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.06em" }}>
              {xp} XP
            </span>
            <button onClick={toggleMute} style={{
              width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
              background: isMuted ? "rgba(255,255,255,0.06)" : "rgba(6,214,160,0.2)",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              color: "#fff", fontSize: "13px", cursor: "pointer",
              display: "flex", justifyContent: "center", alignItems: "center",
              transition: "background 0.2s ease",
              borderColor: isMuted ? "rgba(255,255,255,0.15)" : "rgba(6,214,160,0.4)",
            }}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
        <div style={{ width: "100%", height: 3, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, marginTop: 8 }}>
          <div style={{
            width: `${progress}%`, height: "100%", borderRadius: 3,
            background: progress >= 100 ? "linear-gradient(90deg,#FFD93D,#FF6B6B,#E040FB)" : "linear-gradient(90deg,#06D6A0,#00F5D4,#00E5FF)",
            transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: progress > 0 ? "0 0 12px rgba(6,214,160,0.5)" : "none",
          }} />
        </div>
      </div>

      {/* Profile Dashboard Overlay */}
      {showProfile && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
          zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          padding: 28, animation: "popIn 0.4s ease-out both",
        }}>
          <button onClick={() => setShowProfile(false)} style={{
            position: "absolute", top: 20, right: 20, width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff", fontSize: "16px", cursor: "pointer",
            display: "flex", justifyContent: "center", alignItems: "center",
          }}>✕</button>

          {/* Progress Ring */}
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: 20 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ringGrad)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray="314"
                strokeDashoffset={314 - (314 * levelProgress / 100)}
                style={{ transition: "stroke-dashoffset 0.8s ease", animation: "ringProgress 1s ease-out" }}
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#06D6A0" />
                  <stop offset="100%" stopColor="#00F5D4" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff" }}>{level}</div>
              <div style={{ fontSize: "0.5rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>LEVEL</div>
            </div>
          </div>

          <h2 style={{
            fontSize: "1.4rem", fontWeight: 900, margin: "0 0 4px 0",
            background: "linear-gradient(135deg, #06D6A0, #00F5D4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>YOUR PROFILE</h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", fontWeight: 600, margin: "0 0 28px 0" }}>
            {xp} / {xpForNextLevel} XP to next level
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", maxWidth: 300 }}>
            {[
              { label: "TOTAL XP", val: xp, icon: "⚡", color: "#06D6A0" },
              { label: "STREAK", val: `${streak}🔥`, icon: "🔥", color: "#FF6B6B" },
              { label: "BOSS WINS", val: bossWins, icon: "👑", color: "#FFD93D" },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "14px 10px", borderRadius: 14, textAlign: "center",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "0.5rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20, padding: "12px 16px", borderRadius: 12, width: "100%", maxWidth: 300,
            background: "rgba(224,64,251,0.06)", border: "1px solid rgba(224,64,251,0.15)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 4 }}>CURRENT MODULE</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#E040FB" }}>
              Module {moduleNum}: {currentSubject}
            </div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 8 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 28, height: 4, borderRadius: 2,
                  background: i < moduleProgress ? "#E040FB" : "rgba(255,255,255,0.1)",
                }} />
              ))}
            </div>
            <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              {moduleProgress}/3 Boss Fights to next module
            </div>
          </div>
        </div>
      )}

      {/* The Feed */}
      <div
        ref={feedRef}
        onScroll={handleScroll}
        style={{ height: "100dvh", overflowY: "scroll", scrollSnapType: "y mandatory", overflowX: "hidden", scrollbarWidth: "none" }}
      >
        {currentData.lessons.map((card, index) => {
          const answeredIndex = slideAnswers[card.id];
          const t = slideAccents[index % slideAccents.length];
          const media = assignMedia(card.id, card.title, card.desc);
          const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(card.title)}`;
          const isCorrect = answeredIndex !== undefined && answeredIndex === card.miniGame.correctIndex;

          return (
            <div key={card.id} data-slide-index={index} style={{
              height: "100dvh", width: "100%", position: "relative",
              scrollSnapAlign: "start", scrollSnapStop: "always", overflow: "hidden", background: "#000",
            }}>
              <video
                autoPlay muted loop playsInline
                src={media.videoUrl}
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  objectFit: "cover", zIndex: 0, opacity: 0.35,
                  animation: "vidFade 1s ease-out both",
                }}
              />

              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1,
                background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, ${t.c1}06 35%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.95) 100%)`,
              }} />

              <div style={{
                position: "absolute", width: 200, height: 200, borderRadius: "50%",
                background: `radial-gradient(circle, ${t.c1}15 0%, transparent 70%)`,
                top: "18%", left: "-8%", filter: "blur(50px)", zIndex: 1,
                animation: `blobA ${8 + (index % 3)}s ease-in-out infinite`,
              }} />
              <div style={{
                position: "absolute", width: 160, height: 160, borderRadius: "50%",
                background: `radial-gradient(circle, ${t.c2}12 0%, transparent 70%)`,
                bottom: "25%", right: "-5%", filter: "blur(60px)", zIndex: 1,
                animation: `blobB ${10 + (index % 3)}s ease-in-out infinite`,
              }} />

              <div style={{
                position: "absolute", bottom: 0, left: 0, width: "100%",
                padding: "0 20px 28px", zIndex: 2,
                background: "linear-gradient(transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.88) 100%)",
                animation: "slideUp 0.6s ease-out both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.c1}30, ${t.c2}15)`,
                    border: `2px solid ${t.c1}40`, padding: 3,
                    boxShadow: `0 0 20px ${t.c1}25`,
                    display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden",
                  }}>
                    <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                  </div>
                  <h1 style={{
                    color: "#fff", fontSize: "1.55rem", fontWeight: 900, lineHeight: 1.1,
                    letterSpacing: "-0.03em", margin: 0,
                    textShadow: `0 0 30px ${t.c1}30, 0 2px 6px rgba(0,0,0,0.5)`,
                  }}>
                    {card.title}
                  </h1>
                </div>

                <p style={{
                  color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", lineHeight: 1.5, fontWeight: 500,
                  margin: "0 0 18px 0",
                }}>
                  {card.desc}
                </p>

                <div style={{
                  padding: 20, borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: `0 0 40px ${t.c1}06, 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: -1, right: -1, width: 60, height: 60,
                    borderRadius: "0 20px 0 30px",
                    background: `linear-gradient(225deg, ${t.c1}15, transparent)`,
                    pointerEvents: "none",
                  }} />

                  <p style={{
                    color: "#fff", fontSize: "0.85rem", fontWeight: 800,
                    opacity: 0.85, lineHeight: 1.4, margin: "0 0 14px 0",
                  }}>
                    {card.miniGame.question}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {card.miniGame.options.map((opt, idx) => {
                      const answered = answeredIndex !== undefined;
                      const isSelected = answeredIndex === idx;
                      const isRight = idx === card.miniGame.correctIndex;

                      let bg = "rgba(255,255,255,0.06)";
                      let borderColor = "rgba(255,255,255,0.08)";
                      if (answered && isSelected) {
                        if (isRight) { bg = "rgba(6,214,160,0.2)"; borderColor = "rgba(6,214,160,0.5)"; }
                        else { bg = "rgba(231,111,81,0.2)"; borderColor = "rgba(231,111,81,0.5)"; }
                      } else if (answered && isRight) {
                        bg = "rgba(6,214,160,0.08)"; borderColor = "rgba(6,214,160,0.25)";
                      }

                      return (
                        <button className="mg-opt" key={idx}
                          onClick={() => handleMiniGame(card.id, idx, card.miniGame.correctIndex)}
                          style={{
                            width: "100%", padding: "14px 16px", borderRadius: 14,
                            border: `1px solid ${borderColor}`, background: bg,
                            color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                            textAlign: "center", fontFamily: "inherit",
                            cursor: answered ? "default" : "pointer",
                            transition: "transform 0.1s ease, background 0.2s ease, border-color 0.2s ease",
                            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                          }}
                        >
                          {opt}
                          {answered && isSelected && (
                            <span style={{ marginLeft: 8 }}>{isRight ? "✅" : "❌"}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {answeredIndex !== undefined && (
                    <div style={{
                      marginTop: 12, fontSize: "0.7rem", fontWeight: 700,
                      color: isCorrect ? "#06D6A0" : "#E76F51",
                      letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center",
                    }}>
                      {isCorrect ? "+10 XP EARNED" : "WRONG — KEEP SWIPING"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isFetchingMore && (
          <div style={{
            height: 80, display: "flex", justifyContent: "center", alignItems: "center",
            color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em",
          }}>
            LOADING MORE...
          </div>
        )}
      </div>

      {/* BOSS QUIZ */}
      {quizUnlocked && (
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(160deg, #0f0c29 0%, #1a0a3e 40%, #0d1117 100%)",
          zIndex: 20, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          padding: 28, textAlign: "center",
          animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
          overflow: "hidden",
        }}>
          <div style={{position:"absolute",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,217,61,0.07) 0%,transparent 70%)",top:"8%",left:"-15%",filter:"blur(60px)"}} />
          <div style={{position:"absolute",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,245,212,0.06) 0%,transparent 70%)",bottom:"12%",right:"-10%",filter:"blur(60px)"}} />

          {!quizStarted ? (
            <div style={{ zIndex: 1 }}>
              <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:180,height:180,borderRadius:"50%",border:"2px solid rgba(255,217,61,0.12)",animation:"confetti 2.5s ease-out infinite",pointerEvents:"none"}} />
              <div style={{ fontSize: "5rem", marginBottom: 14, filter: "drop-shadow(0 0 40px rgba(255,217,61,0.5))", animation: "pulse 1.5s ease-in-out infinite" }}>👑</div>
              <h2 style={{
                fontSize: "2.6rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 4px 0",
                background: "linear-gradient(135deg, #FFD93D, #FF6B6B)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>BOSS FIGHT</h2>
              <p style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", margin: "0 0 36px 0", textTransform: "uppercase" }}>
                MODULE {moduleNum}: {currentSubject.toUpperCase()}
              </p>
              <button onClick={() => setQuizStarted(true)} style={{
                padding: "18px 56px", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #FFD93D, #FF6B6B)", color: "#000",
                fontWeight: 900, fontSize: "1rem", fontFamily: "inherit",
                letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 0 40px rgba(255,217,61,0.3), 0 8px 24px rgba(0,0,0,0.4)",
              }}>ENTER ARENA</button>
            </div>
          ) : quizResult === null ? (
            <div style={{ width: "100%", maxWidth: 360, zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #E040FB, #536DFE)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "12px" }}>⚡</div>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>ULTIMATE TEST</span>
              </div>
              <div style={{
                padding: "24px 20px", borderRadius: 20,
                background: "rgba(255,255,255,0.04)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
                <h3 style={{
                  color: "#fff", fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.35,
                  letterSpacing: "-0.02em", margin: "0 0 22px 0",
                }}>
                  {currentData.bossQuiz.question}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {currentData.bossQuiz.options.map((opt, i) => {
                    const colors = ["#FF6B6B", "#FFD93D", "#00F5D4"];
                    return (
                      <button className="mg-opt" key={i}
                        onClick={() => {
                          const won = i === currentData.bossQuiz.correctIndex;
                          setQuizResult(won);
                          if (won) {
                            setXp((prev) => prev + 50);
                            setStreak((prev) => prev + 1);
                            setBossWins((prev) => prev + 1);
                          } else {
                            setStreak(0);
                          }
                        }}
                        style={{
                          width: "100%", padding: "15px 16px", borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.9)", fontWeight: 700,
                          fontSize: "0.9rem", fontFamily: "inherit",
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                          transition: "transform 0.1s ease, background 0.15s ease",
                          animation: `optSlide 0.4s ease-out ${i * 0.08}s both`,
                        }}
                      >
                        <span style={{
                          width: 24, height: 24, borderRadius: 7,
                          background: `${colors[i % 3]}15`, border: `1px solid ${colors[i % 3]}30`,
                          display: "flex", justifyContent: "center", alignItems: "center",
                          fontSize: "10px", fontWeight: 900, color: colors[i % 3], flexShrink: 0,
                        }}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ zIndex: 1 }}>
              <div style={{
                fontSize: "5rem", marginBottom: 14,
                filter: quizResult ? "drop-shadow(0 0 50px rgba(0,245,212,0.5))" : "drop-shadow(0 0 50px rgba(255,107,107,0.5))",
                animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
              }}>
                {quizResult ? "🏆" : "💀"}
              </div>
              <h2 style={{
                fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 6px 0",
                background: quizResult ? "linear-gradient(135deg, #00F5D4, #06D6A0)" : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {quizResult ? "LEGENDARY" : "REKT"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600, fontSize: "0.8rem", margin: "0 0 8px 0" }}>
                {quizResult ? `+50 XP earned! Streak: ${streak}🔥` : "Review the lessons and run it back."}
              </p>

              {/* Countdown Timer (only on win) */}
              {quizResult && (
                <div style={{ margin: "0 0 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ position: "relative", width: 64, height: 64, marginBottom: 6 }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#06D6A0" strokeWidth="4"
                        strokeLinecap="round" strokeDasharray="176"
                        strokeDashoffset={176 - (176 * countdown / 10)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                      fontSize: "1.3rem", fontWeight: 900, color: "#fff",
                      animation: countdown <= 3 ? "cdPulse 0.5s ease-in-out infinite" : "none",
                    }}>{countdown}</div>
                  </div>
                  <span style={{ fontSize: "0.55rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
                    NEXT JOURNEY IN {countdown}s
                  </span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
                {quizResult ? (
                  <>
                    <button onClick={resetJourney} style={{
                      padding: 18, borderRadius: 16, border: "none",
                      background: "linear-gradient(135deg, #06D6A0, #00F5D4)", color: "#000",
                      fontWeight: 900, fontSize: "0.95rem", fontFamily: "inherit",
                      letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
                      boxShadow: "0 0 30px rgba(6,214,160,0.3), 0 6px 20px rgba(0,0,0,0.4)",
                    }}>NEW JOURNEY NOW</button>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <button onClick={() => handleShare("native")} style={{
                        padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.06)",
                        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                        fontSize: "0.7rem", fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
                      }}>SHARE</button>
                      <button onClick={() => handleShare("wa")} style={{
                        padding: 14, borderRadius: 14, background: "rgba(37,211,102,0.15)",
                        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(37,211,102,0.3)", color: "#25D366",
                        fontSize: "0.7rem", fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
                      }}>WA</button>
                      <button onClick={() => handleShare("x")} style={{
                        padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
                        fontSize: "0.7rem", fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
                      }}>X</button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => {
                    setCompletedSlides((prev) => prev.slice(0, -1));
                    setQuizUnlocked(false);
                    setQuizStarted(false);
                    setQuizResult(null);
                  }} style={{
                    padding: 18, borderRadius: 16, border: "none",
                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", color: "#000",
                    fontWeight: 900, fontSize: "0.95rem", fontFamily: "inherit",
                    letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
                    boxShadow: "0 0 30px rgba(255,107,107,0.3), 0 6px 20px rgba(0,0,0,0.4)",
                  }}>RETRY</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
