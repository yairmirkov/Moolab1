import type { Lang } from "./translations";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const SMALL_FONT = "'Lato', system-ui, -apple-system, sans-serif";

export type TabId = "lab" | "tank" | "vault";

interface Tab {
  id: TabId;
  icon: string;
  label: { en: string; es: string };
}

const TABS: Tab[] = [
  { id: "lab", icon: "🧪", label: { en: "Lab", es: "Lab" } },
  { id: "tank", icon: "🦈", label: { en: "Tank", es: "Tank" } },
  { id: "vault", icon: "🏦", label: { en: "Vault", es: "Bóveda" } },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  lang: Lang;
  moolies?: number;
}

export default function BottomNav({ activeTab, onTabChange, lang, moolies }: BottomNavProps) {
  return (
    <>
      <style>{`
        @keyframes navGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(46,139,192,0.3); }
          50% { box-shadow: 0 0 16px rgba(46,139,192,0.5); }
        }
        @keyframes navDotPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: "linear-gradient(180deg, rgba(9,30,48,0.85) 0%, rgba(12,45,72,0.95) 100%)",
        backdropFilter: "blur(24px) saturate(1.5)",
        WebkitBackdropFilter: "blur(24px) saturate(1.5)",
        borderTop: "1px solid rgba(46,139,192,0.12)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        fontFamily: FONT,
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "10px 0 6px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                position: "relative",
                transition: "all 0.25s ease",
              }}
            >
              {isActive && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 28,
                  height: 3,
                  borderRadius: "0 0 4px 4px",
                  background: "linear-gradient(90deg, #2e8bc0, #b1d4e0)",
                  boxShadow: "0 2px 8px rgba(46,139,192,0.5)",
                }} />
              )}

              <div style={{
                position: "relative",
                width: 36,
                height: 36,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                background: isActive
                  ? "rgba(46,139,192,0.12)"
                  : "transparent",
                transition: "all 0.25s ease",
                animation: isActive ? "navGlow 2s ease-in-out infinite" : "none",
              }}>
                {tab.icon}
                {tab.id === "vault" && moolies !== undefined && moolies > 0 && (
                  <div style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #FFD700, #FFA500)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}>
                    <span style={{
                      fontSize: "0.5rem",
                      fontWeight: 900,
                      color: "#0c2d48",
                      lineHeight: 1,
                    }}>
                      {moolies > 999 ? `${Math.floor(moolies / 1000)}k` : moolies}
                    </span>
                  </div>
                )}
              </div>

              <span style={{
                fontSize: "0.58rem",
                fontWeight: isActive ? 800 : 600,
                letterSpacing: "0.06em",
                color: isActive ? "#b1d4e0" : "rgba(177,212,224,0.35)",
                textTransform: "uppercase",
                transition: "all 0.25s ease",
              }}>
                {tab.label[lang]}
              </span>

              {isActive && (
                <div style={{
                  position: "absolute",
                  bottom: 2,
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#2e8bc0",
                  animation: "navDotPulse 2s ease-in-out infinite",
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
