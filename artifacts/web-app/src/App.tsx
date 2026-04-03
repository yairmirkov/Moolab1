import { useState, useEffect, useRef, useCallback } from "react";

const generateCards = async (ageGroup) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  let persona =
    ageGroup === "Kids"
      ? "Older sibling (8-12)."
      : ageGroup === "Teens"
        ? "Gen-Z expert (13-17)."
        : "Real-world mentor (18-21).";
  const prompt = `${persona} Generate 4 unique financial lessons. RAW JSON ONLY. Structure: {"lessons": [{"id": 1, "title": "Title", "desc": "1-sentence", "miniGame": {"question": "Q", "options": ["A", "B"], "correctIndex": 0}}], "bossQuiz": {"question": "Final Q", "options": ["A", "B", "C"], "correctIndex": 0}}`;
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
    return JSON.parse(cleanText);
  } catch (e) {
    return null;
  }
};

const videoBank = [
  "https://cdn.pixabay.com/video/2023/10/19/185633-876189917_tiny.mp4",
  "https://cdn.pixabay.com/video/2022/01/17/104523-666355831_tiny.mp4",
  "https://cdn.pixabay.com/video/2021/04/12/70882-536925565_tiny.mp4",
  "https://cdn.pixabay.com/video/2023/11/13/188892-883733008_tiny.mp4",
];

const studyBeats = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
];

const load = (k, d) => {
  const v = localStorage.getItem(`ws_${k}`);
  return v ? parseInt(v, 10) : d;
};
const save = (k, v) => localStorage.setItem(`ws_${k}`, String(v));

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

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

  const [xp, setXp] = useState(() => load("xp", 0));
  const [streak, setStreak] = useState(() => load("streak", 0));
  const [level, setLevel] = useState(() => load("level", 1));
  const [bossWins, setBossWins] = useState(() => load("bossWins", 0));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);

  const progress = Math.min((completedSlides.length / 3) * 100, 100);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [flashGreen, setFlashGreen] = useState(false);

  useEffect(() => {
    save("xp", xp);
    save("streak", streak);
    save("level", level);
    save("bossWins", bossWins);
  }, [xp, streak, level, bossWins]);

  const resetJourney = useCallback(() => {
    setLoading(true);
    setCompletedSlides([]);
    setSlideAnswers({});
    setQuizUnlocked(false);
    setQuizStarted(false);
    setQuizResult(null);
    generateCards(ageGroup).then((data) => {
      if (data) {
        data.lessons = data.lessons.map((l) => ({
          ...l,
          id: Math.random().toString(36).substr(2, 9),
        }));
        setCurrentData(data);
      }
      setLoading(false);
    });
  }, [ageGroup]);

  useEffect(() => {
    if (appStarted && ageGroup) resetJourney();
  }, [appStarted, ageGroup, resetJourney]);

  const startSession = (age: string) => {
    setAgeGroup(age);
    setAppStarted(true);
    const randomTrack =
      studyBeats[Math.floor(Math.random() * studyBeats.length)];
    if (!audioRef.current) {
      audioRef.current = new Audio(randomTrack);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
    }
    audioRef.current.play().catch(() => {});
  };

  const handleScroll = async (e: any) => {
    if (!currentData || quizUnlocked) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(Math.min((scrollTop / maxScroll) * 100, 100));
    }

    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      !isFetchingRef.current
    ) {
      isFetchingRef.current = true;
      setIsFetchingMore(true);
      const newData = await generateCards(ageGroup);
      if (newData) {
        const nl = newData.lessons.map((l) => ({
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

  if (!appStarted) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          background: "linear-gradient(160deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT,
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <style>{`
          @keyframes splashFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes splashPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
          @keyframes orbDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.15)} }
          @keyframes orbDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,30px) scale(0.9)} }
          @keyframes ageBtn { from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }
          .ws-btn { transition: transform 0.12s cubic-bezier(0.25,0.46,0.45,0.94) !important; }
          .ws-btn:active { transform: scale(0.96) !important; }
        `}</style>
        <div style={{position:"absolute",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,214,160,0.08) 0%,transparent 70%)",top:"15%",left:"-10%",filter:"blur(60px)",animation:"orbDrift1 10s ease-in-out infinite"}} />
        <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,107,0.06) 0%,transparent 70%)",bottom:"18%",right:"-8%",filter:"blur(60px)",animation:"orbDrift2 12s ease-in-out infinite"}} />

        <div style={{fontSize:"4rem",marginBottom:8,animation:"splashFloat 3s ease-in-out infinite",filter:"drop-shadow(0 0 25px rgba(6,214,160,0.3))"}}>💸</div>
        <h1 style={{
          fontSize: "3.2rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 6px 0", textAlign: "center",
          background: "linear-gradient(135deg, #06D6A0, #00F5D4, #118AB2)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>WealthScroll</h1>
        <p style={{
          color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.2em", fontSize: "0.65rem",
          marginBottom: 14, textTransform: "uppercase",
          animation: "splashPulse 3s ease-in-out infinite",
        }}>SWIPE &middot; LEARN &middot; EARN</p>

        <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
          {[
            { label: "XP", val: xp, color: "#06D6A0" },
            { label: "LVL", val: level, color: "#FFD93D" },
            { label: "STREAK", val: streak, color: "#FF6B6B" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, textShadow: `0 0 20px ${s.color}40` }}>{s.val}</div>
              <div style={{ fontSize: "0.5rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
          {[
            { age: "Kids", label: "EXPLORER", sub: "Ages 8-12", color: "#FFD93D", icon: "🌟" },
            { age: "Teens", label: "HUSTLER", sub: "Ages 13-16", color: "#FF6B6B", icon: "🔥" },
            { age: "Young Adults", label: "INVESTOR", sub: "Ages 17-21", color: "#00F5D4", icon: "💎" },
          ].map((lvl, i) => (
            <button
              key={lvl.age}
              className="ws-btn"
              onClick={() => startSession(lvl.age)}
              style={{
                padding: "20px 22px", borderRadius: 20,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                color: "#fff", border: `1px solid ${lvl.color}20`,
                fontWeight: 800, fontSize: "0.95rem", fontFamily: FONT,
                display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                boxShadow: `0 0 30px ${lvl.color}08, inset 0 1px 0 rgba(255,255,255,0.04)`,
                animation: `ageBtn 0.5s ease-out ${i * 0.1}s both`,
                textAlign: "left",
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${lvl.color}20, ${lvl.color}08)`,
                border: `1px solid ${lvl.color}25`,
                display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.3rem",
              }}>{lvl.icon}</div>
              <div>
                <div style={{ letterSpacing: "0.06em", fontSize: "0.85rem" }}>LVL {i + 1}: {lvl.label}</div>
                <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", fontWeight: 600, marginTop: 2 }}>{lvl.sub}</div>
              </div>
              <div style={{ marginLeft: "auto", color: `${lvl.color}60`, fontSize: "1.2rem" }}>&#8250;</div>
            </button>
          ))}
        </div>
      </div>
    );
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
          background: "linear-gradient(160deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)",
          color: "#fff",
          fontFamily: FONT,
        }}
      >
        <style>{`
          @keyframes ldSpin { to{transform:rotate(360deg)} }
          @keyframes ldBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
        <div style={{ fontSize: "3rem", marginBottom: 16, animation: "ldBounce 2s ease-in-out infinite" }}>🧠</div>
        <div style={{ width:40,height:40,margin:"0 auto 16px",borderRadius:"50%",border:"3px solid rgba(255,255,255,0.06)",borderTopColor:"#06D6A0",animation:"ldSpin 0.7s linear infinite" }} />
        <p style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em", background:"linear-gradient(90deg,#06D6A0,#00F5D4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
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
            💸 PROFILE
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
        </div>
      </div>

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
              <video
                key={`v-${card.id}`}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.45,
                  animation: "vidFade 0.8s ease-out both",
                }}
              >
                <source src={videoBank[i % videoBank.length]} type="video/mp4" />
              </video>

              {/* Dark gradient overlay */}
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.95) 100%)",
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
                      background: "rgba(255,255,255,0.08)",
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
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 20,
                    fontSize: "1rem",
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {card.desc}
                </p>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    padding: 22,
                    borderRadius: 24,
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <p
                    style={{
                      color: "#fff",
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      marginBottom: 16,
                      lineHeight: 1.4,
                      opacity: 0.9,
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
                            if (!slideAnswers[card.id]) {
                              setSlideAnswers((p) => ({ ...p, [card.id]: idx }));
                              if (idx === card.miniGame.correctIndex) {
                                setCompletedSlides((p) => [...p, card.id]);
                                setXp((p) => p + 10);
                                triggerGreenFlash();
                                if (completedSlides.length + 1 >= 3)
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
                  {answered !== undefined && (
                    <div style={{
                      marginTop: 12, fontSize: "0.68rem", fontWeight: 700,
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
            padding: "60px 30px",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            animation: "popIn 0.35s ease-out both",
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
            YOUR PROFILE
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
            animation: quizResult === null
              ? "arenaPulse 2s ease-in-out infinite"
              : quizResult === false
                ? "arenaPulseLose 1.5s ease-in-out infinite"
                : undefined,
            background: quizResult === true
              ? "radial-gradient(ellipse at center, rgba(6,214,160,0.08) 0%, #050505 60%, #020202 100%)"
              : "#050505",
            zIndex: 100,
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
              <p style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", marginBottom: 40 }}>
                PROVE YOUR KNOWLEDGE
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
                  ENTER ARENA
                </button>
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
                            setQuizResult(win);
                            if (win) {
                              setXp((p) => p + 50);
                              setStreak((p) => p + 1);
                              setBossWins((p) => p + 1);
                            } else {
                              setStreak(0);
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
          ) : (
            <div style={{ animation: "popIn 0.5s ease-out" }}>
              <h1 style={{
                fontSize: "5.5rem",
                filter: quizResult
                  ? "drop-shadow(0 0 40px rgba(6,214,160,0.5))"
                  : "drop-shadow(0 0 40px rgba(255,107,107,0.5))",
              }}>{quizResult ? "🏆" : "💀"}</h1>
              <h2 style={{
                color: "#fff", fontSize: "2.6rem", fontWeight: 900,
                letterSpacing: "-0.03em", margin: "0 0 6px 0",
                background: quizResult
                  ? "linear-gradient(135deg, #00F5D4, #06D6A0)"
                  : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {quizResult ? "LEGENDARY" : "REKT"}
              </h2>
              <p
                style={{
                  color: quizResult ? "rgba(6,214,160,0.7)" : "rgba(255,107,107,0.7)",
                  margin: "8px 0 28px 0",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                {quizResult
                  ? `+50 XP earned! Next quest in ${countdown}s...`
                  : "Review the lessons and run it back."}
              </p>

              {quizResult && (
                <div style={{ margin: "0 0 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  width: "100%",
                  minWidth: 300,
                }}
              >
                {quizResult ? (
                  <>
                    <button
                      className="ws-btn"
                      onClick={resetJourney}
                      style={{
                        padding: 20,
                        borderRadius: 18,
                        border: "none",
                        background: "linear-gradient(135deg, #06D6A0, #00F5D4)",
                        fontWeight: 900,
                        color: "#000",
                        fontSize: "1rem",
                        fontFamily: FONT,
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                        boxShadow: "0 0 30px rgba(6,214,160,0.25), 0 6px 20px rgba(0,0,0,0.4)",
                      }}
                    >
                      GO NOW 🚀
                    </button>
                    <button
                      className="ws-btn"
                      onClick={() =>
                        window.open(`whatsapp://send?text=Level Up!`)
                      }
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        background: "rgba(37,211,102,0.15)",
                        color: "#25D366",
                        border: "1px solid rgba(37,211,102,0.3)",
                        fontWeight: 800,
                        fontFamily: FONT,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      SHARE TO WHATSAPP
                    </button>
                  </>
                ) : (
                  <button
                    className="ws-btn"
                    onClick={() => {
                      setQuizResult(null);
                      setQuizStarted(false);
                      setQuizUnlocked(false);
                      setCompletedSlides((p) => p.slice(0, -1));
                    }}
                    style={{
                      padding: 20,
                      borderRadius: 18,
                      background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                      border: "none",
                      color: "#000",
                      fontWeight: 900,
                      fontFamily: FONT,
                      fontSize: "1rem",
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      boxShadow: "0 0 30px rgba(255,107,107,0.25), 0 6px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    TRY AGAIN
                  </button>
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
