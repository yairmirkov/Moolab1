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

const pxImg = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=1`;

const imageBank: { keywords: string[]; url: string }[] = [
  { keywords: ["money", "dollar", "cash", "earn", "income", "wage", "pay", "paid", "salary", "wealth"], url: pxImg(3483098) },
  { keywords: ["save", "saving", "piggy", "jar", "emergency", "rainy"], url: pxImg(68927) },
  { keywords: ["invest", "stock", "market", "trade", "portfolio", "dividend", "growth", "compound"], url: pxImg(210607) },
  { keywords: ["budget", "plan", "track", "expense", "spend", "spending"], url: pxImg(5466785) },
  { keywords: ["shop", "buy", "purchase", "store", "retail", "consumer", "want"], url: pxImg(5632399) },
  { keywords: ["coin", "change", "penny", "cent", "quarter"], url: pxImg(106152) },
  { keywords: ["credit", "card", "debit", "swipe", "debt", "loan", "borrow", "owe"], url: pxImg(4386431) },
  { keywords: ["business", "entrepreneur", "company", "startup", "hustle", "side"], url: pxImg(3184292) },
  { keywords: ["toy", "game", "play", "fun", "kid", "child", "lego", "car"], url: pxImg(163696) },
  { keywords: ["house", "home", "rent", "mortgage", "apartment", "real estate", "property"], url: pxImg(323780) },
  { keywords: ["food", "eat", "grocery", "meal", "restaurant", "snack", "lunch"], url: pxImg(1640777) },
  { keywords: ["school", "education", "learn", "college", "university", "student", "book", "tuition"], url: pxImg(301926) },
  { keywords: ["gold", "treasure", "precious", "diamond", "luxury", "rich"], url: pxImg(610533) },
  { keywords: ["crypto", "bitcoin", "digital", "blockchain", "nft", "token"], url: pxImg(843700) },
  { keywords: ["bank", "account", "deposit", "withdraw", "atm", "check", "cheque"], url: pxImg(351264) },
  { keywords: ["goal", "target", "dream", "future", "retire", "freedom", "success"], url: pxImg(1054218) },
  { keywords: ["tax", "government", "irs", "refund", "deduction", "filing"], url: pxImg(6863183) },
  { keywords: ["insurance", "protect", "coverage", "risk", "safety", "secure"], url: pxImg(7876667) },
  { keywords: ["allowance", "chore", "parent", "family", "gift", "birthday"], url: pxImg(1166990) },
  { keywords: ["donate", "charity", "give", "help", "volunteer", "share", "generous"], url: pxImg(6646918) },
];

const defaultFinanceImages = [
  pxImg(534216),
  pxImg(4968391),
  pxImg(4386476),
  pxImg(3943716),
  pxImg(4475523),
];

function getRelevantImage(title: string, desc: string, index: number): string {
  const text = `${title} ${desc}`.toLowerCase();
  let bestMatch: { url: string; score: number } | null = null;

  for (const entry of imageBank) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { url: entry.url, score };
    }
  }

  return bestMatch ? bestMatch.url : defaultFinanceImages[index % defaultFinanceImages.length];
}

const audioByAge: Record<string, string> = {
  "8-12": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "13-16": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "17-21": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
};

const slideAccents = [
  { c1: "#FF6B6B", c2: "#FF8E53" },
  { c1: "#00F5D4", c2: "#7B61FF" },
  { c1: "#FFD93D", c2: "#FF6B6B" },
  { c1: "#06D6A0", c2: "#118AB2" },
  { c1: "#E040FB", c2: "#536DFE" },
  { c1: "#00B4D8", c2: "#48CAE4" },
];

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

  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioReady = useRef(false);

  const progress = Math.min((completedSlides.length / 3) * 100, 100);

  useEffect(() => {
    if (appStarted && ageGroup !== "") {
      resetJourney();
    }
  }, [appStarted, ageGroup]);

  useEffect(() => {
    if (!appStarted || !ageGroup) return;
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.25;
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = audioByAge[ageGroup] || "";
    audioRef.current = audio;
    audioReady.current = false;

    const onCanPlay = () => { audioReady.current = true; };
    audio.addEventListener("canplaythrough", onCanPlay);

    return () => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [appStarted, ageGroup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (!audio) return next;
      if (next) {
        audio.pause();
      } else {
        audio.play().catch((err) => console.warn("Audio play blocked:", err));
      }
      return next;
    });
  }, []);

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
          marginBottom: 48, textTransform: "uppercase",
          animation: "splashPulse 3s ease-in-out infinite",
        }}>SWIPE &middot; LEARN &middot; EARN</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
          {[
            { age: "8-12", label: "EXPLORER", sub: "Ages 8-12", color: "#FFD93D", icon: "🌟" },
            { age: "13-16", label: "HUSTLER", sub: "Ages 13-16", color: "#FF6B6B", icon: "🔥" },
            { age: "17-21", label: "INVESTOR", sub: "Ages 17-21", color: "#00F5D4", icon: "💎" },
          ].map((lvl, i) => (
            <button
              key={lvl.age}
              onClick={() => { setAgeGroup(lvl.age); setAppStarted(true); }}
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
        @keyframes imgFade { from{opacity:0;transform:scale(1.08)} to{opacity:1;transform:scale(1)} }
        .mg-opt:active{transform:scale(.95)!important}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {/* HUD Header */}
      <div style={{
        position: "absolute", top: 0, width: "100%", padding: "14px 20px 20px", zIndex: 10,
        background: "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.65) 60%, transparent 100%)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#06D6A0,#00F5D4)",display:"flex",justifyContent:"center",alignItems:"center",fontSize:"13px" }}>💸</div>
            <span style={{ color:"#fff",fontWeight:900,fontSize:"0.7rem",letterSpacing:"0.12em" }}>WEALTHSCROLL</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color:"#06D6A0",fontWeight:800,fontSize:"0.7rem",letterSpacing:"0.08em" }}>
              XP {completedSlides.length}/3
            </span>
            <button onClick={toggleMute} style={{
              width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
              background: isMuted ? "rgba(255,255,255,0.06)" : "rgba(6,214,160,0.2)",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              color: "#fff", fontSize: "15px", cursor: "pointer",
              display: "flex", justifyContent: "center", alignItems: "center",
              transition: "background 0.2s ease, border-color 0.2s ease",
              borderColor: isMuted ? "rgba(255,255,255,0.15)" : "rgba(6,214,160,0.4)",
            }}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
        <div style={{ width:"100%",height:4,backgroundColor:"rgba(255,255,255,0.06)",borderRadius:4,marginTop:10 }}>
          <div style={{
            width: `${progress}%`, height: "100%", borderRadius: 4,
            background: progress >= 100 ? "linear-gradient(90deg,#FFD93D,#FF6B6B,#E040FB)" : "linear-gradient(90deg,#06D6A0,#00F5D4,#00E5FF)",
            transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: progress > 0 ? "0 0 12px rgba(6,214,160,0.5)" : "none",
          }} />
        </div>
      </div>

      {/* The Feed */}
      <div
        onScroll={handleScroll}
        style={{ height: "100dvh", overflowY: "scroll", scrollSnapType: "y mandatory", overflowX: "hidden", scrollbarWidth: "none" }}
      >
        {currentData.lessons.map((card, index) => {
          const answeredIndex = slideAnswers[card.id];
          const t = slideAccents[index % slideAccents.length];
          const bgImage = getRelevantImage(card.title, card.desc, index);
          const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(card.title)}`;
          const isCorrect = answeredIndex !== undefined && answeredIndex === card.miniGame.correctIndex;

          return (
            <div key={card.id} style={{
              height: "100dvh", width: "100%", position: "relative",
              scrollSnapAlign: "start", scrollSnapStop: "always", overflow: "hidden", background: "#000",
            }}>
              {/* Relevant Background Image */}
              <img
                src={bgImage}
                alt=""
                loading="lazy"
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  objectFit: "cover", zIndex: 0, opacity: 0.35,
                  animation: "imgFade 0.8s ease-out both",
                }}
              />

              {/* Dark gradient overlay */}
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1,
                background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, ${t.c1}06 35%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.95) 100%)`,
              }} />

              {/* Animated color blobs */}
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

              {/* Bottom content */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, width: "100%",
                padding: "0 20px 28px", zIndex: 2,
                background: "linear-gradient(transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.88) 100%)",
                animation: "slideUp 0.6s ease-out both",
              }}>
                {/* Avatar + Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.c1}30, ${t.c2}15)`,
                    border: `2px solid ${t.c1}40`,
                    padding: 3, boxShadow: `0 0 20px ${t.c1}25`,
                    display: "flex", justifyContent: "center", alignItems: "center",
                    overflow: "hidden",
                  }}>
                    <img src={avatarUrl} alt="AI Tutor" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                  </div>
                  <div>
                    <h1 style={{
                      color: "#fff", fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.1,
                      letterSpacing: "-0.03em", margin: 0,
                      textShadow: `0 0 30px ${t.c1}30, 0 2px 6px rgba(0,0,0,0.5)`,
                    }}>
                      {card.title}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.c1 }} />
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: `${t.c1}90`, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        AI TUTOR
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{
                  color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", lineHeight: 1.5, fontWeight: 500,
                  margin: "0 0 18px 0",
                }}>
                  {card.desc}
                </p>

                {/* MINI-GAME Glass Card */}
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
                    opacity: 0.85, lineHeight: 1.4, margin: "0 0 14px 0", letterSpacing: "-0.01em",
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
                        <button
                          className="mg-opt"
                          key={idx}
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
                      {isCorrect ? "+1 XP EARNED" : "WRONG — KEEP SWIPING"}
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
                UNLOCK YOUR NEXT LEVEL
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
                      <button
                        className="mg-opt"
                        key={i}
                        onClick={() => setQuizResult(i === currentData.bossQuiz.correctIndex)}
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
              <p style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600, fontSize: "0.8rem", margin: "0 0 36px 0" }}>
                {quizResult ? "Your money IQ just hit a new high." : "Review the lessons and run it back."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
                {quizResult ? (
                  <>
                    <button onClick={resetJourney} style={{
                      padding: 18, borderRadius: 16, border: "none",
                      background: "linear-gradient(135deg, #06D6A0, #00F5D4)", color: "#000",
                      fontWeight: 900, fontSize: "0.95rem", fontFamily: "inherit",
                      letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
                      boxShadow: "0 0 30px rgba(6,214,160,0.3), 0 6px 20px rgba(0,0,0,0.4)",
                    }}>NEW JOURNEY</button>
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
