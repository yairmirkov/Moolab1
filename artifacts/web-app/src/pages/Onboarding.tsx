import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { useLangSuffix } from "../useLang";
import { GRADE_OPTIONS } from "../gradeMap";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 18px", borderRadius: 14,
  background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
  color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", color: "rgba(12,45,72,0.5)", fontSize: "0.65rem",
  fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4,
};

function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function Onboarding() {
  const { parent } = useAuth();
  const navigate = useNavigate();
  const langSuffix = useLangSuffix();
  const parentName = localStorage.getItem("ws_parentName") || "";

  useEffect(() => {
    if (!parent) {
      navigate(`/login${langSuffix}`);
    }
  }, [parent, navigate]);

  const [step, setStep] = useState<1 | 2>(1);
  const [childName, setChildName] = useState("");
  const [grade, setGrade] = useState("3");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ username: string; pin: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const ready = childName.trim() && /^\d{4}$/.test(pin);

  if (!parent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || loading) return;
    setError("");
    setLoading(true);
    try {
      const child = await api.addChild({
        displayName: childName.trim(),
        grade,
        skillLevel: "beginner",
        pin,
      });
      setCreated({ username: child.username, pin: child.pin });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    const text = `Go to: moolab.app/app-login\nUsername: ${created.username}\nPIN: ${created.pin}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f7fb 0%, #e1eef6 50%, #d4e8f2 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT, padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 460, background: "#fff",
        borderRadius: 28, padding: "48px 36px",
        boxShadow: "0 20px 60px rgba(12,45,72,0.08)",
      }}>
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          {[1, 2].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: step >= s ? "linear-gradient(135deg, #0c2d48, #145374)" : "rgba(12,45,72,0.08)",
                color: step >= s ? "#fff" : "rgba(12,45,72,0.3)",
                fontWeight: 900, fontSize: "0.85rem",
              }}>
                {s}
              </div>
              {i === 0 && (
                <div style={{ width: 40, height: 2, background: step === 2 ? "#145374" : "rgba(12,45,72,0.1)", borderRadius: 2 }} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <img src={`${import.meta.env.BASE_URL}moolab-logo-trimmed.png`} alt="Moolab" style={{ height: 52, marginBottom: 12, display: "block", marginLeft: "auto", marginRight: "auto" }} />
              <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0c2d48", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                {parentName ? `Welcome, ${parentName}!` : "Welcome!"}
              </h1>
              <p style={{ color: "rgba(12,45,72,0.45)", fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>
                Let's set up your first child profile
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>CHILD'S NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>GRADE</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
                >
                  {GRADE_OPTIONS.filter((g) => g.id !== "college" && g.id !== "adult").map((g) => (
                    <option key={g.id} value={g.id}>{g.labelEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>4-DIGIT PIN</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="e.g. 4821"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    style={{ ...inputStyle, flex: 1, letterSpacing: "0.2em" }}
                  />
                  <button
                    type="button"
                    onClick={() => setPin(randomPin())}
                    style={{
                      padding: "0 20px", borderRadius: 14, border: "1.5px solid rgba(46,139,192,0.3)",
                      background: "rgba(46,139,192,0.08)", color: "#2e8bc0",
                      fontFamily: FONT, fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Generate
                  </button>
                </div>
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
                {loading ? "Creating..." : "Create Profile"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link
                to={`/dashboard${langSuffix}`}
                style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}
              >
                Skip for now
              </Link>
            </div>
          </>
        )}

        {step === 2 && created && (
          <>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🎉</div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0c2d48", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                {childName.trim() ? `${childName.trim()} is ready to go!` : "All set!"}
              </h1>
              <p style={{ color: "rgba(12,45,72,0.45)", fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>
                Share this login info with your child
              </p>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #0c2d48, #145374)",
              borderRadius: 20, padding: "24px 26px", marginBottom: 16,
            }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ color: "rgba(177,212,224,0.7)", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>
                  USERNAME
                </div>
                <div style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 900, letterSpacing: "0.02em" }}>
                  {created.username}
                </div>
              </div>
              <div>
                <div style={{ color: "rgba(177,212,224,0.7)", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4 }}>
                  PIN
                </div>
                <div style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 900, letterSpacing: "0.3em" }}>
                  {created.pin}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                width: "100%", padding: "14px", borderRadius: 14,
                border: "1.5px solid rgba(46,139,192,0.3)",
                background: copied ? "rgba(46,204,113,0.1)" : "rgba(46,139,192,0.08)",
                color: copied ? "#27ae60" : "#2e8bc0",
                fontFamily: FONT, fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                marginBottom: 24,
              }}
            >
              {copied ? "✓ Copied!" : "📋 Copy login info"}
            </button>

            {error && (
              <p style={{ color: "#e74c3c", fontSize: "0.8rem", fontWeight: 700, margin: "0 0 16px", textAlign: "center" }}>
                {error}
              </p>
            )}

            <div style={{
              background: "rgba(177,212,224,0.12)", borderRadius: 16,
              padding: "18px 20px", marginBottom: 24, textAlign: "center",
            }}>
              <p style={{ color: "rgba(12,45,72,0.55)", fontSize: "0.75rem", fontWeight: 700, margin: "0 0 12px" }}>
                Download the Moolab app
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <div style={{
                  padding: "10px 18px", borderRadius: 10, background: "#0c2d48",
                  color: "#fff", fontSize: "0.75rem", fontWeight: 800,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: "1rem" }}></span> App Store
                </div>
                <div style={{
                  padding: "10px 18px", borderRadius: 10, background: "#0c2d48",
                  color: "#fff", fontSize: "0.75rem", fontWeight: 800,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{ fontSize: "1rem" }}>▶</span> Google Play
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/dashboard${langSuffix}`)}
              style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #0c2d48, #145374)",
                color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: "1rem",
                letterSpacing: "0.04em", cursor: "pointer",
                boxShadow: "0 8px 30px rgba(12,45,72,0.2)",
              }}
            >
              Go to My Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
