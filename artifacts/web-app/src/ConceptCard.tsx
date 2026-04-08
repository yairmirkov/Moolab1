import type { Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

const CONCEPT_VIDEOS = [
  "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2795167/2795167-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/2516159/2516159-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/3214435/3214435-hd_1920_1080_25fps.mp4",
];

function getConceptVideo(id: string | number): string {
  let hash = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  return CONCEPT_VIDEOS[Math.abs(hash) % CONCEPT_VIDEOS.length];
}

interface ConceptCardProps {
  card: {
    id: string | number;
    term: string;
    definition: string;
    analogy: string;
    tooltip_explanation?: string;
  };
  lang: Lang;
  onTooltip?: (text: string) => void;
}

export default function ConceptCard({ card, lang, onTooltip }: ConceptCardProps) {
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
        background: "#000",
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes conceptFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <video
        autoPlay muted loop playsInline preload="auto"
        onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", zIndex: 0,
        }}
      >
        <source src={getConceptVideo(card.id)} type="video/mp4" />
      </video>

      <div style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        zIndex: 1,
      }}>
        <div style={{
          maxHeight: "45vh",
          background: "linear-gradient(to top, rgba(0,20,40,0.95) 0%, rgba(0,20,40,0.8) 60%, transparent 100%)",
          padding: "50px 28px 80px",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 12, overflowY: "auto", scrollbarWidth: "none",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 6,
            background: "rgba(46,139,192,0.25)",
            border: "1px solid rgba(46,139,192,0.4)",
            animation: "conceptFadeUp 0.5s ease-out both",
          }}>
            <span style={{
              fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.2em",
              color: "#b1d4e0", textTransform: "uppercase",
            }}>
              {lang === "es" ? "CONCEPTO LAB" : "LAB CONCEPT"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <h1 style={{
              fontSize: "clamp(2rem, 8vw, 3rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              textAlign: "center",
              margin: 0,
              maxWidth: 380,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              animation: "conceptFadeUp 0.6s ease-out 0.1s both",
            }}>
              {term}
            </h1>
            {card.tooltip_explanation && onTooltip && (
              <button
                onClick={() => onTooltip(card.tooltip_explanation!)}
                style={{
                  width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(177,212,224,0.4)",
                  background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
                  color: "#b1d4e0", fontSize: "0.75rem", fontWeight: 800,
                  cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, animation: "conceptFadeUp 0.6s ease-out 0.1s both",
                }}
              >?</button>
            )}
          </div>

          <p style={{
            fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)",
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.45,
            textAlign: "center",
            margin: 0,
            maxWidth: 360,
            animation: "conceptFadeUp 0.6s ease-out 0.2s both",
          }}>
            {definition}
          </p>

          <div style={{
            width: "100%",
            maxWidth: 360,
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "conceptFadeUp 0.6s ease-out 0.3s both",
          }}>
            <div style={{
              fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.15em",
              color: "rgba(177,212,224,0.5)", textTransform: "uppercase", marginBottom: 6,
            }}>
              {lang === "es" ? "ANALOGÍA" : "ANALOGY"}
            </div>
            <p style={{
              fontSize: "clamp(0.85rem, 3vw, 0.95rem)",
              fontWeight: 600,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.45,
              margin: 0,
            }}>
              "{analogy}"
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
