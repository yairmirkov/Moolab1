import { Mentor } from "./mentors";

const DOT_BG = "radial-gradient(circle, rgba(46,139,192,0.12) 1px, transparent 1px) / 32px 32px";

interface Props {
  mentor: Mentor;
  onBack: () => void;
  onStartLesson?: (mentor: Mentor) => void;
}

export default function MentorProfile({ mentor, onBack, onStartLesson }: Props) {
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
          onClick={() => onStartLesson?.(mentor)}
          style={{ width: "100%", background: "linear-gradient(135deg, #2e8bc0, #1a6a99)", border: "none", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 4 }}>Bonus Lesson</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{mentor.lessonTitle}</div>
          </div>
          <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</div>
        </button>
      </div>

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
