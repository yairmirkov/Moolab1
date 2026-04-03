import { useState, useEffect } from "react";

// 1. The API call function (The Brain)
const generateCards = async (ageGroup: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // The specific prompt we send to the AI
  const prompt = `You are a fun, engaging financial literacy app. 
  Generate 3 short financial lessons for a user aged ${ageGroup}. 
  Return ONLY a raw JSON array of objects. Do not include markdown formatting or the word 'json'. 
  Each object must have exactly these keys:
  "id" (number 1, 2, or 3),
  "title" (a short, catchy title with an emoji),
  "desc" (a 1-sentence explanation),
  "color" (a bright, modern hex color code like "#FF595E").`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    const data = await response.json();

    // Cleaning up the AI's response to turn it into usable data
    let aiText = data.candidates[0].content.parts[0].text;
    aiText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(aiText);
  } catch (error) {
    console.error("AI Error:", error);
    return [
      {
        id: 1,
        title: "⚠️ Error",
        desc: "The AI is taking a nap. Try again!",
        color: "#E76F51",
      },
    ];
  }
};

function App() {
  const [ageGroup, setAgeGroup] = useState("8-12");
  const [currentCards, setCurrentCards] = useState<any[]>([]); // Data is empty until AI loads
  const [loading, setLoading] = useState(true); // Loading screen state
  const [progress, setProgress] = useState(0);
  const [quizUnlocked, setQuizUnlocked] = useState(false);

  // 2. The Trigger: Every time the age dropdown changes, call the AI
  useEffect(() => {
    setLoading(true);
    setProgress(0);
    setQuizUnlocked(false);

    generateCards(ageGroup).then((newCards) => {
      setCurrentCards(newCards);
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

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        maxWidth: "400px",
        margin: "0 auto",
        backgroundColor: "#000",
        height: "100vh",
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

        {/* Progress Bar */}
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

      {/* 3. The Loading Screen */}
      {loading ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#111",
            color: "#fff",
            fontSize: "1.5rem",
          }}
        >
          <p>🤖 AI is thinking...</p>
        </div>
      ) : (
        /* The Feed */
        <div
          style={{
            height: "100vh",
            overflowY: "scroll",
            scrollSnapType: "y mandatory",
          }}
        >
          {currentCards.map((card) => (
            <div
              key={card.id}
              style={{
                height: "100vh",
                width: "100%",
                backgroundColor: card.color,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                scrollSnapAlign: "start",
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
      )}

      {/* The Quiz Modal */}
      {quizUnlocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.95)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h1
            style={{ color: "#06D6A0", fontSize: "3rem", marginBottom: "10px" }}
          >
            🎯
          </h1>
          <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: "20px" }}>
            Daily Challenge Unlocked!
          </h2>
          <button
            onClick={() => {
              setProgress(0);
              setQuizUnlocked(false);
            }}
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
        </div>
      )}
    </div>
  );
}

export default App;
