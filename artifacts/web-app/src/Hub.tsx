import { useEffect, useState } from "react";
import translations, { type Lang } from "./translations";
import ContactModal from "./ContactModal";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const SMALL_FONT = "'Lato', system-ui, -apple-system, sans-serif";
const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface HubProps {
  lang: Lang;
  userName: string;
  moolies: number;
  xp: number;
  level: number;
  streak: number;
  bossWins: number;
  equippedItems: string[];
  themeBg?: string;
  onNavigate: (view: "lab" | "tank" | "vault") => void;
  onOpenProfile: () => void;
}

export default function Hub({ lang, userName, moolies, xp, level, streak, bossWins, equippedItems, themeBg, onNavigate, onOpenProfile }: HubProps) {
  const [contactOpen, setContactOpen] = useState(false);
  useEffect(() => {
    fetch(`${API_BASE}/stocks/prices`).catch(() => {});
  }, []);

  const hasSharkBorder = equippedItems.includes("shark_border");
  const hasNeonHacker = equippedItems.includes("neon_hacker");
  const hasDiamondTrail = equippedItems.includes("diamond_trail");
  const hasBorder = hasSharkBorder || hasNeonHacker || hasDiamondTrail;
  const borderGrad = hasSharkBorder
    ? "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)"
    : hasNeonHacker
    ? "linear-gradient(135deg, #00ff87, #60efff, #00ff87)"
    : hasDiamondTrail
    ? "linear-gradient(135deg, #a78bfa, #60a5fa, #a78bfa)"
    : "linear-gradient(135deg, rgba(46,139,192,0.3), rgba(177,212,224,0.2))";
  const borderWidth = hasBorder ? 3 : 2;
  const glowShadow = hasSharkBorder
    ? "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,165,0,0.2)"
    : hasNeonHacker
    ? "0 0 20px rgba(0,255,135,0.4), 0 0 40px rgba(96,239,255,0.2)"
    : hasDiamondTrail
    ? "0 0 20px rgba(167,139,250,0.4), 0 0 40px rgba(96,165,250,0.2)"
    : "none";
  const initials = (userName || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const xpInLevel = xp % (level * 50);
  const xpNeeded = level * 50;
  const xpPct = Math.min((xpInLevel / xpNeeded) * 100, 100);

  const cards = [
    {
      id: "lab" as const,
      icon: "🧪",
      title: lang === "es" ? "Entrar al Lab" : "Enter The Lab",
      subtitle: lang === "es" ? "Lecciones financieras con IA" : "AI-powered financial lessons",
      accent: "#60a5fa",
      gradient: "linear-gradient(135deg, rgba(46,139,192,0.22) 0%, rgba(20,83,116,0.18) 60%, rgba(10,31,58,0.4) 100%)",
      border: "rgba(96,165,250,0.35)",
      glow: "rgba(46,139,192,0.18)",
    },
    {
      id: "tank" as const,
      icon: "🦈",
      title: lang === "es" ? "El Tanque" : "The Tank",
      subtitle: lang === "es" ? "Simulador de portafolio" : "Portfolio simulator",
      accent: "#22d3ee",
      gradient: "linear-gradient(135deg, rgba(34,211,238,0.18) 0%, rgba(20,83,116,0.18) 60%, rgba(10,31,58,0.4) 100%)",
      border: "rgba(34,211,238,0.3)",
      glow: "rgba(34,211,238,0.14)",
    },
    {
      id: "vault" as const,
      icon: "🏦",
      title: lang === "es" ? "La Bóveda" : "The Vault",
      subtitle: lang === "es" ? "Centro de recompensas" : "Rewards center",
      accent: "#fbbf24",
      gradient: "linear-gradient(135deg, rgba(251,191,36,0.16) 0%, rgba(120,80,20,0.16) 60%, rgba(10,15,30,0.5) 100%)",
      border: "rgba(251,191,36,0.3)",
      glow: "rgba(251,191,36,0.14)",
    },
  ];

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: themeBg || "radial-gradient(ellipse at top, #0a1f3a 0%, #050d1c 60%, #02060f 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 24px",
      overflowY: "auto",
      fontFamily: FONT,
      position: "relative",
    }}>
      <div aria-hidden style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "120%", height: 320, pointerEvents: "none",
        background: "radial-gradient(ellipse at center top, rgba(46,139,192,0.14), transparent 65%)",
      }} />
      <style>{`
        @keyframes hubFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes hubShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes avatarGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
      `}</style>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "flex-start",
        gap: 16, marginTop: 40, width: "100%", maxWidth: "min(94vw, 760px)",
      }}>
        <button
          onClick={onOpenProfile}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: borderGrad, padding: borderWidth,
            boxShadow: glowShadow,
            animation: hasBorder ? "avatarGlow 3s ease-in-out infinite" : "none",
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: "linear-gradient(135deg, #0c2d48, #145374)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", fontWeight: 900, color: "#b1d4e0",
              letterSpacing: "0.05em",
            }}>
              {initials}
            </div>
          </div>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em",
            color: "rgba(177,212,224,0.4)", textTransform: "uppercase", marginBottom: 2,
          }}>
            {lang === "es" ? "BIENVENIDO DE VUELTA" : "WELCOME BACK"}
          </div>
          <div style={{
            fontFamily: "'Bricolage Grotesque', 'Lato', sans-serif",
            fontSize: "1.4rem", fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em", marginBottom: 8,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {userName || (lang === "es" ? "Explorador" : "Explorer")}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 12,
              background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.12)",
            }}>
              <img src="/moolie-coin.png" alt="" style={{ width: 14, height: 14 }} />
              <span style={{
                fontSize: "0.75rem", fontWeight: 900,
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{Math.round(moolies).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12, marginTop: 20,
        width: "100%", maxWidth: "min(94vw, 760px)",
      }}>
        {[
          { label: lang === "es" ? "NVL" : "LVL", val: level, color: "#60a5fa", sub: `${xpInLevel}/${xpNeeded} XP`, showBar: true },
          { label: lang === "es" ? "RACHA" : "STREAK", val: `${streak}🔥`, color: "#FF6B6B", sub: lang === "es" ? "días" : "days", showBar: false },
          { label: lang === "es" ? "JEFES" : "BOSS", val: bossWins, color: "#FFD93D", sub: lang === "es" ? "victorias" : "wins", showBar: false },
        ].map((s) => (
          <div key={s.label} style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))",
            padding: "14px 12px 12px", borderRadius: 16, textAlign: "center",
            border: "1px solid rgba(120,180,255,0.1)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
            position: "relative", overflow: "hidden",
            minHeight: 92, display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ color: s.color, fontSize: "1.15rem", fontWeight: 900, letterSpacing: "-0.02em" }}>{s.val}</div>
            <div style={{
              color: "rgba(207,225,245,0.45)", fontSize: "0.5rem", fontWeight: 800,
              letterSpacing: "0.12em", marginTop: 3, textTransform: "uppercase",
            }}>{s.label}</div>
            <div style={{
              color: "rgba(207,225,245,0.3)", fontSize: "0.5rem", fontWeight: 600, marginTop: 2,
            }}>{s.sub}</div>
            {s.showBar && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
                background: "rgba(120,180,255,0.08)",
              }}>
                <div style={{
                  height: "100%",
                  width: `${xpPct}%`,
                  background: "linear-gradient(90deg, #2e8bc0, #b1d4e0)",
                  transition: "width 0.8s ease",
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", flexDirection: "column",
        gap: 14, width: "100%", maxWidth: "min(94vw, 760px)",
        marginTop: 18, paddingBottom: "calc(env(safe-area-inset-bottom, 0) + 40px)",
      }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              width: "100%", padding: "22px 22px", borderRadius: 22,
              background: card.gradient,
              border: `1.5px solid ${card.border}`,
              cursor: "pointer", fontFamily: FONT,
              display: "flex", alignItems: "center", gap: 18,
              transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
              animation: `hubFloat 5s ease-in-out ${idx * 0.4}s infinite`,
              boxShadow: `0 12px 36px ${card.glow}, 0 1px 0 rgba(255,255,255,0.05) inset`,
              position: "relative", overflow: "hidden",
              minHeight: 96,
            }}
            onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.985)"; }}
            onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: 4,
              background: card.accent, opacity: 0.85,
              boxShadow: `0 0 14px ${card.accent}88`,
            }} />
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "hubShine 5s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: `radial-gradient(circle at 30% 30%, ${card.accent}44, rgba(255,255,255,0.04))`,
              border: `1.5px solid ${card.accent}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.2rem", flexShrink: 0,
              boxShadow: `inset 0 0 22px ${card.accent}22, 0 4px 16px ${card.accent}33`,
            }}>
              {card.icon}
            </div>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <div style={{
                fontFamily: "'Bricolage Grotesque', 'Lato', sans-serif",
                fontSize: "1.45rem", fontWeight: 900, color: "#fff",
                letterSpacing: "-0.02em", marginBottom: 4,
                lineHeight: 1.1,
              }}>{card.title}</div>
              <div style={{
                fontSize: "0.78rem", fontWeight: 500,
                color: "rgba(207,225,245,0.7)", letterSpacing: "0.01em",
                lineHeight: 1.25,
              }}>{card.subtitle}</div>
            </div>
            <div style={{
              fontSize: "1.6rem", color: card.accent, fontWeight: 600, opacity: 0.85,
              flexShrink: 0,
            }}>→</div>
          </button>
        ))}

        <button
          onClick={() => setContactOpen(true)}
          style={{
            marginTop: 4, alignSelf: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(120,180,255,0.18)",
            color: "rgba(207,225,245,0.75)",
            fontSize: "0.78rem", fontWeight: 700, fontFamily: FONT,
            padding: "10px 22px", borderRadius: 999, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
            letterSpacing: "0.02em",
            transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(46,139,192,0.14)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(46,139,192,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.color = "rgba(207,225,245,0.75)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(120,180,255,0.18)";
          }}
        >
          <span style={{ fontSize: "0.95rem" }}>✉️</span>
          {lang === "es" ? "¿Necesitas ayuda? Contáctanos" : "Need help? Contact us"}
        </button>
      </div>

      <ContactModal
        open={contactOpen}
        lang={lang}
        defaultName={userName}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
