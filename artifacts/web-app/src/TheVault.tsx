import { useEffect, useMemo, useState } from "react";
import { type Lang } from "./translations";
import { TITLES, titleEquipKey, type UserStats } from "./titles";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";

type Category = "cosmetic" | "powerup" | "title" | "seasonal";
type TabId = "all" | "cosmetic" | "powerup" | "title" | "seasonal";

export interface VaultItem {
  id: string;
  name: { en: string; es: string };
  desc: { en: string; es: string };
  cost: number;
  icon: string;
  gradient: string;
  glowColor: string;
  category: Category;
  isNew?: boolean;
  isConsumable?: boolean;
  availableMonth?: number;
}

export const VAULT_ITEMS: VaultItem[] = [
  // ---------- COSMETICS ----------
  {
    id: "shark_border",
    name: { en: "Shark Border", es: "Borde Tiburón" },
    desc: { en: "Golden avatar ring of power", es: "Anillo dorado de poder para tu avatar" },
    cost: 250, icon: "🦈",
    gradient: "linear-gradient(135deg, #FFD700, #FFA500)",
    glowColor: "rgba(255,215,0,0.3)",
    category: "cosmetic",
  },
  {
    id: "neon_hacker",
    name: { en: "Neon Hacker Theme", es: "Tema Neon Hacker" },
    desc: { en: "Dark UI with electric neon accents", es: "UI oscura con acentos neón eléctricos" },
    cost: 500, icon: "💻",
    gradient: "linear-gradient(135deg, #00ff87, #60efff)",
    glowColor: "rgba(0,255,135,0.3)",
    category: "cosmetic",
  },
  {
    id: "fire_emoji",
    name: { en: "Fire Reaction Pack", es: "Pack de Reacciones de Fuego" },
    desc: { en: "Unlock animated fire reactions", es: "Desbloquea reacciones animadas de fuego" },
    cost: 350, icon: "🔥",
    gradient: "linear-gradient(135deg, #ff6b35, #f7c948)",
    glowColor: "rgba(255,107,53,0.3)",
    category: "cosmetic",
  },
  {
    id: "diamond_trail",
    name: { en: "Diamond Trail Effect", es: "Efecto Rastro de Diamante" },
    desc: { en: "Sparkle particles follow your scrolls", es: "Partículas brillantes siguen tu scroll" },
    cost: 750, icon: "💎",
    gradient: "linear-gradient(135deg, #a78bfa, #60a5fa)",
    glowColor: "rgba(167,139,250,0.3)",
    category: "cosmetic",
  },
  {
    id: "gradient_avatar",
    name: { en: "Gradient Avatar", es: "Avatar Degradado" },
    desc: { en: "Rainbow shifting avatar border", es: "Borde de avatar arcoíris" },
    cost: 300, icon: "🎨",
    gradient: "linear-gradient(135deg, #ff2d95, #ff9500, #39ff14, #00d4ff, #bf5cff)",
    glowColor: "rgba(255,45,149,0.3)",
    category: "cosmetic", isNew: true,
  },
  {
    id: "gold_crown",
    name: { en: "Gold Crown", es: "Corona Dorada" },
    desc: { en: "Crown icon above your username", es: "Corona sobre tu nombre" },
    cost: 400, icon: "👑",
    gradient: "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)",
    glowColor: "rgba(255,215,0,0.35)",
    category: "cosmetic", isNew: true,
  },
  {
    id: "lion_frame",
    name: { en: "Lion Avatar Frame", es: "Marco León" },
    desc: { en: "Aggressive energy border", es: "Borde de energía agresiva" },
    cost: 450, icon: "🦁",
    gradient: "linear-gradient(135deg, #ff9500, #ff6b35, #ff2d00)",
    glowColor: "rgba(255,149,0,0.35)",
    category: "cosmetic", isNew: true,
  },
  {
    id: "holographic_border",
    name: { en: "Holographic Border", es: "Borde Holográfico" },
    desc: { en: "Iridescent shifting frame", es: "Marco iridiscente" },
    cost: 600, icon: "🌈",
    gradient: "linear-gradient(135deg, #60efff, #ff2d95, #39ff14, #bf5cff)",
    glowColor: "rgba(96,239,255,0.3)",
    category: "cosmetic", isNew: true,
  },

  // ---------- POWER-UPS ----------
  {
    id: "streak_freeze",
    name: { en: "Streak Freeze", es: "Protege Tu Racha" },
    desc: { en: "Protect your streak for 1 missed day", es: "Protege tu racha por 1 día perdido" },
    cost: 75, icon: "❄️",
    gradient: "linear-gradient(135deg, #60efff, #0061ff)",
    glowColor: "rgba(96,239,255,0.3)",
    category: "powerup", isNew: true, isConsumable: true,
  },

  // ---------- SEASONAL ----------
  {
    id: "halloween_pack",
    name: { en: "Halloween Pack 🎃", es: "Pack Halloween 🎃" },
    desc: { en: "Spooky card backgrounds", es: "Fondos de cartas tenebrosos" },
    cost: 200, icon: "🎃",
    gradient: "linear-gradient(135deg, #ff6b35, #2d0a00)",
    glowColor: "rgba(255,107,53,0.3)",
    category: "seasonal", availableMonth: 10,
  },
  {
    id: "winter_bundle",
    name: { en: "Winter Bundle ❄️", es: "Pack Invernal ❄️" },
    desc: { en: "Frost UI accents", es: "Acentos UI escarchados" },
    cost: 200, icon: "❄️",
    gradient: "linear-gradient(135deg, #60efff, #0061ff)",
    glowColor: "rgba(96,239,255,0.3)",
    category: "seasonal", availableMonth: 12,
  },
  {
    id: "spring_fresh",
    name: { en: "Spring Fresh 🌸", es: "Primavera Fresca 🌸" },
    desc: { en: "Clean pastel theme", es: "Tema pastel limpio" },
    cost: 200, icon: "🌸",
    gradient: "linear-gradient(135deg, #ff9de2, #a8edea)",
    glowColor: "rgba(255,157,226,0.3)",
    category: "seasonal", availableMonth: 4,
  },
  {
    id: "summer_vibes",
    name: { en: "Summer Vibes 🏖️", es: "Vibras de Verano 🏖️" },
    desc: { en: "Beach background pack", es: "Pack de fondos de playa" },
    cost: 200, icon: "🏖️",
    gradient: "linear-gradient(135deg, #f7c948, #ff6b35)",
    glowColor: "rgba(247,201,72,0.3)",
    category: "seasonal", availableMonth: 7,
  },
];

const T = {
  title: { en: "THE VAULT", es: "LA BÓVEDA" },
  subtitle: { en: "Spend your Moolies on epic rewards", es: "Gasta tus Moolies en recompensas épicas" },
  equipped: { en: "EQUIPPED", es: "EQUIPADO" },
  equip: { en: "EQUIP", es: "EQUIPAR" },
  notEnough: { en: "Not enough Moolies!", es: "¡No tienes suficientes Moolies!" },
  newBadge: { en: "NEW", es: "NUEVO" },
  dailyDeal: { en: "🔥 DAILY DEAL", es: "🔥 OFERTA DEL DÍA" },
  daysLeft: { en: (n: number) => `⏳ ${n} day${n === 1 ? "" : "s"} left`, es: (n: number) => `⏳ ${n} día${n === 1 ? "" : "s"} restante${n === 1 ? "" : "s"}` },
  confirmPrompt: { en: "Confirm purchase?", es: "¿Confirmar compra?" },
  confirm: { en: "✓ Confirm", es: "✓ Confirmar" },
  cancel: { en: "✕ Cancel", es: "✕ Cancelar" },
  tabs: {
    all: { en: "All", es: "Todo" },
    cosmetic: { en: "Cosmetics", es: "Cosméticos" },
    powerup: { en: "Power-ups", es: "Power-ups" },
    title: { en: "Titles", es: "Títulos" },
    seasonal: { en: "Seasonal", es: "Temporada" },
  },
  seasonalEmptyNone: { en: "No active seasonal items right now — check back later 🌊", es: "Sin temporada activa por ahora — vuelve pronto 🌊" },
  seasonalEmpty: { en: "Coming soon 🌊", es: "Próximamente 🌊" },
  unlocked: { en: "UNLOCKED ✓", es: "DESBLOQUEADO ✓" },
  locked: { en: "🔒 Locked", es: "🔒 Bloqueado" },
  titlesTitle: { en: "TITLES", es: "TÍTULOS" },
  unequip: { en: "UNEQUIP", es: "DESEQUIPAR" },
  owned: { en: (n: number) => `×${n}`, es: (n: number) => `×${n}` },
};

interface TheVaultProps {
  lang: Lang;
  moolies: number;
  unlockedItems: string[];
  equippedItems: string[];
  userStats: UserStats;
  onPurchase: (itemId: string, cost: number) => void;
  onEquip: (itemId: string) => void;
  onEquipTitle: (titleId: string | null) => void;
  onBuyConsumable: (itemId: string, cost: number) => void;
  onClose: () => void;
}

function readConsumables(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("ws_consumables") || "{}"); } catch { return {}; }
}

function daysLeftInMonth(): number {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Math.max(0, last - d.getDate());
}

export default function TheVault({
  lang,
  moolies,
  unlockedItems,
  equippedItems,
  userStats,
  onPurchase,
  onEquip,
  onEquipTitle,
  onBuyConsumable,
  onClose,
}: TheVaultProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [purchasedAnim, setPurchasedAnim] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [consumables, setConsumables] = useState<Record<string, number>>(() => readConsumables());

  // Refresh consumables count from storage when shown
  useEffect(() => { setConsumables(readConsumables()); }, []);

  const currentMonth = new Date().getMonth() + 1;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Daily deal — deterministic by date, eligible items only
  // (exclude legacy `title` category and seasonal items not in current month).
  const dealItem = useMemo(() => {
    const eligible = VAULT_ITEMS.filter(
      (it) => it.category !== "title" &&
              (it.category !== "seasonal" || it.availableMonth === currentMonth)
    );
    const pool = eligible.length > 0 ? eligible : VAULT_ITEMS;
    const today = new Date().toISOString().slice(0, 10);
    const seed = today.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
    return pool[seed % pool.length];
  }, [currentMonth]);
  const dealPrice = Math.floor(dealItem.cost * 0.7);

  // Visible items by tab + seasonal month gating
  const visibleItems = useMemo(() => {
    return VAULT_ITEMS.filter((it) => {
      if (it.category === "seasonal" && it.availableMonth !== currentMonth) return false;
      if (activeTab === "all") return it.category !== "title"; // titles live in their own tab
      return it.category === activeTab;
    });
  }, [activeTab, currentMonth]);

  const handleCardTap = (item: VaultItem) => {
    const owned = unlockedItems.includes(item.id);

    // Already-owned non-consumable: instant equip/unequip, skip confirm flow
    if (owned && !item.isConsumable) {
      onEquip(item.id);
      setConfirmingId(null);
      return;
    }

    // Use the effective price (deal price applies on the All tab when this is the deal item)
    const isDeal = dealItem.id === item.id && activeTab === "all";
    const effectivePrice = isDeal ? dealPrice : item.cost;
    if (moolies < effectivePrice) {
      showToast(T.notEnough[lang]);
      return;
    }

    // Two-step confirm
    if (confirmingId !== item.id) {
      setConfirmingId(item.id);
      return;
    }
  };

  const finalizePurchase = (item: VaultItem) => {
    const isDeal = dealItem.id === item.id && activeTab === "all";
    const price = isDeal ? dealPrice : item.cost;
    if (moolies < price) {
      showToast(T.notEnough[lang]);
      return;
    }
    if (item.isConsumable) {
      onBuyConsumable(item.id, price);
      setConsumables(readConsumables());
    } else {
      onPurchase(item.id, price);
    }
    setPurchasedAnim(item.id);
    setTimeout(() => setPurchasedAnim(null), 1200);
    setConfirmingId(null);
  };

  const cancelConfirm = () => setConfirmingId(null);

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: T.tabs.all[lang] },
    { id: "cosmetic", label: T.tabs.cosmetic[lang] },
    { id: "powerup", label: T.tabs.powerup[lang] },
    { id: "title", label: T.tabs.title[lang] },
    { id: "seasonal", label: T.tabs.seasonal[lang] },
  ];

  const renderItemCard = (item: VaultItem, idx: number, opts?: { deal?: boolean; wide?: boolean }) => {
    const owned = unlockedItems.includes(item.id);
    const equipped = equippedItems.includes(item.id);
    const ownedCount = consumables[item.id] || 0;
    const isPurchasing = purchasedAnim === item.id;
    const isConfirming = confirmingId === item.id;
    const isDeal = !!opts?.deal;
    const wide = !!opts?.wide;
    const effectivePrice = isDeal ? dealPrice : item.cost;
    const canAfford = moolies >= effectivePrice;
    const isSeasonal = item.category === "seasonal";

    return (
      <div
        key={(opts?.deal ? "deal_" : "") + item.id}
        onClick={(e) => {
          // Tap outside buttons cancels the confirm for this card
          if (isConfirming && (e.target as HTMLElement).tagName !== "BUTTON") {
            cancelConfirm();
          }
        }}
        style={{
          animation: `vaultSlideUp 0.5s ease-out ${idx * 0.06}s both`,
          background: isDeal
            ? "linear-gradient(135deg, rgba(255,107,53,0.18), rgba(247,201,72,0.08))"
            : "rgba(255,255,255,0.03)",
          border: isDeal
            ? "1.5px solid rgba(255,107,53,0.55)"
            : equipped
              ? "1px solid rgba(46,139,192,0.5)"
              : owned
                ? "1px solid rgba(255,215,0,0.3)"
                : "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20,
          padding: wide ? "16px 20px" : 18,
          display: "flex",
          flexDirection: wide ? "row" : "column",
          alignItems: "center",
          gap: wide ? 16 : 8,
          position: "relative",
          overflow: "hidden",
          gridColumn: wide ? "1 / -1" : undefined,
          ...(isPurchasing ? { animation: "purchasePop 0.6s ease-out" } : {}),
        }}
      >
        {/* NEW badge */}
        {item.isNew && (
          <div style={{
            position: "absolute", top: 8, right: 8, zIndex: 2,
            background: "#39ff14", color: "#0a0a0a",
            fontSize: "0.45rem", fontWeight: 900, letterSpacing: "0.08em",
            padding: "4px 7px", borderRadius: 6,
          }}>{T.newBadge[lang]}</div>
        )}

        {/* DAILY DEAL badge */}
        {isDeal && (
          <div style={{
            position: "absolute", top: 8, left: 8, zIndex: 2,
            background: "linear-gradient(135deg, #ff6b35, #f7c948)",
            color: "#0a0a0a",
            fontSize: "0.5rem", fontWeight: 900, letterSpacing: "0.1em",
            padding: "5px 9px", borderRadius: 8,
          }}>{T.dailyDeal[lang]}</div>
        )}

        {/* Consumable owned-count badge */}
        {item.isConsumable && ownedCount > 0 && (
          <div style={{
            position: "absolute", top: 8, left: 8, zIndex: 2,
            background: "rgba(96,239,255,0.18)", color: "#60efff",
            border: "1px solid rgba(96,239,255,0.4)",
            fontSize: "0.55rem", fontWeight: 900,
            padding: "3px 7px", borderRadius: 6,
          }}>{T.owned[lang](ownedCount)}</div>
        )}

        {equipped && !wide && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: item.gradient, borderRadius: "20px 20px 0 0",
          }} />
        )}

        <div style={{
          width: wide ? 64 : 56,
          height: wide ? 64 : 56,
          borderRadius: 16,
          background: owned || isDeal ? item.gradient : "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: wide ? "2rem" : "1.8rem",
          boxShadow: owned || isDeal ? `0 4px 20px ${item.glowColor}` : "none",
          transition: "all 0.3s ease",
          flexShrink: 0,
          marginTop: wide ? 0 : 8,
        }}>
          {item.icon}
        </div>

        <div style={{ textAlign: wide ? "left" : "center", flex: wide ? 1 : undefined, minWidth: 0 }}>
          <div style={{
            color: "#fff", fontSize: wide ? "0.92rem" : "0.72rem",
            fontWeight: 800, lineHeight: 1.3, marginBottom: 2,
          }}>
            {item.name[lang]}
          </div>
          <div style={{
            color: "rgba(177,212,224,0.5)", fontSize: wide ? "0.66rem" : "0.55rem",
            fontWeight: 600, lineHeight: 1.3,
          }}>
            {item.desc[lang]}
          </div>
          {isSeasonal && (
            <div style={{
              marginTop: 4, fontSize: "0.55rem", fontWeight: 800,
              color: "#f7c948", letterSpacing: "0.04em",
            }}>{T.daysLeft[lang](daysLeftInMonth())}</div>
          )}
        </div>

        {/* Price row (only when not owned, or consumable) */}
        {(!owned || item.isConsumable) && !isConfirming && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4, marginBottom: 2,
            ...(wide ? { marginLeft: "auto" } : {}),
          }}>
            <img src="/moolie-coin.png" alt="" style={{ width: 14, height: 14 }} />
            {isDeal ? (
              <>
                <span style={{
                  fontSize: "0.62rem", fontWeight: 700,
                  color: "rgba(255,255,255,0.35)", textDecoration: "line-through",
                }}>{item.cost}</span>
                <span style={{
                  fontSize: "0.85rem", fontWeight: 900, color: "#FFD700",
                }}>{dealPrice}</span>
              </>
            ) : (
              <span style={{
                fontSize: "0.75rem", fontWeight: 900,
                color: canAfford ? "#FFD700" : "rgba(255,255,255,0.3)",
              }}>{item.cost}</span>
            )}
          </div>
        )}

        {/* Action area */}
        {isConfirming ? (
          <div style={{ display: "flex", gap: 6, width: wide ? "auto" : "100%" }}>
            <button
              onClick={(e) => { e.stopPropagation(); finalizePurchase(item); }}
              style={{
                flex: 1, padding: "9px 12px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #39ff14, #00cc66)",
                color: "#0a0a0a", fontFamily: FONT, fontWeight: 900,
                fontSize: "0.62rem", letterSpacing: "0.06em", cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >{T.confirm[lang]}</button>
            <button
              onClick={(e) => { e.stopPropagation(); cancelConfirm(); }}
              style={{
                padding: "9px 12px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.7)",
                fontFamily: FONT, fontWeight: 800,
                fontSize: "0.62rem", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >{T.cancel[lang]}</button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); handleCardTap(item); }}
            style={{
              width: wide ? "auto" : "100%",
              padding: wide ? "10px 18px" : "10px 0",
              borderRadius: 12,
              fontFamily: FONT, fontWeight: 800,
              fontSize: "0.65rem", letterSpacing: "0.08em",
              cursor: "pointer", transition: "all 0.3s ease",
              ...(equipped && !item.isConsumable
                ? { background: "rgba(46,139,192,0.15)", color: "#2e8bc0", border: "1px solid rgba(46,139,192,0.3)" }
                : owned && !item.isConsumable
                  ? { background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }
                  : canAfford
                    ? { background: "linear-gradient(135deg, #2e8bc0, #145374)", color: "#fff",
                        boxShadow: "0 4px 15px rgba(46,139,192,0.3)", border: "none" }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)",
                        border: "1px solid rgba(255,255,255,0.06)" }),
            }}
          >
            {equipped && !item.isConsumable
              ? T.equipped[lang]
              : owned && !item.isConsumable
                ? T.equip[lang]
                : `${effectivePrice} MOOLIES`}
          </button>
        )}
      </div>
    );
  };

  const renderTitlesTab = () => {
    const equippedTitleKey = equippedItems.find((x) => x.startsWith("title_"));
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
        padding: "16px 20px 40px",
        width: "100%", maxWidth: "min(94vw, 1100px)", boxSizing: "border-box",
      }}>
        {TITLES.map((title, idx) => {
          const unlocked = title.condition(userStats);
          const isEquipped = equippedTitleKey === titleEquipKey(title.id);
          return (
            <div key={title.id} style={{
              animation: `vaultSlideUp 0.5s ease-out ${idx * 0.05}s both`,
              background: "rgba(255,255,255,0.03)",
              border: isEquipped
                ? "1.5px solid rgba(46,139,192,0.6)"
                : unlocked
                  ? "1px solid rgba(57,255,20,0.25)"
                  : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: 18,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              opacity: unlocked ? 1 : 0.45,
              position: "relative", overflow: "hidden",
            }}>
              {unlocked && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  background: "rgba(57,255,20,0.15)", color: "#39ff14",
                  border: "1px solid rgba(57,255,20,0.35)",
                  fontSize: "0.45rem", fontWeight: 900, letterSpacing: "0.08em",
                  padding: "4px 7px", borderRadius: 6,
                }}>{T.unlocked[lang]}</div>
              )}
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: unlocked
                  ? "linear-gradient(135deg, rgba(46,139,192,0.25), rgba(177,212,224,0.1))"
                  : "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem",
              }}>{unlocked ? title.emoji : "🔒"}</div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  color: "#fff", fontSize: "0.78rem", fontWeight: 800,
                  lineHeight: 1.3, marginBottom: 4,
                }}>{title.emoji} {title.label[lang]}</div>
                <div style={{
                  color: "rgba(177,212,224,0.55)", fontSize: "0.55rem",
                  fontWeight: 600, lineHeight: 1.3,
                }}>{title.hint[lang]}</div>
              </div>
              <button
                disabled={!unlocked}
                onClick={() => {
                  if (!unlocked) return;
                  onEquipTitle(isEquipped ? null : title.id);
                }}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 12,
                  fontFamily: FONT, fontWeight: 800, fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  ...(isEquipped
                    ? { background: "rgba(46,139,192,0.15)", color: "#2e8bc0", border: "1px solid rgba(46,139,192,0.3)" }
                    : unlocked
                      ? { background: "linear-gradient(135deg, #2e8bc0, #145374)", color: "#fff", border: "none" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "none" }),
                }}
              >
                {isEquipped ? T.unequip[lang] : unlocked ? T.equip[lang] : T.locked[lang]}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        zIndex: 50,
        background: "linear-gradient(180deg, #091e30 0%, #0c2d48 40%, #091e30 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        overflow: "auto", fontFamily: FONT, paddingBottom: 24,
      }}
      onClick={() => { if (confirmingId) cancelConfirm(); }}
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
      `}</style>

      <div style={{ padding: "12px 20px 0", width: "100%", maxWidth: "min(94vw, 1100px)" }}>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.9rem", color: "#b1d4e0", cursor: "pointer", fontFamily: FONT,
          }}
        >←</button>
      </div>

      <div style={{ marginTop: 8, marginBottom: 10, textAlign: "center", animation: "vaultSlideUp 0.6s ease-out both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          <img src="/moolie-coin.png" alt="Moolies"
               style={{ width: 44, height: 44, animation: "coinSpin 3s linear infinite" }} />
          <span style={{
            fontSize: "2.4rem", fontWeight: 900,
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{moolies.toLocaleString()}</span>
        </div>
        <h1 style={{
          margin: "0 0 4px 0", fontSize: "1.6rem", fontWeight: 900, letterSpacing: "0.15em",
          background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{T.title[lang]}</h1>
        <p style={{ margin: 0, color: "rgba(177,212,224,0.5)", fontSize: "0.7rem", fontWeight: 600 }}>
          {T.subtitle[lang]}
        </p>
      </div>

      {/* TABS */}
      <div style={{
        display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center",
        padding: "4px 20px", width: "100%", maxWidth: "min(94vw, 1100px)",
        boxSizing: "border-box",
      }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); setConfirmingId(null); }}
              style={{
                padding: "8px 14px", borderRadius: 999,
                border: "1px solid " + (active ? "rgba(46,139,192,0.55)" : "rgba(255,255,255,0.08)"),
                background: active ? "rgba(46,139,192,0.18)" : "transparent",
                color: active ? "#b1d4e0" : "rgba(255,255,255,0.4)",
                fontFamily: FONT, fontWeight: 800, fontSize: "0.65rem",
                letterSpacing: "0.06em", cursor: "pointer",
                borderBottom: active ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s ease",
              }}
            >{tab.label}</button>
          );
        })}
      </div>

      {/* TITLES TAB */}
      {activeTab === "title" ? renderTitlesTab() : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          padding: "16px 20px 40px",
          width: "100%", maxWidth: "min(94vw, 1100px)", boxSizing: "border-box",
        }}>
          {/* Daily deal (only on All) */}
          {activeTab === "all" && renderItemCard(dealItem, -1, { deal: true, wide: true })}

          {/* Seasonal empty state */}
          {activeTab === "seasonal" && visibleItems.length === 0 && (
            <div style={{
              gridColumn: "1 / -1", textAlign: "center", padding: "40px 20px",
              color: "rgba(177,212,224,0.5)", fontSize: "0.85rem", fontWeight: 700,
            }}>
              {VAULT_ITEMS.some((it) => it.category === "seasonal")
                ? T.seasonalEmptyNone[lang]
                : T.seasonalEmpty[lang]}
            </div>
          )}

          {visibleItems.map((item, idx) => renderItemCard(item, idx))}
        </div>
      )}

      {toast && (
        <div style={{
          position: "absolute", bottom: 60, left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(231,111,81,0.95)", color: "#fff",
          padding: "12px 24px", borderRadius: 14,
          fontWeight: 800, fontSize: "0.8rem", fontFamily: FONT,
          zIndex: 320, animation: "toastSlide 2s ease-out both",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>{toast}</div>
      )}
    </div>
  );
}
