import { Link } from "react-router-dom";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

export default function Home() {
  const langParam = new URLSearchParams(window.location.search).get("lang");
  const isES = langParam === "es";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0c2d48 0%, #145374 40%, #2e8bc0 100%)",
      fontFamily: FONT, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 20,
      textAlign: "center",
    }}>
      <img
        src={`${import.meta.env.BASE_URL}moolab-logo-trimmed.png`}
        alt="Moolab"
        style={{
          height: 100, width: "auto", objectFit: "contain", marginBottom: 24,
          filter: "drop-shadow(0 0 30px rgba(46,139,192,0.4))",
          animation: "splashFloat 3s ease-in-out infinite",
        }}
      />

      <h1 style={{
        fontSize: "2.4rem", fontWeight: 900, color: "#fff",
        margin: "0 0 8px", letterSpacing: "-0.03em",
        textShadow: "0 2px 30px rgba(0,0,0,0.3)",
      }}>
        {isES ? "Alfabetización Financiera" : "Financial Literacy"}
      </h1>
      <h2 style={{
        fontSize: "1.1rem", fontWeight: 700, color: "rgba(177,212,224,0.6)",
        margin: "0 0 48px", letterSpacing: "-0.01em",
      }}>
        {isES ? "Para las mentes del mañana" : "For Tomorrow's Minds"}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 340 }}>
        <Link to="/register" style={{ textDecoration: "none" }}>
          <div style={{
            width: "100%", padding: "18px", borderRadius: 18,
            background: "linear-gradient(135deg, #b1d4e0, #2e8bc0)",
            color: "#0c2d48", fontWeight: 900, fontSize: "1.05rem",
            letterSpacing: "0.04em", textAlign: "center",
            boxShadow: "0 8px 30px rgba(46,139,192,0.3)",
          }}>
            {isES ? "Comenzar" : "Get Started"}
          </div>
        </Link>

        <Link to="/login" style={{ textDecoration: "none" }}>
          <div style={{
            width: "100%", padding: "16px", borderRadius: 16,
            background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(177,212,224,0.15)",
            color: "rgba(177,212,224,0.8)", fontWeight: 800, fontSize: "0.9rem",
            textAlign: "center", backdropFilter: "blur(10px)",
          }}>
            {isES ? "Iniciar Sesión (Padre)" : "Parent Sign In"}
          </div>
        </Link>

        <Link to="/app-login" style={{ textDecoration: "none" }}>
          <div style={{
            width: "100%", padding: "16px", borderRadius: 16,
            background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(177,212,224,0.08)",
            color: "rgba(177,212,224,0.5)", fontWeight: 800, fontSize: "0.9rem",
            textAlign: "center",
          }}>
            🎓 {isES ? "Acceso Estudiante (PIN)" : "Student PIN Access"}
          </div>
        </Link>

        <Link to="/demo" style={{ textDecoration: "none" }}>
          <div style={{
            padding: "12px", borderRadius: 12,
            color: "rgba(177,212,224,0.3)", fontWeight: 700, fontSize: "0.75rem",
            textAlign: "center",
          }}>
            {isES ? "🔬 Modo Demo (Sin registro)" : "🔬 Demo Mode (No signup)"}
          </div>
        </Link>
      </div>

      <style>{`
        @keyframes splashFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
