import { useEffect, useState } from "react";
import { type Lang } from "./translations";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";

export interface UserPreferences {
  displayName: string;
  age: string;
  interests: string[];
  moneyGoal: string;
  riskVibe: "chill" | "balanced" | "aggressive" | "";
  futureMe: string;
  allowance: string;
  updatedAt: string;
}

const STORAGE_KEY = "ws_preferences";

export function readPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function savePreferences(p: UserPreferences) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() })); } catch {}
}

const DEFAULTS: UserPreferences = {
  displayName: "", age: "", interests: [], moneyGoal: "",
  riskVibe: "", futureMe: "", allowance: "", updatedAt: "",
};

const INTERESTS: { id: string; en: string; es: string; emoji: string }[] = [
  { id: "stocks", en: "Stocks", es: "Acciones", emoji: "📈" },
  { id: "crypto", en: "Crypto", es: "Cripto", emoji: "₿" },
  { id: "real_estate", en: "Real Estate", es: "Bienes Raíces", emoji: "🏠" },
  { id: "business", en: "Business", es: "Negocios", emoji: "💼" },
  { id: "sports", en: "Sports", es: "Deportes", emoji: "⚽" },
  { id: "gaming", en: "Gaming", es: "Videojuegos", emoji: "🎮" },
  { id: "music", en: "Music", es: "Música", emoji: "🎵" },
  { id: "fashion", en: "Fashion", es: "Moda", emoji: "👟" },
  { id: "tech", en: "Tech", es: "Tecnología", emoji: "💻" },
  { id: "art", en: "Art", es: "Arte", emoji: "🎨" },
  { id: "cars", en: "Cars", es: "Autos", emoji: "🏎️" },
  { id: "science", en: "Science", es: "Ciencia", emoji: "🔬" },
];

const GOALS: { id: string; en: string; es: string; emoji: string }[] = [
  { id: "save", en: "Save up for something big", es: "Ahorrar para algo grande", emoji: "🎯" },
  { id: "grow", en: "Grow my money", es: "Hacer crecer mi dinero", emoji: "🌱" },
  { id: "business", en: "Start a business", es: "Iniciar un negocio", emoji: "🚀" },
  { id: "learn", en: "Just learn the basics", es: "Solo aprender lo básico", emoji: "🧠" },
  { id: "freedom", en: "Be financially free", es: "Lograr libertad financiera", emoji: "🦅" },
];

const RISK: { id: "chill" | "balanced" | "aggressive"; en: string; es: string; emoji: string; desc: { en: string; es: string } }[] = [
  { id: "chill", en: "Chill", es: "Tranqui", emoji: "🧊",
    desc: { en: "Safety first, slow & steady", es: "Seguridad primero, lento y constante" } },
  { id: "balanced", en: "Balanced", es: "Equilibrado", emoji: "⚖️",
    desc: { en: "Mix it up, smart bets", es: "Mezcla todo, apuestas inteligentes" } },
  { id: "aggressive", en: "Aggressive", es: "Agresivo", emoji: "🔥",
    desc: { en: "Big risk, big rewards", es: "Mucho riesgo, mucha recompensa" } },
];

interface PreferencesProps {
  lang: Lang;
  onClose: () => void;
}

export default function Preferences({ lang, onClose }: PreferencesProps) {
  const [p, setP] = useState<UserPreferences>(() => readPreferences());
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    // auto-save on every change so nothing is lost
    savePreferences(p);
  }, [p]);

  // Lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const t = {
    title: { en: "About You", es: "Sobre Ti" },
    subtitle: { en: "Tell us about yourself", es: "Cuéntanos sobre ti" },
    intro: {
      en: "This helps us tune the experience for you. Everything stays on your device.",
      es: "Esto nos ayuda a personalizar tu experiencia. Todo se queda en tu dispositivo.",
    },
    nameLabel: { en: "What should we call you?", es: "¿Cómo te llamamos?" },
    namePh: { en: "e.g. Alex, Money Maker, BossKid", es: "ej. Alex, El Magnate, BossKid" },
    ageLabel: { en: "How old are you?", es: "¿Cuántos años tienes?" },
    interestsLabel: { en: "What are you into?", es: "¿Qué te apasiona?" },
    interestsHint: { en: "Pick as many as you want", es: "Elige las que quieras" },
    goalLabel: { en: "What's your money goal?", es: "¿Cuál es tu meta financiera?" },
    riskLabel: { en: "What's your risk vibe?", es: "¿Cuál es tu vibra de riesgo?" },
    futureLabel: { en: "If you had a million dollars tomorrow, what's the first move?", es: "Si tuvieras un millón de dólares mañana, ¿cuál es la primera jugada?" },
    futurePh: { en: "Type your move...", es: "Escribe tu jugada..." },
    allowanceLabel: { en: "Weekly allowance (optional)", es: "Mesada semanal (opcional)" },
    allowancePh: { en: "e.g. 20", es: "ej. 20" },
    save: { en: "Save & Close ✓", es: "Guardar y Cerrar ✓" },
    saved: { en: "Saved!", es: "¡Guardado!" },
  };

  const toggleInterest = (id: string) =>
    setP((prev) => prev.interests.includes(id)
      ? { ...prev, interests: prev.interests.filter((i) => i !== id) }
      : { ...prev, interests: [...prev.interests, id] });

  const handleSave = () => {
    savePreferences(p);
    setSavedToast(true);
    setTimeout(() => { setSavedToast(false); onClose(); }, 700);
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      zIndex: 900,
      background: "radial-gradient(ellipse at top, #0a1f3a 0%, #050d1c 60%, #02060f 100%)",
      display: "flex", flexDirection: "column", fontFamily: FONT,
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes prefSlideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes prefToast { 0% { opacity: 0; transform: translate(-50%, 10px); } 20% { opacity: 1; transform: translate(-50%, 0); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -10px); } }
      `}</style>

      {/* Top bar */}
      <div style={{
        padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.9rem", color: "#b1d4e0", cursor: "pointer", fontFamily: FONT,
          }}
        >←</button>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: "rgba(178,127,253,0.12)", border: "1px solid rgba(178,127,253,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.2rem", flexShrink: 0,
        }}>👤</div>
        <div style={{ flex: 1 }}>
          <h1 style={{
            margin: 0, fontSize: "1.1rem", fontWeight: 900, letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #b27ffd, #60a5fa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{t.title[lang].toUpperCase()}</h1>
          <p style={{
            margin: 0, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.08em",
            color: "rgba(177,212,224,0.4)",
          }}>{t.subtitle[lang]}</p>
        </div>
      </div>

      {/* Form */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "18px 20px 100px",
        animation: "prefSlideUp 0.4s ease-out both",
      }}>
        <p style={{
          margin: "0 0 22px 0", fontSize: "0.78rem",
          color: "rgba(207,225,245,0.6)", lineHeight: 1.5,
        }}>{t.intro[lang]}</p>

        {/* Display name */}
        <Field label={t.nameLabel[lang]}>
          <input
            type="text"
            value={p.displayName}
            onChange={(e) => setP({ ...p, displayName: e.target.value.slice(0, 40) })}
            placeholder={t.namePh[lang]}
            style={inputStyle}
          />
        </Field>

        {/* Age */}
        <Field label={t.ageLabel[lang]}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["8-12", "13-15", "16-18", "19-21"].map((a) => (
              <Chip
                key={a}
                active={p.age === a}
                onClick={() => setP({ ...p, age: p.age === a ? "" : a })}
                label={a}
                accent="#60a5fa"
              />
            ))}
          </div>
        </Field>

        {/* Interests */}
        <Field label={t.interestsLabel[lang]} hint={t.interestsHint[lang]}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {INTERESTS.map((i) => (
              <Chip
                key={i.id}
                active={p.interests.includes(i.id)}
                onClick={() => toggleInterest(i.id)}
                label={`${i.emoji} ${i[lang]}`}
                accent="#22d3ee"
              />
            ))}
          </div>
        </Field>

        {/* Money goal */}
        <Field label={t.goalLabel[lang]}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {GOALS.map((g) => (
              <ChoiceRow
                key={g.id}
                active={p.moneyGoal === g.id}
                onClick={() => setP({ ...p, moneyGoal: p.moneyGoal === g.id ? "" : g.id })}
                emoji={g.emoji}
                label={g[lang]}
                accent="#fbbf24"
              />
            ))}
          </div>
        </Field>

        {/* Risk vibe */}
        <Field label={t.riskLabel[lang]}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {RISK.map((r) => {
              const active = p.riskVibe === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setP({ ...p, riskVibe: active ? "" : r.id })}
                  style={{
                    padding: "14px 8px", borderRadius: 14, cursor: "pointer",
                    background: active ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${active ? "rgba(255,107,53,0.55)" : "rgba(255,255,255,0.08)"}`,
                    fontFamily: FONT, textAlign: "center", color: "#fff",
                    transition: "all 0.18s ease",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{r.emoji}</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 900, marginBottom: 2 }}>{r[lang]}</div>
                  <div style={{ fontSize: "0.55rem", color: "rgba(207,225,245,0.55)", lineHeight: 1.3 }}>
                    {r.desc[lang]}
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        {/* Future me */}
        <Field label={t.futureLabel[lang]}>
          <textarea
            value={p.futureMe}
            onChange={(e) => setP({ ...p, futureMe: e.target.value.slice(0, 180) })}
            placeholder={t.futurePh[lang]}
            rows={3}
            style={{ ...inputStyle, resize: "none", minHeight: 80, fontFamily: FONT }}
          />
          <div style={{
            textAlign: "right", marginTop: 4,
            fontSize: "0.55rem", color: "rgba(207,225,245,0.4)", fontWeight: 600,
          }}>{p.futureMe.length}/180</div>
        </Field>

        {/* Allowance */}
        <Field label={t.allowanceLabel[lang]}>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "rgba(207,225,245,0.4)", fontWeight: 800, fontSize: "0.85rem",
            }}>$</span>
            <input
              type="number"
              min="0"
              max="9999"
              value={p.allowance}
              onChange={(e) => setP({ ...p, allowance: e.target.value.replace(/[^\d]/g, "").slice(0, 4) })}
              placeholder={t.allowancePh[lang]}
              style={{ ...inputStyle, paddingLeft: 30 }}
            />
          </div>
        </Field>

        <button
          onClick={handleSave}
          style={{
            width: "100%", marginTop: 18, padding: "16px 0",
            borderRadius: 16, border: "none",
            background: "linear-gradient(135deg, #b27ffd, #60a5fa)",
            color: "#fff", fontFamily: FONT, fontWeight: 900,
            fontSize: "0.9rem", letterSpacing: "0.05em", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(178,127,253,0.35)",
          }}
        >{t.save[lang]}</button>
      </div>

      {savedToast && (
        <div style={{
          position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
          padding: "10px 22px", borderRadius: 14, fontWeight: 800, fontSize: "0.8rem",
          fontFamily: FONT, zIndex: 320,
          background: "rgba(96,165,250,0.95)", color: "#fff",
          animation: "prefToast 0.8s ease-out both",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>{t.saved[lang]}</div>
      )}
    </div>
  );
}

// ----- internal building blocks -----

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff", fontSize: "0.85rem", fontWeight: 600, fontFamily: FONT,
  outline: "none", boxSizing: "border-box",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: "0.7rem", fontWeight: 800, color: "#fff",
        letterSpacing: "0.02em", marginBottom: hint ? 2 : 10,
      }}>{label}</div>
      {hint && (
        <div style={{
          fontSize: "0.6rem", color: "rgba(207,225,245,0.45)",
          marginBottom: 10, fontWeight: 600,
        }}>{hint}</div>
      )}
      {children}
    </div>
  );
}

function Chip({ active, onClick, label, accent }: { active: boolean; onClick: () => void; label: string; accent: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px", borderRadius: 999, cursor: "pointer",
        background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
        border: `1.5px solid ${active ? `${accent}88` : "rgba(255,255,255,0.08)"}`,
        color: active ? "#fff" : "rgba(207,225,245,0.65)",
        fontFamily: FONT, fontSize: "0.72rem", fontWeight: 800,
        transition: "all 0.18s ease",
      }}
    >{label}</button>
  );
}

function ChoiceRow({ active, onClick, emoji, label, accent }: { active: boolean; onClick: () => void; emoji: string; label: string; accent: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "12px 14px", borderRadius: 14, cursor: "pointer",
        background: active ? `${accent}1a` : "rgba(255,255,255,0.03)",
        border: `1.5px solid ${active ? `${accent}77` : "rgba(255,255,255,0.08)"}`,
        color: "#fff", fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700,
        display: "flex", alignItems: "center", gap: 12, textAlign: "left",
        transition: "all 0.18s ease",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {active && <span style={{ color: accent, fontWeight: 900 }}>✓</span>}
    </button>
  );
}
