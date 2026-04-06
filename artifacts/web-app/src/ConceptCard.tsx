import type { Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const NAVY = "#001F5B";

interface ConceptCardProps {
  card: {
    id: string | number;
    term: string;
    definition: string;
    analogy: string;
  };
  lang: Lang;
  onContinue: () => void;
}

export default function ConceptCard({ card, lang, onContinue }: ConceptCardProps) {
  const term = card.term || (lang === "es" ? "Concepto Financiero" : "Financial Concept");
  const definition = card.definition || (lang === "es" ? "Definición no disponible." : "Definition not available.");
  const analogy = card.analogy || (lang === "es" ? "Piénsalo de esta manera..." : "Think of it this way...");
  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        position: "relative",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 28px 80px",
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes conceptFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes conceptPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 6,
        background: NAVY, marginBottom: 40,
        animation: "conceptFadeUp 0.5s ease-out both",
      }}>
        <span style={{
          fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.2em",
          color: "#fff", textTransform: "uppercase",
        }}>
          {lang === "es" ? "CONCEPTO LAB" : "LAB CONCEPT"}
        </span>
      </div>

      <h1 style={{
        fontSize: "clamp(2rem, 8vw, 3.2rem)",
        fontWeight: 900,
        color: NAVY,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        textAlign: "center",
        margin: "0 0 28px",
        maxWidth: 500,
        animation: "conceptFadeUp 0.6s ease-out 0.1s both",
      }}>
        {term}
      </h1>

      <p style={{
        fontSize: "1rem",
        fontWeight: 500,
        color: "rgba(0,31,91,0.75)",
        lineHeight: 1.65,
        textAlign: "center",
        margin: "0 0 32px",
        maxWidth: 440,
        animation: "conceptFadeUp 0.6s ease-out 0.2s both",
      }}>
        {definition}
      </p>

      <div style={{
        width: "100%",
        maxWidth: 440,
        padding: "20px 24px",
        borderRadius: 14,
        background: "rgba(0,31,91,0.04)",
        border: "1px solid rgba(0,31,91,0.08)",
        animation: "conceptFadeUp 0.6s ease-out 0.3s both",
      }}>
        <div style={{
          fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.15em",
          color: "rgba(0,31,91,0.35)", textTransform: "uppercase", marginBottom: 10,
        }}>
          {lang === "es" ? "ANALOGÍA" : "ANALOGY"}
        </div>
        <p style={{
          fontSize: "0.92rem",
          fontWeight: 500,
          fontStyle: "italic",
          color: "rgba(0,31,91,0.6)",
          lineHeight: 1.6,
          margin: 0,
        }}>
          "{analogy}"
        </p>
      </div>

      <button
        onClick={onContinue}
        style={{
          position: "absolute",
          bottom: 60,
          padding: "12px 28px",
          borderRadius: 10,
          background: NAVY,
          border: "none",
          color: "#fff",
          fontSize: "0.72rem",
          fontWeight: 800,
          letterSpacing: "0.06em",
          cursor: "pointer",
          fontFamily: FONT,
          animation: "conceptPulse 2.5s ease-in-out infinite",
          boxShadow: "0 2px 12px rgba(0,31,91,0.2)",
        }}
      >
        {lang === "es" ? "Continuar ⚡" : "Tap to Continue ⚡"}
      </button>
    </div>
  );
}
