import { useState } from "react";
import { CORE_MENTORS, HONORABLE_MENTORS, Mentor } from "./mentors";
import MentorProfile from "./MentorProfile";

const DOT_BG = "radial-gradient(circle, rgba(46,139,192,0.12) 1px, transparent 1px) / 32px 32px";
const CARD = { background: "rgba(12,45,72,0.45)", backdropFilter: "blur(20px)", border: "1px solid rgba(46,139,192,0.2)", borderRadius: 16 };

export default function MentorHub() {
  const [selected, setSelected] = useState<Mentor | null>(null);

  if (selected) return <MentorProfile mentor={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ minHeight: "100vh", background: `#020a14 ${DOT_BG}`, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#e8f4f8", marginBottom: 4 }}>Mentors</div>
        <div style={{ fontSize: 14, color: "rgba(177,212,224,0.5)" }}>Learn from the world's greatest investors & builders</div>
      </div>

      {/* Featured banner */}
      <div style={{ margin: "20px 20px 0", ...CARD, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 28 }}>✨</div>
        <div>
          <div style={{ color: "#e8f4f8", fontSize: 14, fontWeight: 600 }}>New lessons added weekly</div>
          <div style={{ color: "rgba(177,212,224,0.5)", fontSize: 12, marginTop: 2 }}>Each mentor has a personalized bonus lesson just for you</div>
        </div>
      </div>

      {/* Core Mentors */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ fontSize: 11, color: "rgba(177,212,224,0.4)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 14 }}>Core Mentors</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {CORE_MENTORS.map(m => (
            <MentorCard key={m.id} mentor={m} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>

      {/* Honorable Mentions */}
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ fontSize: 11, color: "rgba(177,212,224,0.4)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 14 }}>Honorable Mentions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {HONORABLE_MENTORS.map(m => (
            <MentorCard key={m.id} mentor={m} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MentorCard({ mentor, onClick }: { mentor: Mentor; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(12,45,72,0.65)" : "rgba(12,45,72,0.45)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(46,139,192,0.2)",
        borderRadius: 16,
        padding: "16px 14px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
    >
      {/* top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #2e8bc0 0%, rgba(46,139,192,0) 100%)" }} />
      <div style={{ fontSize: 32, marginBottom: 10 }}>{mentor.emoji}</div>
      <div style={{ color: "#e8f4f8", fontSize: 13, fontWeight: 600, lineHeight: 1.2, marginBottom: 3 }}>{mentor.name}</div>
      <div style={{ color: "rgba(177,212,224,0.45)", fontSize: 11, lineHeight: 1.3, marginBottom: 10 }}>{mentor.title}</div>
      <div style={{ display: "inline-block", background: "rgba(46,139,192,0.12)", border: "1px solid rgba(46,139,192,0.2)", color: "#2e8bc0", fontSize: 10, padding: "3px 8px", borderRadius: 6 }}>
        {mentor.tagline}
      </div>
    </div>
  );
}
