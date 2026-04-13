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
      gradient: "linear-gradient(135deg, #145374 0%, #2e8bc0 50%, #0c2d48 100%)",
      border: "rgba(46,139,192,0.3)",
      glow: "rgba(46,139,192,0.15)",
    },
    {
      id: "tank" as const,
      icon: "🦈",
      title: lang === "es" ? "El Tanque" : "The Tank",
      subtitle: lang === "es" ? "Simulador de portafolio" : "Portfolio simulator",
      gradient: "linear-gradient(135deg, #0c2d48 0%, #145374 50%, #2e8bc0 100%)",
      border: "rgba(20,83,116,0.3)",
      glow: "rgba(20,83,116,0.15)",
    },
    {
      id: "vault" as const,
      icon: "🏦",
      title: lang === "es" ? "La Bóveda" : "The Vault",
      subtitle: lang === "es" ? "Centro de recompensas" : "Rewards center",
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      border: "rgba(255,215,0,0.2)",
      glow: "rgba(255,215,0,0.08)",
    },
  ];

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      background: "linear-gradient(180deg, #0a1628 0%, #0c2d48 40%, #091e30 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 24px",
      overflowY: "auto",
      fontFamily: FONT,
    }}>
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
        gap: 20, marginTop: 40, width: "100%", maxWidth: 340,
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
        display: "flex", gap: 8, marginTop: 16,
        width: "100%", maxWidth: 340,
      }}>
        {[
          { label: lang === "es" ? "NVL" : "LVL", val: level, color: "#2e8bc0", sub: `${xpInLevel}/${xpNeeded} XP` },
          { label: lang === "es" ? "RACHA" : "STREAK", val: `${streak}🔥`, color: "#FF6B6B", sub: lang === "es" ? "días" : "days" },
          { label: lang === "es" ? "JEFES" : "BOSS", val: bossWins, color: "#FFD93D", sub: lang === "es" ? "victorias" : "wins" },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, background: "rgba(255,255,255,0.03)",
            padding: "10px 8px 8px", borderRadius: 14, textAlign: "center",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ color: s.color, fontSize: "1.1rem", fontWeight: 900 }}>{s.val}</div>
            <div style={{
              color: "rgba(255,255,255,0.25)", fontSize: "0.45rem", fontWeight: 700,
              letterSpacing: "0.08em", marginTop: 2,
            }}>{s.label}</div>
            <div style={{
              color: "rgba(255,255,255,0.15)", fontSize: "0.4rem", fontWeight: 600, marginTop: 1,
            }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        width: "100%", maxWidth: 340, marginTop: 8,
        background: "rgba(46,139,192,0.06)", borderRadius: 10,
        height: 4, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 10,
          background: "linear-gradient(90deg, #2e8bc0, #b1d4e0)",
          width: `${xpPct}%`,
          transition: "width 0.8s ease",
        }} />
      </div>

      <div style={{
        display: "flex", flexDirection: "column",
        gap: 14, width: "100%", maxWidth: 340,
        marginTop: 20, paddingBottom: 40,
      }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              width: "100%", padding: "24px 20px", borderRadius: 22,
              background: card.gradient,
              border: `1px solid ${card.border}`,
              cursor: "pointer", fontFamily: FONT,
              display: "flex", alignItems: "center", gap: 16,
              transition: "all 0.3s ease",
              animation: `hubFloat 4s ease-in-out ${idx * 0.3}s infinite`,
              boxShadow: `0 4px 24px ${card.glow}, 0 1px 3px rgba(0,0,0,0.3)`,
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "hubShine 4s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            <div style={{
              width: 50, height: 50, borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{
                fontSize: "1.05rem", fontWeight: 900, color: "#fff",
                letterSpacing: "-0.01em", marginBottom: 3,
              }}>{card.title}</div>
              <div style={{
                fontSize: "0.68rem", fontWeight: 500,
                color: "rgba(177,212,224,0.5)", letterSpacing: "0.02em",
              }}>{card.subtitle}</div>
            </div>
            <div style={{
              fontSize: "1.2rem", color: "rgba(177,212,224,0.3)", fontWeight: 300,
            }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}
