import { useState, useEffect, useRef, useCallback } from "react";

// --- CORE ENGINE: GEMINI API ---
const generateCards = async (ageGroup) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  let persona =
    ageGroup === "Kids"
      ? "Older sibling (8-12)."
      : ageGroup === "Teens"
        ? "Gen-Z expert (13-17)."
        : "Real-world mentor (18-21).";
  const prompt = `${persona} Generate 4 financial lessons. RAW JSON ONLY. Structure: {"lessons": [{"id": 1, "title": "Title", "desc": "1-sentence", "miniGame": {"question": "Q", "options": ["A", "B"], "correctIndex": 0}}], "bossQuiz": {"question": "Final Q", "options": ["A", "B", "C"], "correctIndex": 0}}`;
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
    return JSON.parse(
      data.candidates[0].content.parts[0].text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim(),
    );
  } catch (e) {
    return null;
  }
};

// --- SCIENTIFICALLY PROVEN MULTIMEDIA ---
const videoBank = [
  "https://cdn.pixabay.com/video/2022/10/12/134651-760032958_tiny.mp4",
  "https://cdn.pixabay.com/video/2021/04/12/70882-536925565_tiny.mp4",
  "https://cdn.pixabay.com/video/2020/09/01/48753-455248100_tiny.mp4",
  "https://cdn.pixabay.com/video/2022/01/17/104523-666355831_tiny.mp4",
];

// 60 BPM Alpha-wave beats for study focus
const studyBeats = [
  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808f3030e.mp3", // Lo-fi Focus
  "https://cdn.pixabay.com/audio/2022/01/26/audio_d0c6ff11bd.mp3", // Chill Binaural
  "https://cdn.pixabay.com/audio/2023/10/24/audio_3330cc7d23.mp3", // Alpha Flow
];

const load = (k, d) => {
  const v = localStorage.getItem(`ws_${k}`);
  return v ? parseInt(v, 10) : d;
};
const save = (k, v) => localStorage.setItem(`ws_${k}`, String(v));

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

  const [xp, setXp] = useState(() => load("xp", 0));
  const [streak, setStreak] = useState(() => load("streak", 0));
  const [level, setLevel] = useState(() => load("level", 1));
  const [bossWins, setBossWins] = useState(() => load("bossWins", 0));

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const progress = Math.min((completedSlides.length / 3) * 100, 100);

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

  // Infinite Scroll Trigger
  const handleScroll = async (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollHeight - scrollTop <= clientHeight * 2 &&
      !isFetchingRef.current &&
      !quizUnlocked
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

  const handleMiniGame = (lessonId, idx, correct) => {
    if (slideAnswers[lessonId] !== undefined) return;
    setSlideAnswers((p) => ({ ...p, [lessonId]: idx }));
    if (idx === correct) {
      const nextCompleted = [...completedSlides, lessonId];
      setCompletedSlides(nextCompleted);
      setXp((p) => p + 10);
      if (nextCompleted.length >= 3) {
        setTimeout(() => setQuizUnlocked(true), 800);
      }
    }
  };

  const startSession = (age) => {
    setAgeGroup(age);
    setAppStarted(true);
    const audio = new Audio(
      studyBeats[Math.floor(Math.random() * studyBeats.length)],
    );
    audio.loop = true;
    audio.volume = 0.2;
    audioRef.current = audio;
    audio.play().catch(() => {});
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

  if (!appStarted) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          background: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
          padding: 20,
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: 900,
            background: "linear-gradient(to right, #06D6A0, #118AB2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 50,
          }}
        >
          WealthScroll
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 15,
            width: "100%",
            maxWidth: 340,
          }}
        >
          {["Kids", "Teens", "Young Adults"].map((age) => (
            <button
              key={age}
              onClick={() => startSession(age)}
              style={{
                padding: 25,
                borderRadius: 20,
                background: "#111",
                border: "1px solid #222",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              {age.toUpperCase()}
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
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        🚀 BUILDING FEED...
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
        fontFamily: "sans-serif",
      }}
    >
      {/* HUD Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          padding: "40px 20px 20px",
          zIndex: 10,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)",
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
            onClick={() => setShowProfile(true)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 10,
              padding: "8px 12px",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            👤 PROFILE
          </button>
          <div style={{ color: "#06D6A0", fontWeight: "bold" }}>XP {xp}</div>
        </div>
        <div
          style={{
            width: "100%",
            height: 4,
            background: "#222",
            borderRadius: 2,
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#06D6A0",
              transition: "0.5s",
            }}
          ></div>
        </div>
      </div>

      {/* FEED */}
      <div
        onScroll={handleScroll}
        style={{
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
        }}
      >
        {currentData.lessons.map((card, i) => (
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
              }}
            >
              <source src={videoBank[i % videoBank.length]} type="video/mp4" />
            </video>
            <div
              style={{
                position: "absolute",
                bottom: 60,
                left: 20,
                width: "calc(100% - 40px)",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(card.title)}`}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                  alt="tutor"
                />
                <h1
                  style={{
                    color: "#fff",
                    fontSize: "2rem",
                    fontWeight: 900,
                    margin: 0,
                  }}
                >
                  {card.title}
                </h1>
              </div>
              <p
                style={{ color: "#ccc", marginBottom: 25, fontSize: "1.1rem" }}
              >
                {card.desc}
              </p>
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: 20,
                  borderRadius: 24,
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p
                  style={{
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    marginBottom: 15,
                  }}
                >
                  {card.miniGame.question}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {card.miniGame.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleMiniGame(card.id, idx, card.miniGame.correctIndex)
                      }
                      style={{
                        width: "100%",
                        padding: 16,
                        borderRadius: 12,
                        border: "none",
                        background:
                          slideAnswers[card.id] === idx
                            ? idx === card.miniGame.correctIndex
                              ? "#06D6A0"
                              : "#E76F51"
                            : "rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUIZ & SUCCESS SCREEN (COMBINED FOR FLOW) */}
      {quizUnlocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#000",
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
            !quizStarted ? (
              <>
                <h1 style={{ fontSize: "5rem" }}>👑</h1>
                <h2
                  style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 900 }}
                >
                  BOSS FIGHT
                </h2>
                <button
                  onClick={() => setQuizStarted(true)}
                  style={{
                    padding: "20px 60px",
                    borderRadius: 40,
                    border: "none",
                    background: "#06D6A0",
                    fontWeight: "bold",
                    marginTop: 40,
                    color: "#000",
                  }}
                >
                  START ARENA ⚔️
                </button>
              </>
            ) : (
              <div style={{ width: "100%" }}>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "1.6rem",
                    marginBottom: 40,
                  }}
                >
                  {currentData.bossQuiz.question}
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {currentData.bossQuiz.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const win = i === currentData.bossQuiz.correctIndex;
                        setQuizResult(win);
                        if (win) {
                          setXp((p) => p + 50);
                          setStreak((p) => p + 1);
                          setBossWins((p) => p + 1);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: 20,
                        borderRadius: 15,
                        border: "1px solid #333",
                        background: "#111",
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <>
              <h1 style={{ fontSize: "6rem" }}>{quizResult ? "🏆" : "💀"}</h1>
              <h2
                style={{ color: "#fff", fontSize: "2.4rem", fontWeight: 900 }}
              >
                {quizResult ? "LEGENDARY" : "REKT"}
              </h2>
              {quizResult ? (
                <>
                  <p style={{ color: "#06D6A0", margin: "20px 0" }}>
                    Next quest starts in {countdown}s...
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={resetJourney}
                      style={{
                        padding: 20,
                        borderRadius: 40,
                        border: "none",
                        background: "#06D6A0",
                        fontWeight: "bold",
                        color: "#000",
                      }}
                    >
                      GO NOW 🚀
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `whatsapp://send?text=I leveled up on WealthScroll!`,
                        )
                      }
                      style={{
                        padding: 15,
                        borderRadius: 15,
                        background: "#25D366",
                        color: "#fff",
                        border: "none",
                        fontWeight: "bold",
                      }}
                    >
                      SHARE TO WA
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setQuizResult(null);
                    setQuizStarted(false);
                    setQuizUnlocked(false);
                    setCompletedSlides((p) => p.slice(0, -1));
                  }}
                  style={{
                    padding: 20,
                    width: "100%",
                    borderRadius: 40,
                    background: "#E76F51",
                    border: "none",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  TRY AGAIN
                </button>
              )}
            </>
          )}
        </div>
      )}

      {showProfile && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.98)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 40,
          }}
        >
          <button
            onClick={() => setShowProfile(false)}
            style={{
              alignSelf: "flex-end",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "2rem",
            }}
          >
            ×
          </button>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "6px solid #06D6A0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "2rem",
              color: "#fff",
              marginBottom: 20,
            }}
          >
            {level}
          </div>
          <h2 style={{ color: "#fff" }}>Level {level}</h2>
          <div
            style={{
              background: "#111",
              padding: 20,
              borderRadius: 20,
              marginTop: 40,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#FFD93D",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {streak}🔥
            </div>
            <div style={{ color: "#444", fontSize: "10px" }}>
              CURRENT STREAK
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
