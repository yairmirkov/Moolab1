import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useLang, useLangSuffix, t, translations } from "../useLang";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const SMALL_FONT = "'Lato', system-ui, -apple-system, sans-serif";

export default function Login() {
  const { loginParent } = useAuth();
  const navigate = useNavigate();
  const lang = useLang();
  const langSuffix = useLangSuffix();
  const tx = translations.pages.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginParent(email, password);
      navigate(`/dashboard${langSuffix}`);
    } catch (err: any) {
      setError(err.message || t(tx.loginFailed, lang));
    } finally {
      setLoading(false);
    }
  };

  const ready = email.trim() && password.length >= 1;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020a14",
      backgroundImage: "radial-gradient(circle, rgba(46,139,192,0.15) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
      <div style={{
        width: "100%", background: "rgba(12,45,72,0.45)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(46,139,192,0.2)",
        borderRadius: 28, padding: "48px 36px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(46,139,192,0.1)",
        boxSizing: "border-box",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src={`${import.meta.env.BASE_URL}moolab-logo-trimmed.png`} alt="Moolab" style={{ height: 60, marginBottom: 12, display: "block", marginLeft: "auto", marginRight: "auto", filter: "brightness(0) invert(1)" }} />
          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {t(tx.title, lang)}
          </h1>
          <p style={{ color: "rgba(177,212,224,0.45)", fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>
            {t(tx.subtitle, lang)}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "rgba(177,212,224,0.4)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
              {t(tx.email, lang)}
            </label>
            <input
              type="email"
              placeholder={t(tx.emailPlaceholder, lang)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 14,
                background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(46,139,192,0.2)",
                color: "#ffffff", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "rgba(177,212,224,0.4)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
              {t(tx.password, lang)}
            </label>
            <input
              type="password"
              placeholder={t(tx.passwordPlaceholder, lang)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 14,
                background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(46,139,192,0.2)",
                color: "#ffffff", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
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
              background: ready ? "linear-gradient(135deg, #0c2d48, #145374)" : "rgba(255,255,255,0.06)",
              color: ready ? "#fff" : "rgba(177,212,224,0.2)",
              fontFamily: FONT, fontWeight: 900, fontSize: "1rem", letterSpacing: "0.04em",
              cursor: ready ? "pointer" : "default",
              boxShadow: ready ? "0 8px 30px rgba(12,45,72,0.2)" : "none",
              transition: "all 0.3s ease", marginTop: 4,
            }}
          >
            {loading ? t(tx.signingIn, lang) : t(tx.submit, lang)}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ color: "rgba(177,212,224,0.35)", fontSize: "0.8rem", fontWeight: 600 }}>
            {t(tx.noAccount, lang)}{" "}
            <Link to={`/register${langSuffix}`} style={{ color: "#2e8bc0", fontWeight: 800, textDecoration: "none" }}>
              {t(tx.createAccount, lang)}
            </Link>
          </p>
        </div>
      </div>

      <Link
        to={`/app-login${langSuffix}`}
        style={{
          display: "flex", alignItems: "center", gap: 16,
          background: "linear-gradient(135deg, #0a1f35, #0c2d48)",
          borderRadius: 20, padding: 22, marginTop: 16,
          textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 12px 36px rgba(12,45,72,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span style={{ fontSize: "1.8rem" }}>🦈</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", color: "#fff", fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            Student Login
          </span>
          <span style={{ display: "block", color: "rgba(177,212,224,0.55)", fontWeight: 600, fontSize: "0.78rem", marginTop: 2 }}>
            Enter username &amp; PIN to play
          </span>
        </span>
        <span style={{ color: "rgba(177,212,224,0.7)", fontSize: "1.3rem", fontWeight: 900 }}>→</span>
      </Link>
      </div>
      <style>{`
        input::placeholder { color: rgba(177,212,224,0.25) !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px rgba(12,45,72,0.8) inset !important; -webkit-text-fill-color: #fff !important; }
      `}</style>
    </div>
  );
}
