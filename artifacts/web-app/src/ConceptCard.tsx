import { useEffect, useState } from "react";
import type { Lang } from "./translations";
import { getFallbackVideo } from "./pexelsVideo";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

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
}

function useIsWide() {
  const [wide, setWide] = useState<boolean>(
    () => typeof window !== "undefined" && window.innerWidth >= 768
  );
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return wide;
}

export default function ConceptCard({ card, lang, onTooltip }: ConceptCardProps) {
  const term = card.term || (lang === "es" ? "Concepto Financiero" : "Financial Concept");
  const definition = card.definition || (lang === "es" ? "Definición no disponible." : "Definition not available.");
  const analogy = card.analogy || (lang === "es" ? "Piénsalo de esta manera..." : "Think of it this way...");
  const isWide = useIsWide();

  const videoUrl = card.video_url || getFallbackVideo(card.id);

  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        position: "relative",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        background: isWide
          ? "linear-gradient(160deg, #051528 0%, #020a14 100%)"
          : "#000",
        fontFamily: FONT,
        overflow: "hidden",
        display: isWide ? "flex" : "block",
        alignItems: isWide ? "center" : undefined,
        justifyContent: isWide ? "center" : undefined,
        padding: isWide ? 24 : 0,
      }}
    >
      <style>{`
        @keyframes conceptFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={isWide ? {
        position: "relative",
        width: "min(95%, 1100px)",
        height: "min(85dvh, 800px)",
        maxHeight: 800,
        borderRadius: 24,
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)",
        background: "#000",
      } : { position: "absolute", inset: 0 }}>

        <div style={isWide ? {
          position: "relative", width: "50%", height: "100%",
          flexShrink: 0, overflow: "hidden", background: "#000",
        } : { position: "absolute", inset: 0 }}>
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
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
              zIndex: 1,
            }} />
          )}
        </div>

        <div style={isWide ? {
          position: "relative", width: "50%", height: "100%",
          flexShrink: 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          gap: 14,
          padding: "40px 36px",
          background: "linear-gradient(135deg, #0c2d48 0%, #061522 100%)",
          overflowY: "auto",
          zIndex: 2,
        } : {
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 24px 60px", zIndex: 2,
          display: "flex", flexDirection: "column", gap: 14,
          maxHeight: "min(72vh, calc(100% - 16px))",
          overflowY: "auto", scrollbarWidth: "none",
          flexShrink: 0,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 8,
            background: "rgba(46,139,192,0.15)", border: "1px solid rgba(46,139,192,0.25)",
            alignSelf: "flex-start",
            animation: "conceptFadeUp 0.6s ease-out both",
          }}>
            <span style={{ fontSize: "0.5rem" }}>📘</span>
            <span style={{
              fontSize: "0.5rem", fontWeight: 700, color: "#2e8bc0",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              {lang === "es" ? "Concepto" : "Concept"}
            </span>
          </div>

          <h2 style={{
            color: "#fff", fontSize: isWide ? "1.85rem" : "1.5rem", fontWeight: 900,
            lineHeight: 1.2, letterSpacing: "-0.02em", margin: 0,
            textShadow: isWide ? "none" : "0 2px 10px rgba(0,0,0,0.6)",
            animation: "conceptFadeUp 0.6s ease-out 0.1s both",
          }}>
            {term}
          </h2>

          <p style={{
            color: "rgba(255,255,255,0.85)", fontSize: isWide ? "1rem" : "0.9rem",
            fontWeight: 500, lineHeight: 1.5, margin: 0,
            textShadow: isWide ? "none" : "0 1px 6px rgba(0,0,0,0.5)",
            animation: "conceptFadeUp 0.6s ease-out 0.2s both",
          }}>
            {definition}
          </p>

          <div style={{
            padding: "12px 14px", borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            animation: "conceptFadeUp 0.6s ease-out 0.3s both",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginBottom: 6,
            }}>
              <span style={{ fontSize: "0.7rem" }}>💡</span>
              <span style={{
                fontSize: "0.5rem", fontWeight: 700, color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                {lang === "es" ? "Piénsalo así" : "Think of it like"}
              </span>
            </div>
            <p style={{
              color: "rgba(255,255,255,0.75)", fontSize: "0.8rem",
              fontWeight: 500, lineHeight: 1.45, margin: 0, fontStyle: "italic",
            }}>
              {analogy}
            </p>
          </div>

          {card.tooltip_explanation && onTooltip && (
            <button
              onClick={() => onTooltip(card.tooltip_explanation!)}
              style={{
                alignSelf: "flex-start",
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(177,212,224,0.1)",
                border: "1px solid rgba(177,212,224,0.2)",
                color: "rgba(177,212,224,0.7)", fontSize: "0.6rem",
                fontWeight: 700, cursor: "pointer", fontFamily: FONT,
                animation: "conceptFadeUp 0.6s ease-out 0.4s both",
                letterSpacing: "0.04em",
              }}
            >
              {lang === "es" ? "💬 Más info" : "💬 Learn more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
