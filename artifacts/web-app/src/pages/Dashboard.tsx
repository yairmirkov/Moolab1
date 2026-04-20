import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { api } from "../api";
import { useLang, useLangSuffix, t, translations } from "../useLang";
import { GRADE_OPTIONS, getGradeOption, gradeLabel, gradeFromApiBucket, SKILL_LEVELS, type SkillLevel, nextGradeId, shouldPromptGradePromotion } from "../gradeMap";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const SMALL_FONT = "'Lato', system-ui, -apple-system, sans-serif";
const NAVY = "#0c2d48";
const NAVY_LIGHT = "#145374";
const ACCENT = "#2e8bc0";
const NAVY_SUBTLE = "rgba(12,45,72,0.05)";
const NAVY_BORDER = "rgba(12,45,72,0.08)";
const NAVY_MUTED = "rgba(12,45,72,0.45)";

interface ChildProfile {
  id: number;
  username: string;
  displayName: string;
  pin: string;
  ageGroup: string;
  grade?: string | null;
  skillLevel?: string | null;
  gradeUpdatedAt?: string | null;
  xp?: number;
  level?: number;
  streak?: number;
  bossWins?: number;
  moolies?: number;
  lessonsCompleted?: number;
  lastActiveAt?: string | null;
  createdAt?: string;
}

function fmtRelative(iso?: string | null, lang: string = "en"): string {
  if (!iso) return lang === "es" ? "Sin actividad" : "No activity yet";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return lang === "es" ? "Sin actividad" : "No activity yet";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === "es" ? "Ahora mismo" : "Just now";
  if (mins < 60) return lang === "es" ? `Hace ${mins}m` : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return lang === "es" ? `Hace ${hrs}h` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return lang === "es" ? `Hace ${days}d` : `${days}d ago`;
}

function ProgressRing({ value, size = 56, stroke = 5, color = ACCENT }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(12,45,72,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s ease" }} />
    </svg>
  );
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
  const [newGrade, setNewGrade] = useState("3");
  const [newSkill, setNewSkill] = useState<SkillLevel>("beginner");
  const [creating, setCreating] = useState(false);
  const [dismissedPromotes, setDismissedPromotes] = useState<Set<number>>(() => {
    try {
      const raw = sessionStorage.getItem("ws_dismissed_promotes");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });
  const [promoting, setPromoting] = useState<number | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "family" | "billing">("overview");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  useEffect(() => {
    if (!parent) {
      navigate(`/login${langSuffix}`);
      return;
    }
    const load = () => api.getChildren()
      .then((list) => {
        setChildren(list);
        if (list.length && selectedChildId == null) setSelectedChildId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingChildren(false));
    load();
    const handle = setInterval(load, 15000);
    return () => clearInterval(handle);
  }, [parent, navigate]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const child = await api.createChild(newName.trim(), getGradeOption(newGrade).apiBucket, newGrade, newSkill);
      setChildren((prev) => [...prev, child]);
      if (selectedChildId == null) setSelectedChildId(child.id);
      setShowModal(false);
      setNewName("");
      setNewGrade("3");
      setNewSkill("beginner");
    } catch (err: any) {
      alert(err.message || t(tx.failedCreate, lang));
    } finally {
      setCreating(false);
    }
  };

  const persistDismissed = (s: Set<number>) => {
    try { sessionStorage.setItem("ws_dismissed_promotes", JSON.stringify(Array.from(s))); } catch {}
  };

  const handlePromote = async (child: ChildProfile, action: "promote" | "stay") => {
    setPromoting(child.id);
    try {
      const targetGrade = action === "promote" ? (nextGradeId(child.grade || "3") || child.grade || "3") : (child.grade || "3");
      await api.updateChildGrade(child.id, targetGrade, (child.skillLevel as SkillLevel) || "beginner");
      const stamped = new Date().toISOString();
      setChildren((prev) => prev.map((c) => c.id === child.id ? { ...c, grade: targetGrade, gradeUpdatedAt: stamped } : c));
    } catch (err: any) {
      alert(err.message || "Failed to update grade");
    } finally {
      setPromoting(null);
    }
  };

  const dismissPromote = (id: number) => {
    setDismissedPromotes((prev) => {
      const next = new Set(prev); next.add(id); persistDismissed(next); return next;
    });
  };

  const promotesNeeded = children.filter((c) => shouldPromptGradePromotion(c) && !dismissedPromotes.has(c.id));

  const handleDelete = async (id: number) => {
    if (!confirm(t(tx.removeProfile, lang))) return;
    try {
      await api.deleteChild(id);
      setChildren((prev) => prev.filter((c) => c.id !== id));
      if (selectedChildId === id) setSelectedChildId(null);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigate(`/${langSuffix}`);
  };

  const totals = useMemo(() => {
    return children.reduce((acc, c) => ({
      xp: acc.xp + (c.xp || 0),
      moolies: acc.moolies + (c.moolies || 0),
      lessons: acc.lessons + (c.lessonsCompleted || 0),
      bossWins: acc.bossWins + (c.bossWins || 0),
      maxStreak: Math.max(acc.maxStreak, c.streak || 0),
    }), { xp: 0, moolies: 0, lessons: 0, bossWins: 0, maxStreak: 0 });
  }, [children]);

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];

  if (!parent) return null;

  const tabs = [
    { id: "overview" as const, label: lang === "es" ? "Resumen" : "Overview", icon: "📊" },
    { id: "progress" as const, label: lang === "es" ? "Progreso" : "Progress", icon: "📈" },
    { id: "family" as const, label: lang === "es" ? "Familia" : "Family", icon: "👨‍👩‍👧" },
    { id: "billing" as const, label: lang === "es" ? "Facturación" : "Billing", icon: "💳" },
  ];

  const StatCard = ({ label, value, sub, color = ACCENT }: { label: string; value: string | number; sub?: string; color?: string }) => (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "18px 18px",
      border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(12,45,72,0.04)",
    }}>
      <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_MUTED, textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 900, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.65rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 6 }}>{sub}</div>}
    </div>
  );

  const renderOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard label={lang === "es" ? "Niños activos" : "Active learners"} value={children.length} sub={lang === "es" ? "perfiles" : "profiles"} />
        <StatCard label={lang === "es" ? "XP total" : "Total XP"} value={totals.xp.toLocaleString()} sub={lang === "es" ? "ganado" : "earned"} color={NAVY} />
        <StatCard label={lang === "es" ? "Lecciones" : "Lessons"} value={totals.lessons} sub={lang === "es" ? "completadas" : "completed"} color={NAVY_LIGHT} />
        <StatCard label={lang === "es" ? "Mejor racha" : "Best streak"} value={`${totals.maxStreak}🔥`} sub={lang === "es" ? "días" : "days"} color="#FF6B6B" />
        <StatCard label={lang === "es" ? "Victorias Jefe" : "Boss wins"} value={totals.bossWins} sub={lang === "es" ? "desafíos" : "challenges"} color="#FFD93D" />
        <StatCard label={lang === "es" ? "Moolies" : "Moolies"} value={totals.moolies.toLocaleString()} sub={lang === "es" ? "ganados" : "earned"} color="#FFA500" />
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, padding: "22px 22px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(12,45,72,0.04)",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_MUTED, marginBottom: 14, textTransform: "uppercase" }}>
          {lang === "es" ? "Actividad reciente" : "Recent activity"}
        </div>
        {children.length === 0 ? (
          <div style={{ color: NAVY_MUTED, fontSize: "0.8rem", fontWeight: 600, padding: "16px 0", textAlign: "center" }}>
            {lang === "es" ? "Agrega un perfil de hijo para ver actividad." : "Add a child profile to see activity."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[...children]
              .sort((a, b) => new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime())
              .slice(0, 5)
              .map((c, i, arr) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                borderBottom: i < arr.length - 1 ? `1px solid ${NAVY_BORDER}` : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, ${ACCENT}, #b1d4e0)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, color: NAVY, fontSize: "0.85rem",
                }}>{c.displayName.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: NAVY }}>{c.displayName}</div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 2 }}>
                    {lang === "es" ? "Nivel" : "Lvl"} {c.level || 1} · {(c.xp || 0).toLocaleString()} XP · {fmtRelative(c.lastActiveAt, lang)}
                  </div>
                </div>
                <div style={{
                  padding: "5px 10px", borderRadius: 8,
                  background: NAVY_SUBTLE, fontSize: "0.65rem", fontWeight: 800, color: NAVY,
                }}>
                  {(c.streak || 0)}🔥
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {children.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "40px 20px", textAlign: "center",
          border: `1px dashed ${NAVY_BORDER}`,
        }}>
          <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>📈</div>
          <div style={{ color: NAVY_MUTED, fontSize: "0.85rem", fontWeight: 700 }}>
            {lang === "es" ? "Aún no hay datos de progreso." : "No progress data yet."}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
            {children.map((c) => (
              <button key={c.id} onClick={() => setSelectedChildId(c.id)} style={{
                padding: "10px 16px", borderRadius: 12, border: "none",
                background: selectedChildId === c.id ? NAVY : NAVY_SUBTLE,
                color: selectedChildId === c.id ? "#fff" : NAVY,
                fontWeight: 800, fontSize: "0.78rem", fontFamily: FONT, cursor: "pointer",
                whiteSpace: "nowrap",
              }}>
                {c.displayName}
              </button>
            ))}
          </div>

          {selectedChild && (() => {
            const child = selectedChild;
            const lvl = child.level || 1;
            const xp = child.xp || 0;
            const xpInLevel = xp % (lvl * 50);
            const xpNeeded = lvl * 50;
            const xpPct = Math.min((xpInLevel / xpNeeded) * 100, 100);
            return (
              <>
                <div style={{
                  background: "#fff", borderRadius: 16, padding: "22px",
                  border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(12,45,72,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_MUTED, textTransform: "uppercase", marginBottom: 4 }}>
                        {lang === "es" ? "Nivel actual" : "Current level"}
                      </div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 900, color: NAVY, letterSpacing: "-0.02em" }}>
                        {lang === "es" ? "Nivel" : "Level"} {lvl}
                      </div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 2 }}>
                        {xpInLevel}/{xpNeeded} XP {lang === "es" ? "para Nivel" : "to Level"} {lvl + 1}
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <ProgressRing value={xpPct} size={70} stroke={6} />
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.85rem", fontWeight: 900, color: NAVY,
                      }}>{Math.round(xpPct)}%</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: lang === "es" ? "Racha" : "Streak", value: `${child.streak || 0}🔥` },
                      { label: lang === "es" ? "Jefes" : "Boss", value: child.bossWins || 0 },
                      { label: "Moolies", value: (child.moolies || 0).toLocaleString() },
                    ].map((m) => (
                      <div key={m.label} style={{
                        background: NAVY_SUBTLE, padding: "12px 8px", borderRadius: 10, textAlign: "center",
                      }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 900, color: NAVY }}>{m.value}</div>
                        <div style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em", color: NAVY_MUTED, marginTop: 4, textTransform: "uppercase" }}>
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: "#fff", borderRadius: 16, padding: "22px",
                  border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(12,45,72,0.04)",
                }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_MUTED, marginBottom: 14, textTransform: "uppercase" }}>
                    {lang === "es" ? "Lecciones completadas" : "Lessons completed"}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: NAVY, letterSpacing: "-0.02em" }}>
                    {child.lessonsCompleted || 0}
                  </div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 4 }}>
                    {lang === "es" ? "Última actividad: " : "Last active: "}{fmtRelative(child.lastActiveAt, lang)}
                  </div>
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: lang === "es" ? "Apetito de riesgo" : "Risk appetite", v: Math.min(100, 40 + (child.bossWins || 0) * 8) },
                      { label: lang === "es" ? "Mecánica de mercado" : "Market mechanics", v: Math.min(100, 30 + (child.lessonsCompleted || 0) * 5) },
                      { label: lang === "es" ? "Gestión de activos" : "Asset management", v: Math.min(100, 25 + Math.floor((child.moolies || 0) / 50)) },
                    ].map((m) => (
                      <div key={m.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: NAVY }}>{m.label}</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: NAVY }}>{m.v}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: NAVY_SUBTLE, overflow: "hidden" }}>
                          <div style={{ width: `${m.v}%`, height: "100%", background: `linear-gradient(90deg, ${ACCENT}, ${NAVY_LIGHT})` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );

  const renderFamily = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 900, color: NAVY, margin: 0 }}>
          {t(tx.childProfiles, lang)}
        </h2>
        <button onClick={() => setShowModal(true)} style={{
          background: `linear-gradient(135deg, ${ACCENT}, #b1d4e0)`, border: "none",
          color: NAVY, fontFamily: FONT, fontWeight: 900, fontSize: "0.75rem",
          padding: "9px 16px", borderRadius: 12, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(46,139,192,0.2)",
        }}>{t(tx.addChild, lang)}</button>
      </div>

      {promotesNeeded.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {promotesNeeded.map((c) => {
            const next = nextGradeId(c.grade || "3");
            return (
              <div key={`promote-${c.id}`} style={{
                background: "linear-gradient(135deg, rgba(255,200,87,0.18), rgba(255,149,0,0.08))",
                border: "1.5px solid rgba(255,149,0,0.35)", borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}>
                <div style={{ fontSize: "1.3rem" }}>🎒</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 900, fontSize: "0.85rem", color: NAVY }}>
                    {lang === "es" ? `Nuevo año escolar para ${c.displayName}` : `New school year for ${c.displayName}`}
                  </div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 2 }}>
                    {lang === "es"
                      ? `Actualmente en ${gradeLabel(c.grade || "3", lang)}. ¿Avanzar a ${next ? gradeLabel(next, lang) : gradeLabel(c.grade || "3", lang)}?`
                      : `Currently in ${gradeLabel(c.grade || "3", lang)}. Promote to ${next ? gradeLabel(next, lang) : gradeLabel(c.grade || "3", lang)}?`}
                  </div>
                </div>
                {next && (
                  <button disabled={promoting === c.id} onClick={() => handlePromote(c, "promote")} style={{
                    background: "#ff9500", border: "none", color: "#fff", fontFamily: FONT, fontWeight: 900,
                    fontSize: "0.7rem", padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                    opacity: promoting === c.id ? 0.6 : 1,
                  }}>{lang === "es" ? "Avanzar" : "Promote"}</button>
                )}
                <button disabled={promoting === c.id} onClick={() => handlePromote(c, "stay")} style={{
                  background: "#fff", border: `1.5px solid ${NAVY_BORDER}`, color: NAVY, fontFamily: FONT,
                  fontWeight: 800, fontSize: "0.7rem", padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                  opacity: promoting === c.id ? 0.6 : 1,
                }}>{lang === "es" ? "Mantener" : "Keep same"}</button>
                <button onClick={() => dismissPromote(c.id)} title={lang === "es" ? "Recordar luego" : "Remind later"} style={{
                  background: "none", border: "none", color: "rgba(12,45,72,0.4)", cursor: "pointer", fontSize: "1rem", padding: 4,
                }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {loadingChildren ? (
        <div style={{ textAlign: "center", color: NAVY_MUTED, padding: 40, fontWeight: 600 }}>
          {t(tx.loadingProfiles, lang)}
        </div>
      ) : children.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "#fff", borderRadius: 16, border: `2px dashed ${NAVY_BORDER}`,
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>👨‍👧‍👦</div>
          <p style={{ color: NAVY_MUTED, fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>
            {t(tx.noProfiles, lang)}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {children.map((child) => (
            <div key={child.id} style={{
              background: "#fff", borderRadius: 16, padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(12,45,72,0.04)", border: `1px solid ${NAVY_BORDER}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: `linear-gradient(135deg, ${ACCENT}, #b1d4e0)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.3rem", fontWeight: 900, color: NAVY,
                }}>{child.displayName.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: "0.95rem", color: NAVY }}>{child.displayName}</div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 2 }}>
                    @{child.username} · {t(tx.ageGroupLabel, lang)} {gradeLabel(child.grade || gradeFromApiBucket(child.ageGroup), lang)}
                  </div>
                  <div style={{ display: "inline-flex", marginTop: 5, padding: "3px 8px", borderRadius: 6,
                    background: child.skillLevel === "expert" ? "rgba(255,149,0,0.12)" : child.skillLevel === "intermediate" ? "rgba(46,139,192,0.12)" : "rgba(57,255,20,0.12)",
                    fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: child.skillLevel === "expert" ? "#ff9500" : child.skillLevel === "intermediate" ? ACCENT : "#1f9b00",
                  }}>
                    {(SKILL_LEVELS.find((s) => s.id === (child.skillLevel || "beginner")) || SKILL_LEVELS[0])[lang === "es" ? "labelEs" : "labelEn"]}
                  </div>
                </div>
                <div style={{
                  padding: "6px 11px", borderRadius: 8,
                  background: NAVY_SUBTLE, textAlign: "center",
                }}>
                  <div style={{ fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_MUTED }}>{t(tx.pinLabel, lang)}</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 900, color: NAVY, fontFamily: "monospace", letterSpacing: "0.12em" }}>{child.pin}</div>
                </div>
                <button onClick={() => handleDelete(child.id)} title={t(tx.removeTitle, lang)} style={{
                  background: "none", border: "none", color: "rgba(12,45,72,0.25)",
                  cursor: "pointer", fontSize: "1.1rem", padding: 6,
                }}>✕</button>
              </div>

              <div style={{
                marginTop: 14, paddingTop: 14, borderTop: `1px solid ${NAVY_BORDER}`,
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
              }}>
                {[
                  { l: lang === "es" ? "Nvl" : "Lvl", v: child.level || 1 },
                  { l: "XP", v: (child.xp || 0).toLocaleString() },
                  { l: lang === "es" ? "Racha" : "Streak", v: `${child.streak || 0}🔥` },
                  { l: "Moolies", v: (child.moolies || 0).toLocaleString() },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 900, color: NAVY }}>{m.v}</div>
                    <div style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em", color: NAVY_MUTED, marginTop: 2, textTransform: "uppercase" }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "0.62rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 8, textAlign: "right" }}>
                {fmtRelative(child.lastActiveAt, lang)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: "#fff", borderRadius: 16, padding: "20px 22px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(12,45,72,0.04)",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_MUTED, marginBottom: 12, textTransform: "uppercase" }}>
          {t(tx.howItWorks, lang)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[t(tx.step1, lang), t(tx.step2, lang), t(tx.step3, lang), t(tx.step4, lang)].map((text, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: "rgba(46,139,192,0.1)", color: ACCENT,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: "0.7rem",
              }}>{i + 1}</div>
              <span style={{ fontSize: "0.78rem", color: NAVY, fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`,
        borderRadius: 18, padding: "26px 24px", color: "#fff",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(177,212,224,0.6)", marginBottom: 8 }}>
          {t(tx.subscription, lang)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: 4 }}>
              Moolab {parent.subscriptionStatus === "free" ? t(tx.freePlan, lang) : t(tx.apexPlan, lang)} {t(tx.plan, lang)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(177,212,224,0.75)", fontWeight: 600 }}>
              {parent.subscriptionStatus === "free" ? t(tx.upgradeMsg, lang) : t(tx.paidMsg, lang)}
            </div>
          </div>
          {parent.subscriptionStatus !== "free" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>$19.99</div>
              <div style={{ fontSize: "0.55rem", opacity: 0.6 }}>/{lang === "es" ? "mes" : "mo"}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, padding: "22px",
        border: `1px solid ${NAVY_BORDER}`,
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_MUTED, marginBottom: 14, textTransform: "uppercase" }}>
          {lang === "es" ? "Características incluidas" : "Plan features"}
        </div>
        {[
          lang === "es" ? "Currículo financiero completo" : "Full financial curriculum",
          lang === "es" ? "Hasta 5 perfiles de hijos" : "Up to 5 child profiles",
          lang === "es" ? "Análisis de progreso en tiempo real" : "Realtime progress insights",
          lang === "es" ? "Voz IA y juegos interactivos" : "AI voice & interactive games",
        ].map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, background: NAVY_SUBTLE,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: ACCENT, fontWeight: 900, fontSize: "0.6rem",
            }}>✓</div>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: NAVY }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f7fb 0%, #e8f1f8 100%)",
      fontFamily: FONT, padding: "0 0 40px",
    }}>
      <div style={{
        background: "#fff", padding: "16px 22px",
        borderBottom: `1px solid ${NAVY_BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 5,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <img src={`${import.meta.env.BASE_URL}moolab-logo-trimmed.png`} alt="Moolab" style={{ height: 32 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: NAVY, letterSpacing: "-0.01em" }}>
              {t(tx.title, lang)}
            </div>
            <div style={{ fontSize: "0.65rem", color: NAVY_MUTED, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {parent.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background: "none", border: `1.5px solid ${NAVY_BORDER}`,
          color: NAVY_MUTED, fontFamily: FONT, fontWeight: 700,
          fontSize: "0.7rem", padding: "7px 14px", borderRadius: 10,
          cursor: "pointer", flexShrink: 0,
        }}>{t(tx.signOut, lang)}</button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 18px" }}>
        <div style={{
          display: "flex", gap: 6, marginBottom: 22,
          background: "#fff", padding: 6, borderRadius: 14,
          border: `1px solid ${NAVY_BORDER}`,
          overflowX: "auto",
        }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, minWidth: 80, padding: "10px 12px", borderRadius: 10, border: "none",
              background: activeTab === tab.id ? NAVY : "transparent",
              color: activeTab === tab.id ? "#fff" : NAVY_MUTED,
              fontFamily: FONT, fontWeight: 800, fontSize: "0.72rem",
              cursor: "pointer", letterSpacing: "0.02em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "progress" && renderProgress()}
        {activeTab === "family" && renderFamily()}
        {activeTab === "billing" && renderBilling()}
      </div>

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 20, backdropFilter: "blur(4px)",
        }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 22, padding: "32px 28px",
            width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: NAVY, margin: "0 0 4px" }}>
              {t(tx.addChildTitle, lang)}
            </h3>
            <p style={{ color: NAVY_MUTED, fontSize: "0.78rem", fontWeight: 600, marginBottom: 22 }}>
              {t(tx.addChildSubtitle, lang)}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", color: NAVY_MUTED, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
                  {t(tx.displayName, lang)}
                </label>
                <input type="text" placeholder={t(tx.displayNamePlaceholder, lang)}
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: "100%", padding: "13px 16px", borderRadius: 12,
                    background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
                    color: NAVY, fontFamily: FONT, fontWeight: 700, fontSize: "0.9rem",
                    outline: "none", boxSizing: "border-box",
                  }} />
              </div>
              <div>
                <label style={{ display: "block", color: NAVY_MUTED, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
                  {t(tx.ageGroup, lang)}
                </label>
                <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)} style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12,
                  background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
                  color: NAVY, fontFamily: FONT, fontWeight: 700, fontSize: "0.9rem",
                  outline: "none", boxSizing: "border-box", cursor: "pointer",
                }}>
                  <optgroup label={t(tx.gradeGroupSchool, lang)}>
                    {GRADE_OPTIONS.filter((g) => g.id !== "college" && g.id !== "adult").map((g) => (
                      <option key={g.id} value={g.id}>{gradeLabel(g.id, lang)}</option>
                    ))}
                  </optgroup>
                  <optgroup label={t(tx.gradeGroupHigherEd, lang)}>
                    {GRADE_OPTIONS.filter((g) => g.id === "college" || g.id === "adult").map((g) => (
                      <option key={g.id} value={g.id}>{gradeLabel(g.id, lang)}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: NAVY_MUTED, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 4 }}>
                  {lang === "es" ? "NIVEL DE HABILIDAD INICIAL" : "STARTING SKILL LEVEL"}
                </label>
                <select value={newSkill} onChange={(e) => setNewSkill(e.target.value as SkillLevel)} style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12,
                  background: "rgba(177,212,224,0.12)", border: "1.5px solid rgba(46,139,192,0.15)",
                  color: NAVY, fontFamily: FONT, fontWeight: 700, fontSize: "0.9rem",
                  outline: "none", boxSizing: "border-box", cursor: "pointer",
                }}>
                  {SKILL_LEVELS.map((s) => (
                    <option key={s.id} value={s.id}>{lang === "es" ? s.labelEs : s.labelEn}</option>
                  ))}
                </select>
                <div style={{ fontSize: "0.62rem", fontWeight: 600, color: NAVY_MUTED, marginTop: 6, paddingLeft: 4, lineHeight: 1.35 }}>
                  {lang === "es"
                    ? "La mayoría empieza como Principiante. Elige más alto solo si tu hijo ya conoce lo básico de finanzas."
                    : "Most kids start as Beginner. Pick higher only if your child already knows financial basics."}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "13px", borderRadius: 12,
                background: NAVY_SUBTLE, border: `1.5px solid ${NAVY_BORDER}`,
                color: NAVY_MUTED, fontFamily: FONT, fontWeight: 800, fontSize: "0.82rem", cursor: "pointer",
              }}>{t(tx.cancel, lang)}</button>
              <button onClick={handleCreate} disabled={!newName.trim() || creating} style={{
                flex: 2, padding: "13px", borderRadius: 12, border: "none",
                background: newName.trim() ? `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` : "rgba(12,45,72,0.08)",
                color: newName.trim() ? "#fff" : "rgba(12,45,72,0.25)",
                fontFamily: FONT, fontWeight: 900, fontSize: "0.82rem",
                cursor: newName.trim() ? "pointer" : "default",
              }}>{creating ? t(tx.creating, lang) : t(tx.createProfile, lang)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
