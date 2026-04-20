import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang, useLangSuffix, t, translations } from "../useLang";

const FONT = "'Lato', system-ui, -apple-system, sans-serif";

export default function AppLogin() {
  const { loginChild } = useAuth();
  const navigate = useNavigate();
  const lang = useLang();
  const langSuffix = useLangSuffix();
  const tx = translations.pages.appLogin;
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const child = await loginChild(username, pin) as any;
      const ageMap: Record<string, string> = { "8-12": "Kids", "13-15": "Teens", "16-18": "Adults" };

      const keysToReset = [
        "xp", "streak", "level", "bossWins", "moolies", "modIdx",
        "modProg", "unlockedItems", "equippedItems",
        "name", "birth", "country", "acctType", "parentName", "family",
      ];
      keysToReset.forEach((k) => localStorage.removeItem(`ws_${k}`));

      localStorage.setItem("ws_name", child.displayName);
      localStorage.setItem("ws_ageGroup", ageMap[child.ageGroup] || "Teens");
      localStorage.setItem("ws_lang", lang);
      localStorage.setItem("ws_acctType", "learner");
      localStorage.setItem("ws_xp", String(child.xp ?? 0));
      localStorage.setItem("ws_level", String(child.level ?? 1));
      localStorage.setItem("ws_streak", String(child.streak ?? 0));
      localStorage.setItem("ws_bossWins", String(child.bossWins ?? 0));
      localStorage.setItem("ws_moolies", String(child.moolies ?? 0));

      navigate(`/feed${langSuffix}`);
    } catch (err: any) {
      setError(err.message || t(tx.wrongCredentials, lang));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const ready = username.trim() && pin.length === 4;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0c2d48 0%, #145374 50%, #2e8bc0 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 380, textAlign: "center",
        animation: shake ? "shake 0.5s ease" : undefined,
      }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🦈</div>
        <h1 style={{
          fontSize: "2rem", fontWeight: 900, color: "#fff",
          margin: "0 0 6px", letterSpacing: "-0.03em",
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
        }}>
          {t(tx.title, lang)}
        </h1>
        <p style={{ color: "rgba(177,212,224,0.7)", fontSize: "0.85rem", fontWeight: 600, marginBottom: 36 }}>
          {t(tx.subtitle, lang)}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "rgba(177,212,224,0.5)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4, textAlign: "left" }}>
              {t(tx.username, lang)}
            </label>
            <input
              type="text"
              placeholder={t(tx.usernamePlaceholder, lang)}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              style={{
                width: "100%", padding: "16px 20px", borderRadius: 16,
                background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(177,212,224,0.2)",
                color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: "1.1rem",
                outline: "none", boxSizing: "border-box",
                backdropFilter: "blur(10px)",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "rgba(177,212,224,0.5)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4, textAlign: "left" }}>
              {t(tx.pin, lang)}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              placeholder="• • • •"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              style={{
                width: "100%", padding: "16px 20px", borderRadius: 16,
                background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(177,212,224,0.2)",
                color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: "1.6rem",
                outline: "none", boxSizing: "border-box", textAlign: "center",
                letterSpacing: "0.5em", backdropFilter: "blur(10px)",
              }}
            />
          </div>

          {error && (
            <p style={{
              color: "#FF6B6B", fontSize: "0.8rem", fontWeight: 700, margin: 0,
              background: "rgba(255,107,107,0.1)", padding: "10px 16px", borderRadius: 12,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || loading}
            style={{
              width: "100%", padding: "18px", borderRadius: 18, border: "none",
              background: ready ? "linear-gradient(135deg, #2e8bc0, #b1d4e0)" : "rgba(255,255,255,0.06)",
              color: ready ? "#0c2d48" : "rgba(255,255,255,0.2)",
              fontFamily: FONT, fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
              cursor: ready ? "pointer" : "default",
              boxShadow: ready ? "0 8px 30px rgba(46,139,192,0.3)" : "none",
              transition: "all 0.3s ease", marginTop: 8,
            }}
          >
            {loading ? t(tx.opening, lang) : t(tx.enterLab, lang)}
          </button>
        </form>

        <Link to={`/login${langSuffix}`} style={{
          display: "block", marginTop: 28,
          color: "rgba(177,212,224,0.4)", fontSize: "0.75rem",
          fontWeight: 700, textDecoration: "underline",
          textUnderlineOffset: 3,
        }}>
          {t(tx.parentSignIn, lang)}
        </Link>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
