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

const glowColors = ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"];

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
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          color: "#fff",
          fontSize: "1.5rem",
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: "0 auto 20px",
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: "#06D6A0",
              borderRightColor: "#FF595E",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ textShadow: "0 0 30px rgba(6,214,160,0.4)" }}>
            AI is building your lesson...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        background: "linear-gradient(180deg, #0a0a0a 0%, #111122 100%)",
        height: "100dvh",
        overflow: "hidden",
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(6,214,160,0.3), 0 0 60px rgba(6,214,160,0.1); }
          50% { box-shadow: 0 0 30px rgba(6,214,160,0.5), 0 0 80px rgba(6,214,160,0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes borderGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .quiz-option:active {
          transform: scale(0.97) !important;
        }
        .got-it-btn:active {
          transform: scale(0.9) !important;
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          padding: "16px 20px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          <option value="8-12" style={{ background: "#1a1a2e", color: "#fff" }}>Level 1: Explorer (Age 8-12)</option>
          <option value="13-16" style={{ background: "#1a1a2e", color: "#fff" }}>Level 2: Hustler (Age 13-16)</option>
          <option value="17-21" style={{ background: "#1a1a2e", color: "#fff" }}>Level 3: Investor (Age 17-21)</option>
        </select>

        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #06D6A0, #00E5FF)",
              borderRadius: "10px",
              transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: progress > 0 ? "0 0 12px rgba(6,214,160,0.6)" : "none",
            }}
          />
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
          const glow = glowColors[index % glowColors.length];
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
                padding: "20px",
                textAlign: "center",
                position: "relative",
                background: `radial-gradient(ellipse at 50% 30%, ${glow}15 0%, transparent 60%), linear-gradient(180deg, #0d0d1a 0%, #111122 50%, #0a0a14 100%)`,
              }}
            >
              {/* Glassmorphism Card */}
              <div
                style={{
                  position: "relative",
                  width: "90%",
                  maxWidth: "360px",
                  padding: "28px 24px",
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: `0 0 40px ${glow}15, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  animation: "slideUp 0.6s ease-out both",
                }}
              >
                {/* Animated border glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: -1,
                    borderRadius: "24px",
                    background: `linear-gradient(135deg, ${glow}40, transparent 50%, ${glow}20)`,
                    zIndex: -1,
                    animation: "borderGlow 3s ease-in-out infinite",
                  }}
                />

                {/* Video / Avatar Placeholder */}
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "16px",
                    background: `linear-gradient(135deg, ${glow}12, rgba(255,255,255,0.03))`,
                    border: "1px dashed rgba(255,255,255,0.12)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "24px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(90deg, transparent, ${glow}08, transparent)`,
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s ease-in-out infinite",
                    }}
                  />
                  <div style={{ textAlign: "center", zIndex: 1 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${glow}30, ${glow}10)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto 8px",
                        border: `1px solid ${glow}30`,
                      }}
                    >
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: "12px solid rgba(255,255,255,0.7)",
                          borderTop: "7px solid transparent",
                          borderBottom: "7px solid transparent",
                          marginLeft: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Video Coming Soon
                    </span>
                  </div>
                </div>

                {/* Card Title */}
                <h1
                  style={{
                    color: "#fff",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    lineHeight: 1.15,
                    marginBottom: "12px",
                    letterSpacing: "-0.03em",
                    textShadow: `0 0 40px ${glow}40, 0 2px 8px rgba(0,0,0,0.5)`,
                    margin: "0 0 12px 0",
                  }}
                >
                  {card.title}
                </h1>

                {/* Card Description */}
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "1rem",
                    fontWeight: 500,
                    lineHeight: 1.55,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {card.desc}
                </p>
              </div>

              {/* Floating TikTok-style "Got it" button on right side */}
              <div
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: "30%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <button
                  className="got-it-btn"
                  onClick={handleInteract}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    border: "none",
                    background: "linear-gradient(135deg, #06D6A0, #00E5FF)",
                    color: "#fff",
                    fontSize: "22px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 0 20px rgba(6,214,160,0.4), 0 4px 16px rgba(0,0,0,0.3)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    animation: "floatGlow 2.5s ease-in-out infinite",
                  }}
                >
                  <span role="img" aria-label="thumbs up" style={{ lineHeight: 1 }}>
                    👍
                  </span>
                </button>
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Got it
                </span>
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
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, #0a0a1a 0%, #111128 50%, #0a0a1a 100%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
            textAlign: "center",
            animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          {!quizStarted ? (
            <>
              <div
                style={{
                  fontSize: "5rem",
                  marginBottom: "16px",
                  filter: "drop-shadow(0 0 30px rgba(6,214,160,0.5))",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                🎯
              </div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  marginBottom: "8px",
                  textShadow: "0 0 40px rgba(6,214,160,0.3)",
                  margin: "0 0 8px 0",
                }}
              >
                Challenge Unlocked!
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: "32px",
                  margin: "0 0 32px 0",
                }}
              >
                Prove what you just learned
              </p>
              <button
                onClick={() => setQuizStarted(true)}
                style={{
                  padding: "16px 48px",
                  fontSize: "18px",
                  fontWeight: 800,
                  fontFamily: "inherit",
                  borderRadius: "16px",
                  border: "1px solid rgba(6,214,160,0.3)",
                  background: "linear-gradient(135deg, #06D6A0, #00C896)",
                  color: "#fff",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  boxShadow: "0 0 30px rgba(6,214,160,0.3), 0 8px 24px rgba(0,0,0,0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                Start Quiz
              </button>
            </>
          ) : quizResult === null ? (
            <div style={{ width: "100%", maxWidth: 380 }}>
              {/* Quiz glass card */}
              <div
                style={{
                  padding: "28px 24px",
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    lineHeight: 1.4,
                    letterSpacing: "-0.02em",
                    marginBottom: "24px",
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    margin: "0 0 24px 0",
                  }}
                >
                  {currentData.quiz.question}
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {currentData.quiz.options.map(
                    (option: string, index: number) => (
                      <button
                        className="quiz-option"
                        key={index}
                        onClick={() => handleAnswer(index)}
                        style={{
                          padding: "14px 18px",
                          fontSize: "15px",
                          fontWeight: 600,
                          fontFamily: "inherit",
                          borderRadius: "14px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.9)",
                          cursor: "pointer",
                          textAlign: "left",
                          letterSpacing: "-0.01em",
                          transition: "transform 0.1s ease, background 0.15s ease, border-color 0.15s ease",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.borderColor = "rgba(6,214,160,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        }}
                      >
                        <span style={{ opacity: 0.4, marginRight: 10, fontWeight: 700 }}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "5rem",
                  marginBottom: "16px",
                  filter: quizResult
                    ? "drop-shadow(0 0 40px rgba(6,214,160,0.5))"
                    : "drop-shadow(0 0 40px rgba(231,111,81,0.5))",
                  animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                }}
              >
                {quizResult ? "🏆" : "💀"}
              </div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "2rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  marginBottom: "8px",
                  textShadow: quizResult
                    ? "0 0 40px rgba(6,214,160,0.3)"
                    : "0 0 40px rgba(231,111,81,0.3)",
                  margin: "0 0 8px 0",
                }}
              >
                {quizResult ? "Wall Street Shark!" : "Broke. Try Again."}
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: "32px",
                  margin: "0 0 32px 0",
                }}
              >
                {quizResult ? "You crushed it. Keep the streak going." : "No worries. Review and come back stronger."}
              </p>
              <button
                onClick={resetLoop}
                style={{
                  padding: "16px 48px",
                  fontSize: "18px",
                  fontWeight: 800,
                  fontFamily: "inherit",
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: quizResult ? "rgba(6,214,160,0.3)" : "rgba(231,111,81,0.3)",
                  background: quizResult
                    ? "linear-gradient(135deg, #06D6A0, #00C896)"
                    : "linear-gradient(135deg, #E76F51, #D64933)",
                  color: "#fff",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  boxShadow: quizResult
                    ? "0 0 30px rgba(6,214,160,0.3), 0 8px 24px rgba(0,0,0,0.4)"
                    : "0 0 30px rgba(231,111,81,0.3), 0 8px 24px rgba(0,0,0,0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                Keep Learning
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
