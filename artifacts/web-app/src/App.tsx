import { useState, useEffect } from "react";

const generateCards = async (ageGroup: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `You are a fun, engaging financial literacy app. 
  Generate a lesson plan for a user aged ${ageGroup}.
  Return ONLY raw JSON. No markdown, no backticks.
  The JSON must have this exact structure:
  {
    "lessons": [
      { "id": 1, "title": "Catchy Title", "desc": "1-sentence explanation", "color": "#FF595E" },
      { "id": 2, "title": "...", "desc": "...", "color": "#FFCA3A" },
      { "id": 3, "title": "...", "desc": "...", "color": "#8AC926" }
    ],
    "quiz": {
      "question": "A multiple choice question based EXACTLY on the lessons above.",
      "options": ["Answer A", "Answer B", "Answer C", "Answer D"],
      "correctIndex": 0
    }
  }`;

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

    if (data.error) {
      console.error("API DENIED US:", data.error.message);
      return {
        lessons: [
          {
            id: 1,
            title: "API Error",
            desc: data.error.message,
            color: "#E76F51",
          },
        ],
        quiz: {
          question: "API Error?",
          options: ["Yes", "No"],
          correctIndex: 0,
        },
      };
    }

    let aiText = data.candidates[0].content.parts[0].text;
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(aiText);
  } catch (error) {
    console.error("Code broke:", error);
    return {
      lessons: [
        { id: 1, title: "Error", desc: "AI Nap time.", color: "#E76F51" },
      ],
      quiz: {
        question: "Error loading?",
        options: ["Yes", "No"],
        correctIndex: 0,
      },
    };
  }
};

const slideThemes = [
  {
    bg: "linear-gradient(160deg, #0f0c29 0%, #302b63 40%, #24243e 100%)",
    accent: "#FF6B6B",
    accentAlt: "#FF8E53",
    emoji: "🔥",
    tagline: "SWIPE UP TO LEVEL UP",
    shape: "blob1",
    cardBg: "linear-gradient(135deg, rgba(255,107,107,0.12) 0%, rgba(255,142,83,0.06) 100%)",
    borderGlow: "rgba(255,107,107,0.4)",
  },
  {
    bg: "linear-gradient(160deg, #0a1628 0%, #1a0a3e 40%, #0d1117 100%)",
    accent: "#00F5D4",
    accentAlt: "#7B61FF",
    emoji: "💎",
    tagline: "KNOWLEDGE = POWER",
    shape: "blob2",
    cardBg: "linear-gradient(135deg, rgba(0,245,212,0.10) 0%, rgba(123,97,255,0.06) 100%)",
    borderGlow: "rgba(0,245,212,0.4)",
  },
  {
    bg: "linear-gradient(160deg, #1a1a0a 0%, #2d1f0a 40%, #0a0a14 100%)",
    accent: "#FFD93D",
    accentAlt: "#FF6B6B",
    emoji: "🚀",
    tagline: "BIG BRAIN MOVE",
    shape: "blob3",
    cardBg: "linear-gradient(135deg, rgba(255,217,61,0.10) 0%, rgba(255,107,107,0.06) 100%)",
    borderGlow: "rgba(255,217,61,0.4)",
  },
  {
    bg: "linear-gradient(160deg, #0a1a0a 0%, #0a2e1a 40%, #0a0f14 100%)",
    accent: "#06D6A0",
    accentAlt: "#118AB2",
    emoji: "💰",
    tagline: "MONEY MOVES ONLY",
    shape: "blob1",
    cardBg: "linear-gradient(135deg, rgba(6,214,160,0.10) 0%, rgba(17,138,178,0.06) 100%)",
    borderGlow: "rgba(6,214,160,0.4)",
  },
  {
    bg: "linear-gradient(160deg, #1a0a1a 0%, #2e0a2a 40%, #140a14 100%)",
    accent: "#E040FB",
    accentAlt: "#536DFE",
    emoji: "⚡",
    tagline: "SPEED RUN THIS",
    shape: "blob2",
    cardBg: "linear-gradient(135deg, rgba(224,64,251,0.10) 0%, rgba(83,109,254,0.06) 100%)",
    borderGlow: "rgba(224,64,251,0.4)",
  },
];

function App() {
  const [ageGroup, setAgeGroup] = useState("8-12");
  const [currentData, setCurrentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [quizUnlocked, setQuizUnlocked] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResult, setQuizResult] = useState<boolean | null>(null);

  useEffect(() => {
    setLoading(true);
    setProgress(0);
    setQuizUnlocked(false);
    setQuizStarted(false);
    setQuizResult(null);

    generateCards(ageGroup).then((newData) => {
      setCurrentData(newData);
      setLoading(false);
    });
  }, [ageGroup]);

  const handleInteract = () => {
    if (progress < 100) {
      const newProgress = progress + 35;
      if (newProgress >= 100) {
        setProgress(100);
        setTimeout(() => setQuizUnlocked(true), 500);
      } else {
        setProgress(newProgress);
      }
    }
  };

  const handleAnswer = (selectedIndex: number) => {
    if (selectedIndex === currentData.quiz.correctIndex) {
      setQuizResult(true);
    } else {
      setQuizResult(false);
    }
  };

  const resetLoop = () => {
    setProgress(0);
    setQuizUnlocked(false);
    setQuizStarted(false);
    setQuizResult(null);
  };

  if (loading || !currentData) {
    return (
      <div
        style={{
          height: "100dvh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          color: "#fff",
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes loadPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes loadFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes loadDots {
            0%, 20% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes orbFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -40px) scale(1.1); }
            66% { transform: translate(-20px, -20px) scale(0.9); }
          }
          @keyframes orbFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-40px, 30px) scale(0.9); }
            66% { transform: translate(20px, 10px) scale(1.1); }
          }
        `}</style>
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)",
          top: "20%", left: "10%", animation: "orbFloat1 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 160, height: 160, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,245,212,0.12) 0%, transparent 70%)",
          bottom: "20%", right: "10%", animation: "orbFloat2 7s ease-in-out infinite",
        }} />
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: "4rem", marginBottom: 16, animation: "loadFloat 2s ease-in-out infinite" }}>
            🧠
          </div>
          <div
            style={{
              width: 50, height: 50, margin: "0 auto 20px", borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "#FF6B6B", borderRightColor: "#00F5D4",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <p style={{
            fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #00F5D4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "loadPulse 2s ease-in-out infinite",
          }}>
            Cooking up your lesson
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: ["#FF6B6B", "#FFD93D", "#00F5D4"][i],
                animation: `loadDots 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        maxWidth: "430px",
        margin: "0 auto",
        background: "#000",
        height: "100dvh",
        overflow: "hidden",
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn {
          0% { transform: scale(0.3) rotate(-5deg); opacity: 0; }
          50% { transform: scale(1.08) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes floatGlow {
          0%, 100% { box-shadow: 0 0 20px var(--glow-color, rgba(6,214,160,0.3)), 0 0 60px var(--glow-color, rgba(6,214,160,0.1)); transform: scale(1); }
          50% { box-shadow: 0 0 35px var(--glow-color, rgba(6,214,160,0.5)), 0 0 90px var(--glow-color, rgba(6,214,160,0.2)); transform: scale(1.08); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes slideUpBounce {
          0% { transform: translateY(60px); opacity: 0; }
          60% { transform: translateY(-8px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes borderRotate {
          to { --border-angle: 360deg; }
        }
        @keyframes moveBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -30px) scale(1.15); }
          50% { transform: translate(-20px, -60px) scale(0.95); }
          75% { transform: translate(-50px, 10px) scale(1.08); }
        }
        @keyframes moveBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(-50px, 40px) scale(1.1) rotate(45deg); }
          50% { transform: translate(30px, 50px) scale(0.9) rotate(90deg); }
          75% { transform: translate(60px, -20px) scale(1.05) rotate(135deg); }
        }
        @keyframes moveBlob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, 30px) scale(1.2); }
          66% { transform: translate(-40px, -40px) scale(0.85); }
        }
        @keyframes taglineSlide {
          0% { transform: translateX(-100%); opacity: 0; }
          15% { transform: translateX(0); opacity: 1; }
          85% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes videoPlaceholderPulse {
          0%, 100% { border-color: rgba(255,255,255,0.08); }
          50% { border-color: rgba(255,255,255,0.2); }
        }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-12px) rotate(5deg); }
          75% { transform: translateY(5px) rotate(-3deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes numberPop {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes confettiBurst {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes quizOptionSlide {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .got-it-btn:active { transform: scale(0.85) !important; }
        .quiz-option:active { transform: scale(0.96) !important; background: rgba(255,255,255,0.15) !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          padding: "14px 20px 18px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "10px",
            background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
            display: "flex", justifyContent: "center", alignItems: "center",
            fontSize: "16px", flexShrink: 0,
          }}>
            💸
          </div>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            style={{
              flex: 1, padding: "8px 14px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "12px", fontWeight: 800, fontFamily: "inherit",
              cursor: "pointer", background: "rgba(255,255,255,0.06)",
              color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase",
              outline: "none", appearance: "none", WebkitAppearance: "none",
            }}
          >
            <option value="8-12" style={{ background: "#1a1a2e" }}>LVL 1: Explorer (8-12)</option>
            <option value="13-16" style={{ background: "#1a1a2e" }}>LVL 2: Hustler (13-16)</option>
            <option value="17-21" style={{ background: "#1a1a2e" }}>LVL 3: Investor (17-21)</option>
          </select>
        </div>

        {/* XP Progress Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: "9px", fontWeight: 800, color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>XP</span>
          <div
            style={{
              flex: 1, height: "5px",
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: "10px", overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: progress >= 100
                  ? "linear-gradient(90deg, #FFD93D, #FF6B6B, #E040FB)"
                  : "linear-gradient(90deg, #06D6A0, #00F5D4, #00E5FF)",
                borderRadius: "10px",
                transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease",
                boxShadow: progress > 0 ? "0 0 14px rgba(6,214,160,0.5), 0 0 4px rgba(0,245,212,0.8)" : "none",
              }}
            />
          </div>
          <span style={{
            fontSize: "11px", fontWeight: 800,
            color: progress >= 100 ? "#FFD93D" : "#06D6A0",
            minWidth: 32, textAlign: "right",
            textShadow: progress >= 100 ? "0 0 10px rgba(255,217,61,0.5)" : "none",
          }}>{Math.min(progress, 100)}%</span>
        </div>
      </div>

      {/* The Feed */}
      <div
        style={{
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
        }}
      >
        {currentData.lessons.map((card: any, index: number) => {
          const theme = slideThemes[index % slideThemes.length];
          const slideNum = index + 1;
          const totalSlides = currentData.lessons.length;

          return (
            <div
              key={card.id}
              style={{
                height: "100dvh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                padding: "80px 20px 20px",
                textAlign: "left",
                position: "relative",
                background: theme.bg,
                overflow: "hidden",
              }}
            >
              {/* Animated background blobs */}
              <div style={{
                position: "absolute", width: 220, height: 220, borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.accent}18 0%, transparent 70%)`,
                top: "15%", left: "-10%", filter: "blur(40px)",
                animation: `move${theme.shape.replace('blob','')==='1' ? 'Blob1' : theme.shape.replace('blob','')==='2' ? 'Blob2' : 'Blob3'} ${8 + index}s ease-in-out infinite`,
              }} />
              <div style={{
                position: "absolute", width: 180, height: 180, borderRadius: "50%",
                background: `radial-gradient(circle, ${theme.accentAlt}14 0%, transparent 70%)`,
                bottom: "20%", right: "-5%", filter: "blur(50px)",
                animation: `move${theme.shape.replace('blob','')==='1' ? 'Blob2' : theme.shape.replace('blob','')==='2' ? 'Blob3' : 'Blob1'} ${10 + index}s ease-in-out infinite`,
              }} />

              {/* Slide number badge */}
              <div style={{
                position: "absolute", top: 90, left: 20,
                display: "flex", alignItems: "center", gap: 8,
                animation: `numberPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.2}s both`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "8px",
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
                  display: "flex", justifyContent: "center", alignItems: "center",
                  fontSize: "13px", fontWeight: 900, color: "#000",
                  boxShadow: `0 0 16px ${theme.accent}40`,
                }}>
                  {slideNum}
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  / {totalSlides}
                </span>
              </div>

              {/* Scrolling tagline */}
              <div style={{
                position: "absolute", top: 130, left: 0, width: "100%",
                overflow: "hidden", height: 20,
              }}>
                <div style={{
                  fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em",
                  color: `${theme.accent}50`, textTransform: "uppercase",
                  whiteSpace: "nowrap", paddingLeft: 20,
                  animation: "taglineSlide 6s ease-in-out infinite",
                }}>
                  {theme.tagline} &nbsp;&middot;&nbsp; {theme.tagline} &nbsp;&middot;&nbsp; {theme.tagline}
                </div>
              </div>

              {/* Main card content */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "380px",
                  animation: "slideUpBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                }}
              >
                {/* Video Placeholder - full width, immersive */}
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "20px",
                    background: theme.cardBg,
                    border: "2px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "20px",
                    position: "relative",
                    overflow: "hidden",
                    animation: "videoPlaceholderPulse 3s ease-in-out infinite",
                  }}
                >
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(120deg, transparent 30%, ${theme.accent}08 50%, transparent 70%)`,
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2.5s ease-in-out infinite",
                  }} />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
                  }} />
                  <div style={{ textAlign: "center", zIndex: 1 }}>
                    <div style={{
                      fontSize: "3rem",
                      animation: "emojiFloat 3s ease-in-out infinite",
                      filter: `drop-shadow(0 0 20px ${theme.accent}60)`,
                    }}>
                      {theme.emoji}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      marginTop: 8, justifyContent: "center",
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
                        display: "flex", justifyContent: "center", alignItems: "center",
                        boxShadow: `0 0 12px ${theme.accent}50`,
                      }}>
                        <div style={{
                          width: 0, height: 0,
                          borderLeft: "8px solid #fff",
                          borderTop: "5px solid transparent",
                          borderBottom: "5px solid transparent",
                          marginLeft: 2,
                        }} />
                      </div>
                      <span style={{
                        color: "rgba(255,255,255,0.4)", fontSize: "10px",
                        fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      }}>
                        Video Soon
                      </span>
                    </div>
                  </div>
                </div>

                {/* Glass Card Content */}
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: `0 0 50px ${theme.accent}08, 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
                    position: "relative",
                  }}
                >
                  {/* Corner glow accent */}
                  <div style={{
                    position: "absolute", top: -1, right: -1, width: 80, height: 80,
                    borderRadius: "0 20px 0 40px",
                    background: `linear-gradient(225deg, ${theme.accent}20, transparent)`,
                    pointerEvents: "none",
                  }} />

                  <h1
                    style={{
                      color: "#fff",
                      fontSize: "1.7rem",
                      fontWeight: 900,
                      lineHeight: 1.15,
                      letterSpacing: "-0.03em",
                      margin: "0 0 10px 0",
                      background: `linear-gradient(135deg, #fff 60%, ${theme.accent})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {card.title}
                  </h1>

                  <p
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {card.desc}
                  </p>

                  {/* Swipe hint */}
                  <div style={{
                    marginTop: 16, display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <div style={{
                      width: 16, height: 2, borderRadius: 1,
                      background: `${theme.accent}40`,
                    }} />
                    <span style={{
                      fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em",
                      color: `${theme.accent}60`, textTransform: "uppercase",
                    }}>
                      Swipe up for more
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating TikTok sidebar */}
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: "22%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                {/* Got it button */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <button
                    className="got-it-btn"
                    onClick={handleInteract}
                    style={{
                      width: 48, height: 48, borderRadius: "50%",
                      border: "none",
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentAlt})`,
                      color: "#fff", fontSize: "20px", cursor: "pointer",
                      display: "flex", justifyContent: "center", alignItems: "center",
                      transition: "transform 0.15s ease",
                      animation: "floatGlow 2.5s ease-in-out infinite",
                      ["--glow-color" as any]: `${theme.accent}50`,
                    }}
                  >
                    👍
                  </button>
                  <span style={{
                    color: "rgba(255,255,255,0.5)", fontSize: "9px",
                    fontWeight: 800, letterSpacing: "0.05em",
                  }}>
                    GOT IT
                  </span>
                </div>

                {/* XP indicator */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    fontSize: "18px",
                  }}>
                    ⭐
                  </div>
                  <span style={{
                    color: "rgba(255,255,255,0.5)", fontSize: "9px",
                    fontWeight: 800,
                  }}>
                    {Math.min(progress, 100)} XP
                  </span>
                </div>

                {/* Share-style button */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    fontSize: "18px",
                  }}>
                    🔗
                  </div>
                  <span style={{
                    color: "rgba(255,255,255,0.5)", fontSize: "9px",
                    fontWeight: 800,
                  }}>
                    SHARE
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* THE QUIZ ENGINE */}
      {quizUnlocked && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, width: "100%", height: "100%",
            background: "linear-gradient(160deg, #0f0c29 0%, #1a0a3e 40%, #0d1117 100%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
            textAlign: "center",
            animation: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: "absolute", width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,245,212,0.08) 0%, transparent 70%)",
            top: "10%", left: "-20%", filter: "blur(60px)",
          }} />
          <div style={{
            position: "absolute", width: 250, height: 250, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(224,64,251,0.06) 0%, transparent 70%)",
            bottom: "10%", right: "-15%", filter: "blur(60px)",
          }} />

          {!quizStarted ? (
            <>
              {/* Confetti burst ring */}
              <div style={{
                position: "absolute", width: 200, height: 200,
                borderRadius: "50%",
                border: "2px solid rgba(255,217,61,0.15)",
                animation: "confettiBurst 2s ease-out infinite",
              }} />
              <div style={{
                fontSize: "5rem", marginBottom: "12px",
                filter: "drop-shadow(0 0 40px rgba(255,217,61,0.5))",
                animation: "pulse 1.5s ease-in-out infinite",
              }}>
                🎯
              </div>
              <h2 style={{
                color: "#fff", fontSize: "2.4rem", fontWeight: 900,
                letterSpacing: "-0.04em", margin: "0 0 4px 0",
                background: "linear-gradient(135deg, #FFD93D, #FF6B6B)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Challenge Unlocked!
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.45)", fontSize: "0.9rem",
                fontWeight: 600, margin: "0 0 32px 0",
                letterSpacing: "0.02em",
              }}>
                Time to flex what you just learned
              </p>
              <button
                onClick={() => setQuizStarted(true)}
                style={{
                  padding: "16px 52px", fontSize: "16px", fontWeight: 900,
                  fontFamily: "inherit", borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #FFD93D, #FF6B6B)",
                  color: "#000", cursor: "pointer",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  boxShadow: "0 0 40px rgba(255,217,61,0.3), 0 8px 24px rgba(0,0,0,0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                Let's Go
              </button>
            </>
          ) : quizResult === null ? (
            <div style={{ width: "100%", maxWidth: 380, zIndex: 1 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "8px",
                  background: "linear-gradient(135deg, #7B61FF, #536DFE)",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  fontSize: "14px",
                }}>
                  🧠
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>
                  Pop Quiz
                </span>
              </div>

              <div
                style={{
                  padding: "24px 20px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <h3 style={{
                  color: "#fff", fontSize: "1.15rem", fontWeight: 700,
                  lineHeight: 1.45, letterSpacing: "-0.01em",
                  margin: "0 0 20px 0",
                }}>
                  {currentData.quiz.question}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {currentData.quiz.options.map(
                    (option: string, index: number) => {
                      const optionColors = ["#FF6B6B", "#FFD93D", "#00F5D4", "#7B61FF"];
                      return (
                        <button
                          className="quiz-option"
                          key={index}
                          onClick={() => handleAnswer(index)}
                          style={{
                            padding: "14px 16px",
                            fontSize: "14px", fontWeight: 600,
                            fontFamily: "inherit", borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.85)",
                            cursor: "pointer", textAlign: "left",
                            transition: "transform 0.1s ease, background 0.15s ease",
                            display: "flex", alignItems: "center", gap: 12,
                            animation: `quizOptionSlide 0.4s ease-out ${index * 0.08}s both`,
                          }}
                        >
                          <span style={{
                            width: 26, height: 26, borderRadius: "8px",
                            background: `${optionColors[index]}18`,
                            border: `1px solid ${optionColors[index]}30`,
                            display: "flex", justifyContent: "center", alignItems: "center",
                            fontSize: "11px", fontWeight: 900,
                            color: optionColors[index],
                            flexShrink: 0,
                          }}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "5rem", marginBottom: "12px",
                  filter: quizResult
                    ? "drop-shadow(0 0 50px rgba(0,245,212,0.6))"
                    : "drop-shadow(0 0 50px rgba(255,107,107,0.6))",
                  animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                }}
              >
                {quizResult ? "🏆" : "💀"}
              </div>
              <h2 style={{
                fontSize: "2.2rem", fontWeight: 900,
                letterSpacing: "-0.04em", margin: "0 0 6px 0",
                background: quizResult
                  ? "linear-gradient(135deg, #00F5D4, #06D6A0)"
                  : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {quizResult ? "Wall Street Shark!" : "Broke. Try Again."}
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: "0.9rem",
                fontWeight: 600, margin: "0 0 32px 0",
              }}>
                {quizResult ? "Big flex. Your money IQ just leveled up." : "No cap, review the slides and run it back."}
              </p>
              <button
                onClick={resetLoop}
                style={{
                  padding: "16px 48px", fontSize: "16px", fontWeight: 900,
                  fontFamily: "inherit", borderRadius: "14px",
                  border: "none",
                  background: quizResult
                    ? "linear-gradient(135deg, #00F5D4, #06D6A0)"
                    : "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                  color: "#000", cursor: "pointer",
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  boxShadow: quizResult
                    ? "0 0 40px rgba(0,245,212,0.3), 0 8px 24px rgba(0,0,0,0.4)"
                    : "0 0 40px rgba(255,107,107,0.3), 0 8px 24px rgba(0,0,0,0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                {quizResult ? "Keep Grinding" : "Run It Back"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
