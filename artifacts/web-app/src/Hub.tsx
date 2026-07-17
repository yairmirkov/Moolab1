import { useEffect, useState } from "react";
import { type Lang } from "./translations";
import ContactModal from "./ContactModal";
import { findEquippedTitle } from "./titles";
import Preferences from "./Preferences";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
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
  const [prefsOpen, setPrefsOpen] = useState(false);
  useEffect(() => {
    fetch(`${API_BASE}/stocks/prices`).catch(() => {});
  }, []);

  const hasSharkBorder = equippedItems.includes("shark_border");
  const hasNeonHacker = equippedItems.includes("neon_hacker");
  const hasDiamondTrail = equippedItems.includes("diamond_trail");
  const hasGradientAvatar = equippedItems.includes("gradient_avatar");
  const hasLionFrame = equippedItems.includes("lion_frame");
  const hasHolographic = equippedItems.includes("holographic_border");
  const hasGoldCrown = equippedItems.includes("gold_crown");
  const hasBorder = hasSharkBorder || hasNeonHacker || hasDiamondTrail || hasGradientAvatar || hasLionFrame || hasHolographic;
  const borderGrad = hasSharkBorder
    ? "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)"
    : hasNeonHacker
    ? "linear-gradient(135deg, #00ff87, #60efff, #00ff87)"
    : hasDiamondTrail
    ? "linear-gradient(135deg, #a78bfa, #60a5fa, #a78bfa)"
    : hasGradientAvatar
    ? "linear-gradient(135deg, #ff2d95, #ff9500, #39ff14, #00d4ff, #bf5cff)"
    : hasLionFrame
    ? "linear-gradient(135deg, #ff9500, #ff6b35, #ff2d00)"
    : hasHolographic
    ? "linear-gradient(135deg, #60efff, #ff2d95, #39ff14, #bf5cff)"
    : "linear-gradient(135deg, rgba(46,139,192,0.3), rgba(177,212,224,0.2))";
  const borderWidth = hasBorder ? 3 : 2;
  const glowShadow = hasSharkBorder
    ? "0 0 20px rgba(255,215,0,0.4), 0 0 40px rgba(255,165,0,0.2)"
    : hasNeonHacker
    ? "0 0 20px rgba(0,255,135,0.4), 0 0 40px rgba(96,239,255,0.2)"
    : hasDiamondTrail
    ? "0 0 20px rgba(167,139,250,0.4), 0 0 40px rgba(96,165,250,0.2)"
    : hasGradientAvatar
    ? "0 0 20px rgba(255,45,149,0.35), 0 0 40px rgba(96,239,255,0.18)"
    : hasLionFrame
    ? "0 0 20px rgba(255,149,0,0.4), 0 0 40px rgba(255,107,53,0.2)"
    : hasHolographic
    ? "0 0 20px rgba(96,239,255,0.35), 0 0 40px rgba(191,92,255,0.2)"
    : "none";
  const initials = (userName || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const xpInLevel = xp % (level * 50);
  const xpNeeded = level * 50;
  const xpPct = Math.min((xpInLevel / xpNeeded) * 100, 100);
  const equippedTitle = findEquippedTitle(equippedItems);

  const navCards = [
    {
      id: "lab" as const,
      icon: "🧪",
      title: lang === "es" ? "Entrar al Lab" : "The Lab",
      subtitle: lang === "es" ? "Lecciones financieras con IA" : "AI-powered lessons",
      accent: "#2e8bc0",
      gradient: "linear-gradient(135deg, rgba(46,139,192,0.1) 0%, rgba(12,45,72,0.14) 60%, rgba(5,13,28,0.55) 100%)",
      border: "rgba(46,139,192,0.2)",
      glow: "rgba(46,139,192,0.1)",
    },
    {
      id: "tank" as const,
      icon: "🦈",
      title: lang === "es" ? "El Tanque" : "The Tank",
      subtitle: lang === "es" ? "Simulador de portafolio" : "Simulate your portfolio",
      accent: "#2e8bc0",
      gradient: "linear-gradient(135deg, rgba(46,139,192,0.1) 0%, rgba(12,45,72,0.14) 60%, rgba(5,13,28,0.55) 100%)",
      border: "rgba(46,139,192,0.2)",
      glow: "rgba(46,139,192,0.1)",
    },
    {
      id: "vault" as const,
      icon: "🏦",
      title: lang === "es" ? "La Bóveda" : "The Vault",
      subtitle: lang === "es" ? "Centro de recompensas" : "Your rewards",
      accent: "#2e8bc0",
      gradient: "linear-gradient(135deg, rgba(46,139,192,0.1) 0%, rgba(12,45,72,0.14) 60%, rgba(5,13,28,0.55) 100%)",
      border: "rgba(46,139,192,0.2)",
      glow: "rgba(46,139,192,0.1)",
    },
  ];

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: themeBg || "#020a14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 20px",
      overflowY: "auto",
      fontFamily: FONT,
      position: "relative",
    }}>
      <style>{`
        @keyframes hubShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes avatarPulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 0px transparent); }
          50% { filter: brightness(1.15) drop-shadow(0 0 12px rgba(46,139,192,0.35)); }
        }
        @keyframes cardLift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .hub-nav-card:active { transform: scale(0.97) !important; }
      `}</style>

      {/* ── HERO SECTION ── */}
      <div style={{
        width: "100%",
        maxWidth: "min(96vw, 1100px)",
        marginTop: 36,
        display: "flex",
        alignItems: "center",
        gap: 20,
        position: "relative",
      }}>
        {/* Avatar */}
        <button
          onClick={onOpenProfile}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
        >
          <div style={{ position: "relative", width: 88, height: 88 }}>
            {hasGoldCrown && (
              <div style={{
                position: "absolute", top: -22, left: "50%",
                transform: "translateX(-50%)",
                fontSize: "1.7rem",
                filter: "drop-shadow(0 2px 8px rgba(255,215,0,0.6))",
                pointerEvents: "none", zIndex: 2,
              }}>👑</div>
            )}
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: borderGrad, padding: borderWidth,
              boxShadow: glowShadow,
              animation: hasBorder ? "avatarPulse 3s ease-in-out infinite" : "none",
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "linear-gradient(135deg, #0c2d48, #145374)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", fontWeight: 900, color: "#b1d4e0",
                letterSpacing: "0.05em",
              }}>
                {initials}
              </div>
            </div>
          </div>
        </button>

        {/* Name + XP + Badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.16em",
            color: "rgba(177,212,224,0.4)", textTransform: "uppercase", marginBottom: 3,
          }}>
            {lang === "es" ? "BIENVENIDO DE VUELTA" : "WELCOME BACK"}
          </div>

          <div style={{
            fontSize: "clamp(1.4rem, 5vw, 2rem)", fontWeight: 900, color: "#fff",
            letterSpacing: "-0.03em", marginBottom: equippedTitle ? 2 : 6,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            lineHeight: 1.1,
          }}>
            {userName || (lang === "es" ? "Explorador" : "Explorer")}
          </div>

          {equippedTitle && (
            <div style={{
              fontSize: "0.6rem", fontWeight: 800, color: "#b1d4e0",
              letterSpacing: "0.03em", marginBottom: 8,
            }}>{equippedTitle.emoji} {equippedTitle.label[lang]}</div>
          )}

          {/* XP bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4,
            }}>
              <span style={{ fontSize: "0.55rem", fontWeight: 700, color: "#60a5fa", letterSpacing: "0.08em" }}>
                LVL {level}
              </span>
              <span style={{ fontSize: "0.5rem", fontWeight: 600, color: "rgba(177,212,224,0.4)" }}>
                {xpInLevel} / {xpNeeded} XP
              </span>
            </div>
            <div style={{
              height: 6, borderRadius: 99,
              background: "rgba(46,139,192,0.12)",
              border: "1px solid rgba(46,139,192,0.1)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${xpPct}%`,
                background: "linear-gradient(90deg, #2e8bc0, #60a5fa, #b1d4e0)",
                borderRadius: 99,
                boxShadow: "0 0 8px rgba(46,139,192,0.5)",
                transition: "width 1s ease",
              }} />
            </div>
          </div>

          {/* Badges row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 99,
              background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)",
            }}>
              <img src="/moolie-coin.png" alt="" style={{ width: 13, height: 13 }} />
              <span style={{
                fontSize: "0.7rem", fontWeight: 900,
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{Math.round(moolies).toLocaleString()}</span>
            </div>
            {streak > 0 && (
              <div style={{
                padding: "3px 10px", borderRadius: 99,
                background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)",
                fontSize: "0.7rem", fontWeight: 900, color: "#FF6B6B",
              }}>
                {streak}🔥
              </div>
            )}
            {bossWins > 0 && (
              <div style={{
                padding: "3px 10px", borderRadius: 99,
                background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)",
                fontSize: "0.7rem", fontWeight: 900, color: "#FFD93D",
              }}>
                {bossWins}⚔️
              </div>
            )}
          </div>
        </div>

        {/* Settings gear icon */}
        <button
          onClick={() => setPrefsOpen(true)}
          title={lang === "es" ? "Preferencias" : "Preferences"}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(120,180,255,0.15)",
            borderRadius: 12, width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: "1.1rem",
            flexShrink: 0, alignSelf: "flex-start", marginTop: 4,
            transition: "background 0.18s, border-color 0.18s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(46,139,192,0.15)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(46,139,192,0.45)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(120,180,255,0.15)";
          }}
        >
          ⚙️
        </button>
      </div>

      {/* ── NAV CARDS GRID ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
        gap: 14,
        width: "100%",
        maxWidth: "min(96vw, 1100px)",
        marginTop: 24,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 48px)",
      }}>
        {navCards.map((card, idx) => (
          <button
            key={card.id}
            className="hub-nav-card"
            onClick={() => onNavigate(card.id)}
            style={{
              width: "100%",
              padding: "24px 22px",
              borderRadius: 24,
              background: card.gradient,
              border: `1.5px solid ${card.border}`,
              cursor: "pointer",
              fontFamily: FONT,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
              animation: `cardLift 6s ease-in-out ${idx * 0.5}s infinite`,
              boxShadow: `0 16px 40px ${card.glow}, 0 1px 0 rgba(255,255,255,0.05) inset`,
              position: "relative",
              overflow: "hidden",
              minHeight: 140,
              textAlign: "left",
            }}
            onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
            onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          >
            {/* Left accent bar */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: 4,
              background: card.accent, opacity: 0.9,
              boxShadow: `0 0 18px ${card.accent}99`,
            }} />
            {/* Shine sweep */}
            <div aria-hidden style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "hubShine 6s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            {/* Top row: icon + arrow */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `radial-gradient(circle at 30% 30%, ${card.accent}44, rgba(255,255,255,0.04))`,
                border: `1.5px solid ${card.accent}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.9rem", flexShrink: 0,
                boxShadow: `inset 0 0 20px ${card.accent}22, 0 4px 14px ${card.accent}33`,
              }}>
                {card.icon}
              </div>
              <div style={{
                fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.06em",
                color: card.accent, opacity: 0.9,
                padding: "5px 12px", borderRadius: 99,
                background: `${card.accent}18`,
                border: `1px solid ${card.accent}33`,
              }}>
                {lang === "es" ? "Entrar →" : "Enter →"}
              </div>
            </div>
            {/* Title + subtitle */}
            <div>
              <div style={{
                fontSize: "clamp(1.25rem, 4vw, 1.5rem)", fontWeight: 900, color: "#fff",
                letterSpacing: "-0.02em", marginBottom: 4, lineHeight: 1.1,
              }}>{card.title}</div>
              <div style={{
                fontSize: "0.78rem", fontWeight: 500,
                color: "rgba(207,225,245,0.65)", letterSpacing: "0.01em",
              }}>{card.subtitle}</div>
            </div>
          </button>
        ))}

        {/* Contact us link — spans full grid width */}
        <button
          onClick={() => setContactOpen(true)}
          style={{
            gridColumn: "1 / -1",
            marginTop: 4, alignSelf: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(120,180,255,0.15)",
            color: "rgba(207,225,245,0.6)",
            fontSize: "0.75rem", fontWeight: 700, fontFamily: FONT,
            padding: "10px 22px", borderRadius: 999, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            letterSpacing: "0.02em",
            transition: "background 0.18s, color 0.18s, border-color 0.18s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(46,139,192,0.12)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(46,139,192,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
            (e.currentTarget as HTMLElement).style.color = "rgba(207,225,245,0.6)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(120,180,255,0.15)";
          }}
        >
          <span style={{ fontSize: "0.9rem" }}>✉️</span>
          {lang === "es" ? "¿Necesitas ayuda? Contáctanos" : "Need help? Contact us"}
        </button>
      </div>

      <ContactModal
        open={contactOpen}
        lang={lang}
        defaultName={userName}
        onClose={() => setContactOpen(false)}
      />

      {prefsOpen && (
        <Preferences lang={lang} onClose={() => setPrefsOpen(false)} />
      )}
    </div>
  );
}
