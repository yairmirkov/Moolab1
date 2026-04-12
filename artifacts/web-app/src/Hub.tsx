import { useEffect } from "react";
import translations, { type Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface HubProps {
  lang: Lang;
  userName: string;
  moolies: number;
  onNavigate: (view: "lab" | "tank" | "vault") => void;
}

export default function Hub({ lang, userName, moolies, onNavigate }: HubProps) {
  useEffect(() => {
    fetch(`${API_BASE}/stocks/prices`).catch(() => {});
  }, []);

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
        @keyframes hubGlow {
          0%, 100% { box-shadow: 0 4px 20px var(--glow-color); }
          50% { box-shadow: 0 8px 40px var(--glow-color); }
        }
        @keyframes hubShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div style={{ marginTop: 48, textAlign: "center" }}>
        <div style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: "rgba(177,212,224,0.4)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}>
          {lang === "es" ? "BIENVENIDO DE VUELTA" : "WELCOME BACK"}
        </div>
        <div style={{
          fontSize: "1.6rem",
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.02em",
        }}>
          {userName || (lang === "es" ? "Explorador" : "Explorer")}
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 16,
        padding: "10px 20px",
        borderRadius: 24,
        background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.04))",
        border: "1px solid rgba(255,215,0,0.15)",
      }}>
        <img src="/moolie-coin.png" alt="" style={{ width: 22, height: 22 }} />
        <span style={{
          fontSize: "1.1rem",
          fontWeight: 900,
          background: "linear-gradient(135deg, #FFD700, #FFA500)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          {moolies.toLocaleString()}
        </span>
        <span style={{
          fontSize: "0.55rem",
          fontWeight: 700,
          color: "rgba(255,215,0,0.5)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          Moolies
        </span>
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        maxWidth: 380,
        marginTop: 36,
        paddingBottom: 40,
      }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              width: "100%",
              padding: "28px 24px",
              borderRadius: 24,
              background: card.gradient,
              border: `1px solid ${card.border}`,
              cursor: "pointer",
              fontFamily: FONT,
              display: "flex",
              alignItems: "center",
              gap: 18,
              transition: "all 0.3s ease",
              animation: `hubFloat 4s ease-in-out ${idx * 0.3}s infinite`,
              boxShadow: `0 4px 24px ${card.glow}, 0 1px 3px rgba(0,0,0,0.3)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "hubShine 4s ease-in-out infinite",
              pointerEvents: "none",
            }} />

            <div style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              flexShrink: 0,
            }}>
              {card.icon}
            </div>

            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{
                fontSize: "1.15rem",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.01em",
                marginBottom: 4,
              }}>
                {card.title}
              </div>
              <div style={{
                fontSize: "0.72rem",
                fontWeight: 500,
                color: "rgba(177,212,224,0.5)",
                letterSpacing: "0.02em",
              }}>
                {card.subtitle}
              </div>
            </div>

            <div style={{
              fontSize: "1.2rem",
              color: "rgba(177,212,224,0.3)",
              fontWeight: 300,
            }}>
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
