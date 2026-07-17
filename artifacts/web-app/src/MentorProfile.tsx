import { useState } from "react";
import { Mentor } from "./mentors";
import { buildMentorLessonPrompt } from "./cardPrompt";
import { useAuth } from "./AuthContext";

interface LessonCard {
  type: "intro" | "concept" | "quote" | "challenge";
  emoji: string;
  title: string;
  body: string;
}

const DOT_BG = "radial-gradient(circle, rgba(46,139,192,0.12) 1px, transparent 1px) / 32px 32px";

interface Props {
  mentor: Mentor;
  onBack: () => void;
  onStartLesson?: (mentor: Mentor) => void;
}

export default function MentorProfile({ mentor, onBack, onStartLesson }: Props) {
  const auth = useAuth();
  const [lessonCards, setLessonCards] = useState<LessonCard[] | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  const resolveGradeLevel = (): number => {
    const g = parseInt(auth?.child?.grade || "", 10);
    if (!isNaN(g) && g >= 1 && g <= 12) return g;
    const age = localStorage.getItem("ws_ageGroup") || "";
    if (age.startsWith("8")) return 4;
    if (age.startsWith("13")) return 7;
    if (age.startsWith("16") || age.startsWith("18")) return 10;
    return 7;
  };

  const startLesson = async () => {
    onStartLesson?.(mentor);
    setLessonLoading(true);
    setLessonError(null);
    try {
      const prompt = buildMentorLessonPrompt(mentor, resolveGradeLevel());
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/gemini/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ prompt }),
        },
      );
      if (!response.ok) throw new Error(`gemini request failed: ${response.status}`);
      const data = await response.json();
      const cleanText = (data?.text || "")
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanText);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("bad lesson payload");
      const cards = parsed
          .filter((c: any) => c && typeof c.title === "string" && typeof c.body === "string")
          .map((c: any) => ({
            type: ["intro", "concept", "quote", "challenge"].includes(c.type) ? c.type : "concept",
            emoji: typeof c.emoji === "string" && c.emoji ? c.emoji : mentor.emoji,
            title: c.title,
            body: c.body,
          }));
      if (cards.length === 0) throw new Error("no valid lesson cards");
      setLessonCards(cards);
    } catch {
      setLessonError("Couldn't load the lesson. Please try again.");
    } finally {
      setLessonLoading(false);
    }
  };

  if (lessonCards) {
    return <MentorLessonViewer mentor={mentor} cards={lessonCards} onClose={() => setLessonCards(null)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: `#020a14 ${DOT_BG}`, paddingBottom: 40 }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#2e8bc0", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
          ‹ Mentors
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "24px 20px 20px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(46,139,192,0.1)", border: "2px solid rgba(46,139,192,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 14px" }}>
          {mentor.emoji}
        </div>
        <div style={{ color: "#e8f4f8", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{mentor.name}</div>
        <div style={{ color: "#2e8bc0", fontSize: 13, marginBottom: 14 }}>{mentor.title}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {mentor.tags.map(tag => (
            <span key={tag} style={{ background: "rgba(46,139,192,0.1)", border: "1px solid rgba(46,139,192,0.2)", color: "rgba(177,212,224,0.7)", fontSize: 11, padding: "4px 10px", borderRadius: 8 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bio */}
      <Section title="What makes them legendary">
        <p style={{ color: "rgba(177,212,224,0.8)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{mentor.whyLegendary}</p>
      </Section>

      {/* Quotes */}
      <div style={{ padding: "0 20px", marginBottom: 20 }}>
        <SectionTitle>Famous quotes</SectionTitle>
        {mentor.quotes.slice(0, 2).map((q, i) => (
          <div key={i} style={{ background: "rgba(46,139,192,0.06)", borderLeft: "2px solid #2e8bc0", borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 10 }}>
            <p style={{ color: "#b1d4e0", fontSize: 13, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 6px" }}>"{q.text}"</p>
            <p style={{ color: "rgba(177,212,224,0.35)", fontSize: 11, margin: 0 }}>— {q.source}</p>
          </div>
        ))}
      </div>

      {/* Key ideas */}
      <Section title="Key ideas you'll learn">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mentor.keyIdeas.map((idea, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: "#2e8bc0", fontSize: 16, lineHeight: 1.4 }}>·</span>
              <span style={{ color: "rgba(177,212,224,0.8)", fontSize: 14, lineHeight: 1.5 }}>{idea}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Lesson CTA */}
      <div style={{ margin: "8px 20px 0" }}>
        <button
          onClick={startLesson}
          disabled={lessonLoading}
          style={{ width: "100%", background: "linear-gradient(135deg, #2e8bc0, #1a6a99)", border: "none", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 4 }}>Bonus Lesson</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{lessonLoading ? "Preparing your lesson..." : mentor.lessonTitle}</div>
          </div>
          <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</div>
        </button>
      </div>

      {lessonError && (
        <p style={{ color: "#ff8a8a", fontSize: 12, textAlign: "center", margin: "12px 20px 0" }}>{lessonError}</p>
      )}

      {/* Disclaimer */}
      <p style={{ color: "rgba(177,212,224,0.28)", fontSize: 11, lineHeight: 1.6, textAlign: "center", margin: "20px 20px 0", padding: "0 10px" }}>
        Educational content inspired by publicly available works and interviews. Not affiliated with or endorsed by these individuals.
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: "rgba(177,212,224,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "0 20px", marginBottom: 22 }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}


const TYPE_LABEL: Record<LessonCard["type"], string> = {
  intro: "BONUS LESSON",
  concept: "LESSON CONCEPT",
  quote: "FAMOUS QUOTE",
  challenge: "YOUR CHALLENGE",
};

function MentorLessonViewer({ mentor, cards, onClose }: { mentor: Mentor; cards: LessonCard[]; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: `#020a14 ${DOT_BG}`, overflowY: "auto", scrollSnapType: "y mandatory" }}>
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 210,
          background: "rgba(12,45,72,0.65)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(46,139,192,0.3)", borderRadius: 999,
          color: "#b1d4e0", fontSize: 13, fontWeight: 700,
          padding: "8px 16px", cursor: "pointer",
        }}
      >
        ✕ Close
      </button>
      {cards.map((card, i) => (
        <div key={i} style={{ minHeight: "100vh", scrollSnapAlign: "start", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{
            width: "100%", maxWidth: 480,
            background: "rgba(12,45,72,0.45)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(46,139,192,0.2)", borderRadius: 20,
            padding: "32px 26px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #2e8bc0, rgba(46,139,192,0))" }} />
            <div style={{ fontSize: 10, letterSpacing: "1.5px", color: "#2e8bc0", fontWeight: 800, marginBottom: 14 }}>
              {TYPE_LABEL[card.type]} · {mentor.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 44, marginBottom: 14 }}>{card.emoji}</div>
            <div style={{ color: "#e8f4f8", fontSize: 22, fontWeight: 700, lineHeight: 1.25, marginBottom: 12 }}>{card.title}</div>
            <p style={{ color: "rgba(177,212,224,0.85)", fontSize: 15, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{card.body}</p>
            <div style={{ color: "rgba(177,212,224,0.3)", fontSize: 11, marginTop: 24, textAlign: "center" }}>
              {i < cards.length - 1 ? `↓ Swipe for next · ${i + 1}/${cards.length}` : `That's the lesson! ✕ to finish · ${i + 1}/${cards.length}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
