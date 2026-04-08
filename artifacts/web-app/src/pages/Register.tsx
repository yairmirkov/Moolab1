import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang, useLangSuffix, t, translations } from "../useLang";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

export default function Register() {
  const { registerParent } = useAuth();
  const navigate = useNavigate();
  const lang = useLang();
  const langSuffix = useLangSuffix();
  const tx = translations.pages.register;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(t(tx.passwordMismatch, lang));
      return;
    }
    if (password.length < 6) {
      setError(t(tx.passwordTooShort, lang));
      return;
    }
    setLoading(true);
    try {
      await registerParent(email, password);
      navigate(`/dashboard${langSuffix}`);
    } catch (err: any) {
      setError(err.message || t(tx.registrationFailed, lang));
    } finally {
      setLoading(false);
    }
  };

  const ready = email.trim() && password.length >= 6 && password === confirm;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f7fb 0%, #e1eef6 50%, #d4e8f2 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: "#fff",
        borderRadius: 28, padding: "48px 36px",
        boxShadow: "0 20px 60px rgba(12,45,72,0.08)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src={`${import.meta.env.BASE_URL}moolab-logo-trimmed.png`} alt="Moolab" style={{ height: 60, marginBottom: 12 }} />
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0c2d48", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {t(tx.title, lang)}
          </h1>
          <p style={{ color: "rgba(12,45,72,0.45)", fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>
            {t(tx.subtitle, lang)}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "rgba(12,45,72,0.5)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
              {t(tx.email, lang)}
            </label>
            <input
              type="email"
              placeholder={t(tx.emailPlaceholder, lang)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 14,
                background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
                color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "rgba(12,45,72,0.5)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
              {t(tx.password, lang)}
            </label>
            <input
              type="password"
              placeholder={t(tx.passwordPlaceholder, lang)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 14,
                background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
                color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "rgba(12,45,72,0.5)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
              {t(tx.confirmPassword, lang)}
            </label>
            <input
              type="password"
              placeholder={t(tx.confirmPlaceholder, lang)}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 14,
                background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
                color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#e74c3c", fontSize: "0.8rem", fontWeight: 700, margin: 0, textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || loading}
            style={{
              width: "100%", padding: "16px", borderRadius: 16, border: "none",
              background: ready ? "linear-gradient(135deg, #0c2d48, #145374)" : "rgba(12,45,72,0.08)",
              color: ready ? "#fff" : "rgba(12,45,72,0.25)",
              fontFamily: FONT, fontWeight: 900, fontSize: "1rem", letterSpacing: "0.04em",
              cursor: ready ? "pointer" : "default",
              boxShadow: ready ? "0 8px 30px rgba(12,45,72,0.2)" : "none",
              transition: "all 0.3s ease", marginTop: 4,
            }}
          >
            {loading ? t(tx.creating, lang) : t(tx.submit, lang)}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.8rem", fontWeight: 600 }}>
            {t(tx.alreadyHaveAccount, lang)}{" "}
            <Link to={`/login${lang === "es" ? "?lang=es" : ""}`} style={{ color: "#2e8bc0", fontWeight: 800, textDecoration: "none" }}>
              {t(tx.signIn, lang)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
