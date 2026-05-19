import { useEffect, useState } from "react";
import { type Lang } from "./translations";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";

export interface TutorialStep {
  icon?: string;
  title: { en: string; es: string };
  body: { en: string; es: string };
}

interface TutorialOverlayProps {
  open: boolean;
  lang: Lang;
  steps: TutorialStep[];
  accent?: string;
  onClose: () => void;
}

export default function TutorialOverlay({ open, lang, steps, accent = "#2e8bc0", onClose }: TutorialOverlayProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => { if (open) setIdx(0); }, [open]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || steps.length === 0) return null;

  const step = steps[Math.min(idx, steps.length - 1)];
  const isLast = idx >= steps.length - 1;
  const isFirst = idx === 0;

  const t = {
    next: { en: "Next →", es: "Siguiente →" },
    back: { en: "← Back", es: "← Atrás" },
    done: { en: "Got it! ✓", es: "¡Entendido! ✓" },
    skip: { en: "Skip", es: "Saltar" },
    step: { en: (i: number, n: number) => `Step ${i} of ${n}`, es: (i: number, n: number) => `Paso ${i} de ${n}` },
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        zIndex: 1000,
        background: "rgba(5,13,28,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, fontFamily: FONT,
        animation: "tutFadeIn 0.25s ease-out both",
      }}
    >
      <style>{`
        @keyframes tutFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tutSlide { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        style={{
          width: "100%", maxWidth: 380,
          background: "linear-gradient(160deg, rgba(20,40,70,0.96), rgba(10,20,40,0.96))",
          border: `1.5px solid ${accent}88`,
          borderRadius: 24, padding: "28px 24px 22px",
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${accent}33`,
          textAlign: "center", position: "relative",
          animation: "tutSlide 0.35s ease-out both",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", fontFamily: FONT,
          }}
          aria-label={t.skip[lang]}
        >✕</button>

        {step.icon && (
          <div style={{
            fontSize: "3rem", marginBottom: 8,
            filter: `drop-shadow(0 4px 14px ${accent}77)`,
          }}>{step.icon}</div>
        )}

        <div style={{
          fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.18em",
          color: accent, textTransform: "uppercase", marginBottom: 6,
        }}>{t.step[lang](idx + 1, steps.length)}</div>

        <h2 style={{
          margin: "0 0 10px 0",
          fontSize: "1.35rem", fontWeight: 900, color: "#fff",
          letterSpacing: "-0.01em", lineHeight: 1.2,
        }}>{step.title[lang]}</h2>

        <p style={{
          margin: "0 0 22px 0",
          fontSize: "0.85rem", lineHeight: 1.5,
          color: "rgba(207,225,245,0.78)", fontWeight: 500,
        }}>{step.body[lang]}</p>

        {/* progress dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 6, marginBottom: 18,
        }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? 22 : 6, height: 6, borderRadius: 3,
              background: i === idx ? accent : "rgba(255,255,255,0.18)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {!isFirst && (
            <button
              onClick={() => setIdx((p) => Math.max(0, p - 1))}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)",
                fontFamily: FONT, fontWeight: 800,
                fontSize: "0.75rem", letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >{t.back[lang]}</button>
          )}
          <button
            onClick={() => { if (isLast) onClose(); else setIdx((p) => p + 1); }}
            style={{
              flex: 1.5, padding: "12px 0", borderRadius: 14,
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              border: "none", color: "#fff",
              fontFamily: FONT, fontWeight: 900,
              fontSize: "0.78rem", letterSpacing: "0.06em",
              cursor: "pointer",
              boxShadow: `0 6px 20px ${accent}55`,
            }}
          >{isLast ? t.done[lang] : t.next[lang]}</button>
        </div>
      </div>
    </div>
  );
}

export const tutorialButtonStyle = (accent: string): React.CSSProperties => ({
  width: 32, height: 32, borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${accent}44`,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "0.9rem", color: accent, cursor: "pointer",
  fontFamily: FONT, fontWeight: 800,
});
