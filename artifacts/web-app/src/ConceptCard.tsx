import type { Lang } from "./translations";
import { getFallbackVideo } from "./pexelsVideo";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const SMALL_FONT = "'Lato', system-ui, -apple-system, sans-serif";
const HEADING_FONT = "'Bricolage Grotesque', 'Lato', system-ui, sans-serif";

const CARD_NEONS = ["#ff2d95","#39ff14","#ff9500","#00d4ff","#bf5cff","#ffe600","#ff3366","#00ffc8","#ff6ec7","#7afcff"];

interface ConceptCardProps {
  card: {
    id: string | number;
    term: string;
    definition: string;
    analogy: string;
    tooltip_explanation?: string;
    video_search_keyword?: string;
    video_url?: string;
  };
  lang: Lang;
  onTooltip?: (text: string) => void;
  isWide?: boolean;
}

export default function ConceptCard({ card, lang, onTooltip, isWide = false }: ConceptCardProps) {
  const term = card.term || (lang === "es" ? "Concepto Financiero" : "Financial Concept");
  const definition = card.definition || (lang === "es" ? "Definición no disponible." : "Definition not available.");
  const analogy = card.analogy || (lang === "es" ? "Piénsalo de esta manera..." : "Think of it this way...");
  const videoUrl = card.video_url || getFallbackVideo(card.id);

  const seed = String(card.id || "concept");
  let h1 = 0, h2 = 0;
  for (let k = 0; k < seed.length; k++) {
    h1 = (h1 * 31 + seed.charCodeAt(k)) >>> 0;
    h2 = (h2 * 17 + seed.charCodeAt(k) * 7) >>> 0;
  }
  const neonA = CARD_NEONS[h1 % CARD_NEONS.length];
  let neonB = CARD_NEONS[h2 % CARD_NEONS.length];
  if (neonB === neonA) neonB = CARD_NEONS[(h2 + 3) % CARD_NEONS.length];

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        position: "relative",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        overflow: "hidden",
        background: isWide
          ? "linear-gradient(160deg, #051528 0%, #020a14 100%)"
          : "#000",
        fontFamily: FONT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isWide ? 32 : 0,
      }}
    >
      <style>{`
        @keyframes conceptFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes conceptGlow { 0%,100% { box-shadow: 0 0 0 1.5px ${neonA}88, 0 0 28px ${neonA}55, 0 0 60px ${neonB}22, inset 0 1px 0 rgba(255,255,255,0.04); } 50% { box-shadow: 0 0 0 1.5px ${neonA}cc, 0 0 44px ${neonA}77, 0 0 80px ${neonB}44, inset 0 1px 0 rgba(255,255,255,0.06); } }
        @keyframes conceptOrb { 0%,100% { opacity: 0.55; transform: translate(0,0) scale(1); } 50% { opacity: 0.85; transform: translate(6px,-4px) scale(1.08); } }
      `}</style>

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: isWide ? 1024 : "100%",
        height: isWide ? "75dvh" : "100dvh",
        margin: "0 auto",
        borderRadius: isWide ? 28 : 0,
        transform: isWide ? "rotate(-0.4deg)" : "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: isWide ? "row" : "column",
        boxShadow: isWide
          ? "0 30px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)"
          : "none",
        background: "#000",
      }}>
        <div style={{
          position: isWide ? "relative" : "absolute",
          inset: isWide ? undefined : 0,
          width: isWide ? "50%" : "100%",
          height: isWide ? "100%" : "100%",
          flexShrink: 0,
          background: "#000",
          overflow: "hidden",
          zIndex: 0,
        }}>
          <video
            key={videoUrl}
            autoPlay muted loop playsInline preload="auto"
            onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", zIndex: 0,
            }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {!isWide && (
            <>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.85) 100%)",
                pointerEvents: "none",
                zIndex: 1,
              }} />
              <div style={{
                position: "absolute", left: "10%", top: "12%",
                width: 180, height: 180, borderRadius: "50%",
                background: `radial-gradient(circle, ${neonA}55 0%, transparent 70%)`,
                filter: "blur(40px)",
                animation: "conceptOrb 4s ease-in-out infinite",
                pointerEvents: "none", zIndex: 1,
              }} />
              <div style={{
                position: "absolute", right: "8%", top: "20%",
                width: 140, height: 140, borderRadius: "50%",
                background: `radial-gradient(circle, ${neonB}55 0%, transparent 70%)`,
                filter: "blur(40px)",
                animation: "conceptOrb 5s ease-in-out 1s infinite",
                pointerEvents: "none", zIndex: 1,
              }} />
            </>
          )}
        </div>

        <div style={{
          position: isWide ? "relative" : "absolute",
          left: isWide ? undefined : 0,
          right: isWide ? undefined : 0,
          bottom: isWide ? undefined : 0,
          width: isWide ? "50%" : "auto",
          height: isWide ? "100%" : "auto",
          maxHeight: isWide ? undefined : "78vh",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: isWide ? "center" : "flex-end",
          alignItems: "flex-start",
          gap: 14,
          padding: isWide ? 48 : "20px 18px calc(env(safe-area-inset-bottom, 0) + 96px) 18px",
          background: isWide
            ? "linear-gradient(135deg, #0c2d48 0%, #061522 100%)"
            : "transparent",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          zIndex: 2,
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        >
          <div style={{
            width: "100%",
            background: isWide ? "transparent" : "rgba(0,0,0,0.55)",
            border: isWide ? "none" : `1.5px solid ${neonA}`,
            borderRadius: isWide ? 0 : 24,
            padding: isWide ? 0 : 20,
            backdropFilter: isWide ? undefined : "blur(20px)",
            WebkitBackdropFilter: isWide ? undefined : "blur(20px)",
            animation: isWide ? undefined : "conceptGlow 3s ease-in-out infinite",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 12,
              background: `${neonA}1a`, border: `1px solid ${neonA}88`,
              boxShadow: `0 0 12px ${neonA}44`,
              alignSelf: "flex-start",
              animation: "conceptFadeUp 0.6s ease-out both",
            }}>
              <span style={{ fontSize: "0.6rem" }}>📘</span>
              <span style={{
                fontSize: "0.55rem", fontWeight: 900, color: neonA,
                letterSpacing: "0.22em", textTransform: "uppercase",
                textShadow: `0 0 8px ${neonA}88`,
              }}>
                {lang === "es" ? "Concepto" : "Concept"}
              </span>
            </div>

            <h2 style={{
              color: "#fff",
              fontFamily: HEADING_FONT,
              fontSize: isWide ? "2rem" : "1.7rem",
              fontWeight: 900,
              lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0,
              textShadow: `0 2px 14px rgba(0,0,0,0.5), 0 0 24px ${neonA}44`,
              animation: "conceptFadeUp 0.6s ease-out 0.1s both",
              background: `linear-gradient(135deg, #fff 0%, #fff 60%, ${neonA} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {term}
            </h2>

            <div style={{
              height: 1, width: "100%",
              background: `linear-gradient(90deg, transparent, ${neonA}55, transparent)`,
              animation: "conceptFadeUp 0.6s ease-out 0.15s both",
            }} />

            <p style={{
              color: "#fff", fontSize: isWide ? "1rem" : "0.92rem",
              fontWeight: 600, lineHeight: 1.5, margin: 0,
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
              animation: "conceptFadeUp 0.6s ease-out 0.2s both",
            }}>
              {definition}
            </p>

            <div style={{
              padding: "14px 16px", borderRadius: 16,
              background: `${neonB}12`,
              border: `1.5px solid ${neonB}77`,
              boxShadow: `0 0 16px ${neonB}33`,
              animation: "conceptFadeUp 0.6s ease-out 0.3s both",
              alignSelf: "stretch",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
              }}>
                <span style={{ fontSize: "0.85rem", filter: `drop-shadow(0 0 6px ${neonB}99)` }}>💡</span>
                <span style={{
                  fontSize: "0.55rem", fontWeight: 900, color: neonB,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  textShadow: `0 0 8px ${neonB}77`,
                }}>
                  {lang === "es" ? "Piénsalo así" : "Think of it like"}
                </span>
              </div>
              <p style={{
                color: "#fff", fontSize: "0.88rem",
                fontWeight: 600, lineHeight: 1.45, margin: 0, fontStyle: "italic",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}>
                {analogy}
              </p>
            </div>

            {card.tooltip_explanation && onTooltip && (
              <button
                onClick={() => onTooltip(card.tooltip_explanation!)}
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 18px", borderRadius: 22,
                  background: `linear-gradient(135deg, ${neonA}, ${neonB})`,
                  border: "none",
                  color: "#0a0a0f", fontSize: "0.7rem",
                  fontWeight: 900, cursor: "pointer", fontFamily: HEADING_FONT,
                  animation: "conceptFadeUp 0.6s ease-out 0.4s both",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  boxShadow: `0 0 18px ${neonA}66, 0 4px 14px rgba(0,0,0,0.4)`,
                }}
              >
                {lang === "es" ? "💬 Más info" : "💬 Learn more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
