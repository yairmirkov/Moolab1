import { useState, useEffect } from "react";

const generateCards = async (ageGroup: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `You are a fun, engaging financial literacy app. 
  Generate a lesson plan for a user aged ${ageGroup}.
  Return ONLY raw JSON. No markdown, no backticks.
  The JSON must have this exact structure:
  {
    "lessons": [
      { "id": 1, "title": "Catchy Title 🚀", "desc": "1-sentence explanation", "color": "#FF595E" },
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
            title: "⚠️ API Error",
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
        { id: 1, title: "⚠️ Error", desc: "AI Nap time.", color: "#E76F51" },
      ],
      quiz: {
        question: "Error loading?",
        options: ["Yes", "No"],
        correctIndex: 0,
      },
    };
  }
};

function App() {
  const [ageGroup, setAgeGroup] = useState("8-12");
  const [currentData, setCurrentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [quizUnlocked, setQuizUnlocked] = useState(false);

  // NEW: Quiz State
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
          backgroundColor: "#111",
          color: "#fff",
          fontSize: "1.5rem",
        }}
      >
        <p>🤖 AI is building your lesson...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "#000",
        height: "100dvh",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* The Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          padding: "20px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <option value="8-12">Level 1: Explorer (Age 8-12)</option>
          <option value="13-16">Level 2: Hustler (Age 13-16)</option>
          <option value="17-21">Level 3: Investor (Age 17-21)</option>
        </select>
        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor: "#333",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#06D6A0",
              transition: "width 0.4s ease-in-out",
            }}
          ></div>
        </div>
      </div>

      {/* The Feed */}
      <div
        style={{
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
        }}
      >
        {currentData.lessons.map((card: any) => (
          <div
            key={card.id}
            style={{
              height: "100dvh",
              width: "100%",
              backgroundColor: card.color,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                color: "#fff",
                fontSize: "2.5rem",
                marginBottom: "10px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {card.title}
            </h1>
            <p
              style={{
                color: "#fff",
                fontSize: "1.2rem",
                maxWidth: "80%",
                opacity: 0.9,
                fontWeight: "500",
                marginBottom: "30px",
              }}
            >
              {card.desc}
            </p>
            <button
              onClick={handleInteract}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "30px",
                border: "none",
                backgroundColor: "#fff",
                color: "#000",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            >
              Got it! 👍
            </button>
          </div>
        ))}
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
            backgroundColor: "#111",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
          }}
        >
          {!quizStarted ? (
            // Pre-Quiz Screen
            <>
              <h1
                style={{
                  color: "#06D6A0",
                  fontSize: "4rem",
                  marginBottom: "10px",
                }}
              >
                🎯
              </h1>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "2rem",
                  marginBottom: "20px",
                }}
              >
                Challenge Unlocked!
              </h2>
              <button
                onClick={() => setQuizStarted(true)}
                style={{
                  padding: "15px 40px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  borderRadius: "30px",
                  border: "none",
                  backgroundColor: "#06D6A0",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Start Quiz 🚀
              </button>
            </>
          ) : quizResult === null ? (
            // The Actual Quiz
            <div style={{ width: "100%" }}>
              <h3
                style={{
                  color: "#fff",
                  fontSize: "1.5rem",
                  marginBottom: "30px",
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
                      key={index}
                      onClick={() => handleAnswer(index)}
                      style={{
                        padding: "15px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        borderRadius: "15px",
                        border: "none",
                        backgroundColor: "#333",
                        color: "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            // The Result Screen
            <>
              <h1 style={{ fontSize: "4rem", marginBottom: "10px" }}>
                {quizResult ? "🏆" : "💀"}
              </h1>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "2rem",
                  marginBottom: "20px",
                }}
              >
                {quizResult ? "Wall Street Shark!" : "Broke. Try Again."}
              </h2>
              <button
                onClick={resetLoop}
                style={{
                  padding: "15px 40px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  borderRadius: "30px",
                  border: "none",
                  backgroundColor: quizResult ? "#06D6A0" : "#E76F51",
                  color: "#fff",
                  cursor: "pointer",
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
