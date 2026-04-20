import { useEffect } from "react";
import translations, { type Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
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
  onNavigate: (view: "lab" | "tank" | "vault") => void;
  onOpenProfile: () => void;
}

export default function Hub({ lang, userName, moolies, xp, level, streak, bossWins, equippedItems, onNavigate, onOpenProfile }: HubProps) {
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
      background: "radial-gradient(ellipse at top, #0a1f3a 0%, #050d1c 60%, #02060f 100%)",
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
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 20, marginTop: 40, width: "100%", maxWidth: "min(94vw, 720px)",
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
            fontSize: "1.3rem", fontWeight: 900, color: "#fff",
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
        display: "flex", gap: 10, marginTop: 18,
        width: "100%", maxWidth: "min(94vw, 720px)",
      }}>
        {[
          { label: lang === "es" ? "NVL" : "LVL", val: level, color: "#60a5fa", sub: `${xpInLevel}/${xpNeeded} XP`, showBar: true },
          { label: lang === "es" ? "RACHA" : "STREAK", val: `${streak}🔥`, color: "#FF6B6B", sub: lang === "es" ? "días" : "days", showBar: false },
          { label: lang === "es" ? "JEFES" : "BOSS", val: bossWins, color: "#FFD93D", sub: lang === "es" ? "victorias" : "wins", showBar: false },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1,
            background: "linear-gradient(160deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))",
            padding: "12px 10px 10px", borderRadius: 16, textAlign: "center",
            border: "1px solid rgba(120,180,255,0.1)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
            position: "relative", overflow: "hidden",
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
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 14, width: "100%", maxWidth: "min(94vw, 1100px)",
        marginTop: 20, paddingBottom: 40,
      }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              width: "100%", padding: "22px 20px", borderRadius: 20,
              background: card.gradient,
              border: `1px solid ${card.border}`,
              cursor: "pointer", fontFamily: FONT,
              display: "flex", alignItems: "center", gap: 16,
              transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
              animation: `hubFloat 5s ease-in-out ${idx * 0.4}s infinite`,
              boxShadow: `0 8px 28px ${card.glow}, 0 1px 0 rgba(255,255,255,0.04) inset`,
              position: "relative", overflow: "hidden",
            }}
            onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.985)"; }}
            onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
              background: card.accent, opacity: 0.7,
              boxShadow: `0 0 12px ${card.accent}66`,
            }} />
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "hubShine 5s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `radial-gradient(circle at 30% 30%, ${card.accent}33, rgba(255,255,255,0.04))`,
              border: `1px solid ${card.accent}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.7rem", flexShrink: 0,
              boxShadow: `inset 0 0 20px ${card.accent}15`,
            }}>
              {card.icon}
            </div>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <div style={{
                fontSize: "1.05rem", fontWeight: 900, color: "#fff",
                letterSpacing: "-0.015em", marginBottom: 4,
              }}>{card.title}</div>
              <div style={{
                fontSize: "0.68rem", fontWeight: 500,
                color: "rgba(207,225,245,0.55)", letterSpacing: "0.02em",
              }}>{card.subtitle}</div>
            </div>
            <div style={{
              fontSize: "1.1rem", color: card.accent, fontWeight: 400, opacity: 0.7,
            }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}
