import { useState } from "react";
import translations, { type Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

export interface VaultItem {
  id: string;
  nameKey: keyof typeof translations.vault;
  descKey: keyof typeof translations.vault;
  cost: number;
  icon: string;
  gradient: string;
  glowColor: string;
}

const VAULT_ITEMS: VaultItem[] = [
  {
    id: "shark_border",
    nameKey: "sharkBorder",
    descKey: "sharkBorderDesc",
    cost: 250,
    icon: "🦈",
    gradient: "linear-gradient(135deg, #FFD700, #FFA500)",
    glowColor: "rgba(255,215,0,0.3)",
  },
  {
    id: "neon_hacker",
    nameKey: "neonHacker",
    descKey: "neonHackerDesc",
    cost: 500,
    icon: "💻",
    gradient: "linear-gradient(135deg, #00ff87, #60efff)",
    glowColor: "rgba(0,255,135,0.3)",
  },
  {
    id: "fire_emoji",
    nameKey: "fireEmoji",
    descKey: "fireEmojiDesc",
    cost: 350,
    icon: "🔥",
    gradient: "linear-gradient(135deg, #ff6b35, #f7c948)",
    glowColor: "rgba(255,107,53,0.3)",
  },
  {
    id: "diamond_trail",
    nameKey: "diamondTrail",
    descKey: "diamondTrailDesc",
    cost: 750,
    icon: "💎",
    gradient: "linear-gradient(135deg, #a78bfa, #60a5fa)",
    glowColor: "rgba(167,139,250,0.3)",
  },
  {
    id: "value_investor",
    nameKey: "valueInvestor",
    descKey: "valueInvestorDesc",
    cost: 1000,
    icon: "📊",
    gradient: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
    glowColor: "rgba(46,139,192,0.3)",
  },
  {
    id: "vault_master",
    nameKey: "vaultMaster",
    descKey: "vaultMasterDesc",
    cost: 1500,
    icon: "🏅",
    gradient: "linear-gradient(135deg, #e040fb, #ff6090)",
    glowColor: "rgba(224,64,251,0.3)",
  },
];

interface TheVaultProps {
  lang: Lang;
  moolies: number;
  unlockedItems: string[];
  equippedItems: string[];
  onPurchase: (itemId: string, cost: number) => void;
  onEquip: (itemId: string) => void;
  onClose: () => void;
}

export default function TheVault({
  lang,
  moolies,
  unlockedItems,
  equippedItems,
  onPurchase,
  onEquip,
  onClose,
}: TheVaultProps) {
  const t = translations.vault;
  const [toast, setToast] = useState<string | null>(null);
  const [purchasedAnim, setPurchasedAnim] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleBuy = (item: VaultItem) => {
    const owned = unlockedItems.includes(item.id);
    if (owned) {
      onEquip(item.id);
      return;
    }
    if (moolies < item.cost) {
      showToast(t.notEnough[lang]);
      return;
    }
    onPurchase(item.id, item.cost);
    setPurchasedAnim(item.id);
    setTimeout(() => setPurchasedAnim(null), 1200);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 50,
        background: "linear-gradient(180deg, #091e30 0%, #0c2d48 40%, #091e30 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        fontFamily: FONT,
        paddingBottom: 24,
      }}
    >
      <style>{`
        @keyframes vaultSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes coinSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes purchasePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes toastSlide {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div style={{
        padding: "12px 20px 0",
        width: "100%",
        maxWidth: 400,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.9rem", color: "#b1d4e0", cursor: "pointer",
            fontFamily: FONT,
          }}
        >←</button>
      </div>

      <div
        style={{
          marginTop: 8,
          marginBottom: 10,
          textAlign: "center",
          animation: "vaultSlideUp 0.6s ease-out both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <img
            src="/moolie-coin.png"
            alt="Moolies"
            style={{
              width: 44,
              height: 44,
              animation: "coinSpin 3s linear infinite",
            }}
          />
          <span
            style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {moolies.toLocaleString()}
          </span>
        </div>
        <h1
          style={{
            margin: "0 0 4px 0",
            fontSize: "1.6rem",
            fontWeight: 900,
            letterSpacing: "0.15em",
            background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t.title[lang]}
        </h1>
        <p
          style={{
            margin: 0,
            color: "rgba(177,212,224,0.5)",
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        >
          {t.subtitle[lang]}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: "16px 20px 40px",
          width: "100%",
          maxWidth: 420,
          boxSizing: "border-box",
        }}
      >
        {VAULT_ITEMS.map((item, idx) => {
          const owned = unlockedItems.includes(item.id);
          const equipped = equippedItems.includes(item.id);
          const canAfford = moolies >= item.cost;
          const isPurchasing = purchasedAnim === item.id;

          return (
            <div
              key={item.id}
              style={{
                animation: `vaultSlideUp 0.5s ease-out ${idx * 0.08}s both`,
                background: "rgba(255,255,255,0.03)",
                border: equipped
                  ? "1px solid rgba(46,139,192,0.5)"
                  : owned
                    ? "1px solid rgba(255,215,0,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                position: "relative",
                overflow: "hidden",
                ...(isPurchasing
                  ? { animation: "purchasePop 0.6s ease-out" }
                  : {}),
              }}
            >
              {equipped && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: item.gradient,
                    borderRadius: "20px 20px 0 0",
                  }}
                />
              )}

              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: owned
                    ? item.gradient
                    : "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  boxShadow: owned ? `0 4px 20px ${item.glowColor}` : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {item.icon}
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    lineHeight: 1.3,
                    marginBottom: 2,
                  }}
                >
                  {(t[item.nameKey] as { en: string; es: string })[lang]}
                </div>
                <div
                  style={{
                    color: "rgba(177,212,224,0.4)",
                    fontSize: "0.55rem",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {(t[item.descKey] as { en: string; es: string })[lang]}
                </div>
              </div>

              {!owned && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  <img
                    src="/moolie-coin.png"
                    alt=""
                    style={{ width: 14, height: 14 }}
                  />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      color: canAfford ? "#FFD700" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {item.cost}
                  </span>
                </div>
              )}

              <button
                onClick={() => handleBuy(item)}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 12,
                  border: "none",
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  ...(equipped
                    ? {
                        background: "rgba(46,139,192,0.15)",
                        color: "#2e8bc0",
                        border: "1px solid rgba(46,139,192,0.3)",
                      }
                    : owned
                      ? {
                          background: "rgba(255,215,0,0.1)",
                          color: "#FFD700",
                          border: "1px solid rgba(255,215,0,0.3)",
                        }
                      : canAfford
                        ? {
                            background: "linear-gradient(135deg, #2e8bc0, #145374)",
                            color: "#fff",
                            boxShadow:
                              "0 4px 15px rgba(46,139,192,0.3)",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.25)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }),
                }}
              >
                {equipped
                  ? t.equipped[lang]
                  : owned
                    ? t.equip[lang]
                    : canAfford
                      ? `${item.cost} MOOLIES`
                      : `${item.cost} MOOLIES`}
              </button>
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(231,111,81,0.95)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 14,
            fontWeight: 800,
            fontSize: "0.8rem",
            fontFamily: FONT,
            zIndex: 320,
            animation: "toastSlide 2s ease-out both",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
