import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { api } from "../api";
import { useLang, useLangSuffix, t, translations } from "../useLang";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

interface ChildProfile {
  id: number;
  username: string;
  displayName: string;
  pin: string;
  ageGroup: string;
}

export default function Dashboard() {
  const { parent, logout } = useAuth();
  const navigate = useNavigate();
  const lang = useLang();
  const langSuffix = useLangSuffix();
  const tx = translations.pages.dashboard;
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState("8-12");
  const [creating, setCreating] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(true);

  useEffect(() => {
    if (!parent) {
      navigate(`/login${langSuffix}`);
      return;
    }
    api.getChildren()
      .then(setChildren)
      .catch(() => {})
      .finally(() => setLoadingChildren(false));
  }, [parent, navigate]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const child = await api.createChild(newName.trim(), newAge);
      setChildren((prev) => [...prev, child]);
      setShowModal(false);
      setNewName("");
      setNewAge("8-12");
    } catch (err: any) {
      alert(err.message || t(tx.failedCreate, lang));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t(tx.removeProfile, lang))) return;
    try {
      await api.deleteChild(id);
      setChildren((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate(`/${langSuffix}`);
  };

  if (!parent) return null;

  const steps = [
    t(tx.step1, lang),
    t(tx.step2, lang),
    t(tx.step3, lang),
    t(tx.step4, lang),
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f7fb 0%, #e8f1f8 100%)",
      fontFamily: FONT, padding: "0 0 40px",
    }}>
      <div style={{
        background: "#fff", padding: "20px 24px",
        borderBottom: "1px solid rgba(12,45,72,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={`${import.meta.env.BASE_URL}moolab-logo-trimmed.png`} alt="Moolab" style={{ height: 36 }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: "1rem", color: "#0c2d48", letterSpacing: "-0.02em" }}>
              {t(tx.title, lang)}
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(12,45,72,0.4)", fontWeight: 600 }}>
              {parent.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "none", border: "1.5px solid rgba(12,45,72,0.1)",
            color: "rgba(12,45,72,0.5)", fontFamily: FONT, fontWeight: 700,
            fontSize: "0.75rem", padding: "8px 16px", borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {t(tx.signOut, lang)}
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{
          background: "linear-gradient(135deg, #0c2d48, #145374)",
          borderRadius: 24, padding: "32px 28px", marginBottom: 28,
          color: "#fff",
        }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(177,212,224,0.6)", marginBottom: 8 }}>
            {t(tx.subscription, lang)}
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: 4 }}>
            Moolab {parent.subscriptionStatus === "free" ? t(tx.freePlan, lang) : t(tx.apexPlan, lang)} {t(tx.plan, lang)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(177,212,224,0.7)", fontWeight: 600 }}>
            {parent.subscriptionStatus === "free"
              ? t(tx.upgradeMsg, lang)
              : t(tx.paidMsg, lang)}
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0c2d48", margin: 0 }}>
            {t(tx.childProfiles, lang)}
          </h2>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
              border: "none", color: "#0c2d48", fontFamily: FONT,
              fontWeight: 900, fontSize: "0.8rem", padding: "10px 20px",
              borderRadius: 14, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(46,139,192,0.2)",
            }}
          >
            {t(tx.addChild, lang)}
          </button>
        </div>

        {loadingChildren ? (
          <div style={{ textAlign: "center", color: "rgba(12,45,72,0.3)", padding: 40, fontWeight: 600 }}>
            {t(tx.loadingProfiles, lang)}
          </div>
        ) : children.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "#fff", borderRadius: 20,
            border: "2px dashed rgba(12,45,72,0.1)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>👨‍👧‍👦</div>
            <p style={{ color: "rgba(12,45,72,0.4)", fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>
              {t(tx.noProfiles, lang)}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {children.map((child) => (
              <div key={child.id} style={{
                background: "#fff", borderRadius: 20, padding: "20px 24px",
                boxShadow: "0 4px 16px rgba(12,45,72,0.04)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", fontWeight: 900, color: "#0c2d48",
                  }}>
                    {child.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "1rem", color: "#0c2d48" }}>
                      {child.displayName}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(12,45,72,0.4)", fontWeight: 600, marginTop: 2 }}>
                      @{child.username} — {t(tx.ageGroupLabel, lang)} {child.ageGroup}
                    </div>
                    <div style={{
                      fontSize: "0.7rem", fontWeight: 800, color: "#2e8bc0", marginTop: 4,
                      background: "rgba(46,139,192,0.08)", display: "inline-block",
                      padding: "3px 10px", borderRadius: 8,
                    }}>
                      {t(tx.pinLabel, lang)} {child.pin}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(child.id)}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(12,45,72,0.2)", cursor: "pointer",
                    fontSize: "1.2rem", padding: 8,
                  }}
                  title={t(tx.removeTitle, lang)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: 32, background: "#fff", borderRadius: 20,
          padding: "24px", boxShadow: "0 4px 16px rgba(12,45,72,0.04)",
        }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(12,45,72,0.35)", marginBottom: 12 }}>
            {t(tx.howItWorks, lang)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(46,139,192,0.08)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "0.75rem", color: "#2e8bc0", flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: "0.85rem", color: "rgba(12,45,72,0.6)", fontWeight: 600 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 20, backdropFilter: "blur(4px)",
        }} onClick={() => setShowModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 24, padding: "36px 32px",
              width: "100%", maxWidth: 400,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0c2d48", margin: "0 0 4px" }}>
              {t(tx.addChildTitle, lang)}
            </h3>
            <p style={{ color: "rgba(12,45,72,0.4)", fontSize: "0.8rem", fontWeight: 600, marginBottom: 24 }}>
              {t(tx.addChildSubtitle, lang)}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", color: "rgba(12,45,72,0.5)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
                  {t(tx.displayName, lang)}
                </label>
                <input
                  type="text"
                  placeholder={t(tx.displayNamePlaceholder, lang)}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  {t(tx.ageGroup, lang)}
                </label>
                <select
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
                    color: "#0c2d48", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
                    outline: "none", boxSizing: "border-box", cursor: "pointer",
                  }}
                >
                  <option value="8-12">{t(tx.ageExplorer, lang)}</option>
                  <option value="13-15">{t(tx.ageBuilder, lang)}</option>
                  <option value="16-18">{t(tx.ageStrategist, lang)}</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: "14px", borderRadius: 14,
                  background: "rgba(12,45,72,0.04)", border: "1.5px solid rgba(12,45,72,0.08)",
                  color: "rgba(12,45,72,0.5)", fontFamily: FONT,
                  fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
                }}
              >
                {t(tx.cancel, lang)}
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                style={{
                  flex: 2, padding: "14px", borderRadius: 14, border: "none",
                  background: newName.trim() ? "linear-gradient(135deg, #0c2d48, #145374)" : "rgba(12,45,72,0.08)",
                  color: newName.trim() ? "#fff" : "rgba(12,45,72,0.25)",
                  fontFamily: FONT, fontWeight: 900, fontSize: "0.85rem",
                  cursor: newName.trim() ? "pointer" : "default",
                }}
              >
                {creating ? t(tx.creating, lang) : t(tx.createProfile, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
