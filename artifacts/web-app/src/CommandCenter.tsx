import { useState } from "react";
import translations from "./translations";
import type { Lang } from "./translations";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const SMALL_FONT = "'Lato', system-ui, -apple-system, sans-serif";
const NAVY = "#001F5B";
const NAVY_LIGHT = "#003D99";
const NAVY_SUBTLE = "rgba(0,31,91,0.06)";
const NAVY_BORDER = "rgba(0,31,91,0.1)";
const NAVY_TEXT_MUTED = "rgba(0,31,91,0.45)";

interface Student {
  nickname: string;
  pin: string;
  birthYear: string;
  country?: string;
}

interface FamilyState {
  parent?: string;
  students?: Student[];
}

interface ModuleInfo {
  id: string;
  icon: string;
  name: string;
  topic: string;
  winsNeeded: number;
  level?: "beginner" | "intermediate" | "expert";
}

interface CommandCenterProps {
  lang: Lang;
  parentName: string;
  familyState: FamilyState;
  modules: ModuleInfo[];
  moduleProgress: Record<string, number>;
  currentModuleIdx: number;
  xp: number;
  level: number;
  streak: number;
  bossWins: number;
  userName: string;
  onLogout: () => void;
  onCreateStudent: () => void;
  onLangToggle?: () => void;
}

const MOCK_QUIZ_RESULTS = [
  { date: "2026-04-05", subject: "Compound Leverage", score: 95, status: "shark" },
  { date: "2026-04-04", subject: "Credit Hacking", score: 88, status: "shark" },
  { date: "2026-04-03", subject: "Macro-Economics", score: 72, status: "review" },
  { date: "2026-04-02", subject: "Asset Allocation", score: 91, status: "shark" },
  { date: "2026-04-01", subject: "Tax Strategy", score: 65, status: "review" },
  { date: "2026-03-31", subject: "DeFi Fundamentals", score: 84, status: "shark" },
];

const MOCK_RADAR = [
  { label: "Risk Appetite", value: 78 },
  { label: "Market Mechanics", value: 85 },
  { label: "Asset Management", value: 62 },
];

const t = translations;

function getAgeFromYear(y: string) {
  return new Date().getFullYear() - parseInt(y || "2010");
}

function getAgeBracket(age: number) {
  if (age <= 12) return "8–12 Explorer";
  if (age <= 17) return "13–17 Builder";
  return "18–21 Strategist";
}

function getAgeBracketES(age: number) {
  if (age <= 12) return "8–12 Explorador";
  if (age <= 17) return "13–17 Constructor";
  return "18–21 Estratega";
}

function ProgressCircle({ value, size = 72, strokeWidth = 5, color = NAVY }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,31,91,0.08)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

export default function CommandCenter({
  lang, parentName, familyState, modules, moduleProgress, currentModuleIdx,
  xp, level, streak, bossWins, userName, onLogout, onCreateStudent, onLangToggle,
}: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [t.cc.tabOverview[lang], t.cc.tabLabProgress[lang], t.cc.tabFamilyUsers[lang], t.cc.tabBilling[lang]];
  const totalModulesComplete = modules.filter((mod) => (moduleProgress[mod.id] || 0) >= mod.winsNeeded).length;
  const overallPct = modules.length > 0 ? Math.round((totalModulesComplete / modules.length) * 100) : 0;
  const students = familyState.students || [];

  const getMasteryLabel = () => {
    if (level >= 10) return t.cc.masteryCompoundLeverage[lang];
    if (level >= 7) return t.cc.masteryUnderstanding[lang];
    if (level >= 4) return t.cc.masteryMarket[lang];
    return t.cc.masteryFoundations[lang];
  };

  const renderOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 28px 24px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(0,31,91,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 6, textTransform: "uppercase" }}>
              {t.cc.financialSummary[lang]}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: NAVY, letterSpacing: "-0.02em" }}>
              {userName || t.cc.learner[lang]}
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 500, color: NAVY_TEXT_MUTED, marginTop: 2 }}>
              {modules[currentModuleIdx]?.name || "—"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <ProgressCircle value={overallPct} size={68} />
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(0deg)",
                fontSize: "0.85rem", fontWeight: 900, color: NAVY,
              }}>{overallPct}%</div>
            </div>
            <div style={{ fontSize: "0.5rem", fontWeight: 700, color: NAVY_TEXT_MUTED, letterSpacing: "0.1em", marginTop: 4 }}>
              {t.cc.progress[lang]}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: NAVY }}>{t.cc.currentModuleProgress[lang]}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 600, color: NAVY_TEXT_MUTED }}>
              {moduleProgress[modules[currentModuleIdx]?.id || ""] || 0}/{modules[currentModuleIdx]?.winsNeeded || 3}
            </span>
          </div>
          <div style={{ width: "100%", height: 8, borderRadius: 4, background: NAVY_SUBTLE }}>
            <div style={{
              width: `${Math.min(((moduleProgress[modules[currentModuleIdx]?.id || ""] || 0) / (modules[currentModuleIdx]?.winsNeeded || 3)) * 100, 100)}%`,
              height: "100%", borderRadius: 4,
              background: `linear-gradient(90deg, ${NAVY}, ${NAVY_LIGHT})`,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            {
              label: t.cc.activeStreak[lang],
              value: `${streak} ${t.cc.days[lang]}`,
              sub: t.cc.marketFocus[lang],
            },
            {
              label: "M-XP",
              value: `${xp.toLocaleString()} XP`,
              sub: t.cc.earnedXp[lang],
            },
            {
              label: t.cc.masteryLevel[lang],
              value: `${t.cc.levelWord[lang]} ${level}`,
              sub: getMasteryLabel(),
            },
          ].map((metric) => (
            <div key={metric.label} style={{
              padding: "18px 14px", borderRadius: 12,
              background: NAVY_SUBTLE, textAlign: "center",
            }}>
              <div style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_TEXT_MUTED, marginBottom: 8, textTransform: "uppercase" }}>
                {metric.label}
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: 900, color: NAVY, marginBottom: 4, letterSpacing: "-0.01em" }}>
                {metric.value}
              </div>
              <div style={{ fontSize: "0.55rem", fontWeight: 500, color: NAVY_TEXT_MUTED, lineHeight: 1.3 }}>
                {metric.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px 28px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(0,31,91,0.04)",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 16, textTransform: "uppercase" }}>
          {t.cc.moduleProgress[lang]}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {modules.map((mod, idx) => {
            const wins = moduleProgress[mod.id] || 0;
            const done = wins >= mod.winsNeeded;
            const isActive = idx === currentModuleIdx && !done;
            const pct = Math.round((wins / mod.winsNeeded) * 100);
            return (
              <div key={mod.id} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 0",
                borderBottom: idx < modules.length - 1 ? `1px solid ${NAVY_BORDER}` : "none",
              }}>
                <div style={{ fontSize: "1.1rem", width: 28, textAlign: "center" }}>{mod.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.75rem", color: done ? NAVY_LIGHT : isActive ? NAVY : NAVY_TEXT_MUTED }}>
                      {mod.name}
                    </span>
                    <span style={{
                      fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.08em",
                      padding: "3px 8px", borderRadius: 6,
                      background: done ? NAVY : isActive ? "rgba(0,61,153,0.08)" : "transparent",
                      color: done ? "#fff" : isActive ? NAVY_LIGHT : NAVY_TEXT_MUTED,
                    }}>
                      {done ? (t.cc.complete[lang]) : isActive ? (t.cc.active[lang]) : `${wins}/${mod.winsNeeded}`}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: NAVY_SUBTLE }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 2,
                      background: done ? NAVY : isActive ? NAVY_LIGHT : "rgba(0,31,91,0.12)",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderLabProgress = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px 28px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(0,31,91,0.04)",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 18, textTransform: "uppercase" }}>
          {t.cc.recentQuizResults[lang]}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 2fr 0.7fr 1fr",
          padding: "0 0 10px", borderBottom: `1px solid ${NAVY_BORDER}`,
          gap: 8,
        }}>
          {[
            t.cc.date[lang],
            t.cc.subject[lang],
            t.cc.score[lang],
            t.cc.status[lang],
          ].map((h) => (
            <div key={h} style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.12em", color: NAVY_TEXT_MUTED, textTransform: "uppercase" }}>
              {h}
            </div>
          ))}
        </div>

        {MOCK_QUIZ_RESULTS.map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 2fr 0.7fr 1fr",
            padding: "14px 0", borderBottom: i < MOCK_QUIZ_RESULTS.length - 1 ? `1px solid rgba(0,31,91,0.05)` : "none",
            gap: 8, alignItems: "center",
          }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 500, color: NAVY_TEXT_MUTED }}>{row.date}</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: NAVY }}>{row.subject}</div>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: row.score >= 80 ? NAVY : "#c0392b" }}>{row.score}%</div>
            <div>
              <span style={{
                display: "inline-block", padding: "4px 10px", borderRadius: 6,
                fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                background: row.status === "shark" ? NAVY : "rgba(192,57,43,0.08)",
                color: row.status === "shark" ? "#fff" : "#c0392b",
              }}>
                {row.status === "shark"
                  ? (t.cc.sharkLevel[lang])
                  : (t.cc.needsReview[lang])}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px 28px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(0,31,91,0.04)",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 20, textTransform: "uppercase" }}>
          {t.cc.competencyBreakdown[lang]}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {MOCK_RADAR.map((cat) => (
            <div key={cat.label} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
                <ProgressCircle value={cat.value} size={80} strokeWidth={6} color={NAVY_LIGHT} />
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(0deg)",
                  fontSize: "0.95rem", fontWeight: 900, color: NAVY,
                }}>{cat.value}%</div>
              </div>
              <div style={{ fontSize: "0.6rem", fontWeight: 700, color: NAVY, lineHeight: 1.3 }}>
                {cat.label === "Risk Appetite" ? t.cc.riskAppetite[lang]
                  : cat.label === "Market Mechanics" ? t.cc.marketMechanics[lang]
                  : t.cc.assetManagement[lang]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFamilyUsers = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px 28px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(0,31,91,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 4, textTransform: "uppercase" }}>
              {t.cc.subAccounts[lang]}
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: 500, color: NAVY_TEXT_MUTED }}>
              {students.length} {t.cc.studentsRegistered[lang]}
            </div>
          </div>
        </div>

        {students.length === 0 ? (
          <div style={{
            padding: "40px 20px", textAlign: "center",
            border: `2px dashed ${NAVY_BORDER}`, borderRadius: 12,
          }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: NAVY_TEXT_MUTED, marginBottom: 4 }}>
              {t.cc.noStudentsYet[lang]}
            </div>
            <div style={{ fontSize: "0.65rem", fontWeight: 500, color: NAVY_TEXT_MUTED }}>
              {t.cc.createAccountToStart[lang]}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {students.map((student, i) => {
              const age = getAgeFromYear(student.birthYear);
              const bracket = lang === "es" ? getAgeBracketES(age) : getAgeBracket(age);
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "18px 0",
                  borderBottom: i < students.length - 1 ? `1px solid ${NAVY_BORDER}` : "none",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: NAVY, display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "1rem", fontWeight: 900,
                  }}>
                    {student.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: NAVY, letterSpacing: "-0.01em" }}>{student.nickname}</div>
                    <div style={{ fontSize: "0.6rem", fontWeight: 500, color: NAVY_TEXT_MUTED, marginTop: 2 }}>
                      {bracket} {student.country ? `· ${student.country}` : ""}
                    </div>
                  </div>
                  <div style={{
                    padding: "8px 14px", borderRadius: 8,
                    background: NAVY_SUBTLE, textAlign: "center",
                  }}>
                    <div style={{ fontSize: "0.45rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 2 }}>
                      {t.cc.labPin[lang]}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 900, color: NAVY, letterSpacing: "0.15em", fontFamily: "monospace" }}>
                      {student.pin}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={onCreateStudent}
        style={{
          width: "100%", padding: "16px 20px", borderRadius: 12,
          background: NAVY, border: "none", color: "#fff",
          fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em",
          cursor: "pointer", fontFamily: FONT,
          transition: "all 0.2s ease",
          boxShadow: "0 2px 8px rgba(0,31,91,0.2)",
        }}
        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = NAVY_LIGHT; }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = NAVY; }}
      >
        {t.cc.provisionStudent[lang]}
      </button>
    </div>
  );

  const renderBilling = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 28px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(0,31,91,0.04)",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 20, textTransform: "uppercase" }}>
          {t.cc.activePlan[lang]}
        </div>

        <div style={{
          padding: "24px", borderRadius: 12,
          background: NAVY, color: "#fff", marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>Moolab Apex Plan</div>
              <div style={{ fontSize: "0.65rem", fontWeight: 500, opacity: 0.6 }}>
                {t.cc.billingMonthly[lang]}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>$19.99</div>
              <div style={{ fontSize: "0.55rem", fontWeight: 500, opacity: 0.5 }}>/{t.cc.perMonth[lang]}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: t.cc.fullCurriculum[lang], check: true },
            { label: t.cc.upTo5[lang], check: true },
            { label: t.cc.realtimeInsights[lang], check: true },
            { label: t.cc.aiVoice[lang], check: true },
          ].map((feature) => (
            <div key={feature.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, background: NAVY_SUBTLE,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: NAVY, fontSize: "0.6rem", fontWeight: 900,
              }}>✓</div>
              <span style={{ fontSize: "0.72rem", fontWeight: 500, color: NAVY }}>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px 28px",
        border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 1px 3px rgba(0,31,91,0.04)",
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: NAVY_TEXT_MUTED, marginBottom: 16, textTransform: "uppercase" }}>
          {t.cc.paymentMethod[lang]}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
          borderRadius: 10, border: `1px solid ${NAVY_BORDER}`, marginBottom: 16,
        }}>
          <div style={{
            width: 40, height: 26, borderRadius: 4, background: NAVY,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "0.5rem", fontWeight: 900, letterSpacing: "0.05em",
          }}>VISA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: NAVY }}>•••• •••• •••• 4242</div>
            <div style={{ fontSize: "0.55rem", fontWeight: 500, color: NAVY_TEXT_MUTED }}>
              {t.cc.expires[lang]}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button style={{
            padding: "12px 16px", borderRadius: 10,
            background: NAVY_SUBTLE, border: `1px solid ${NAVY_BORDER}`,
            color: NAVY, fontSize: "0.68rem", fontWeight: 700,
            cursor: "pointer", fontFamily: FONT,
          }}>
            {t.cc.updatePayment[lang]}
          </button>
          <button style={{
            padding: "12px 16px", borderRadius: 10,
            background: NAVY_SUBTLE, border: `1px solid ${NAVY_BORDER}`,
            color: NAVY, fontSize: "0.68rem", fontWeight: 700,
            cursor: "pointer", fontFamily: FONT,
          }}>
            {t.cc.viewInvoices[lang]}
          </button>
        </div>
      </div>
    </div>
  );

  const tabContent = [renderOverview, renderLabProgress, renderFamilyUsers, renderBilling];

  return (
    <div style={{
      width: "100vw", minHeight: "100dvh",
      background: "#F8F9FB", color: NAVY, fontFamily: FONT,
    }}>
      <style>{`
        @keyframes ccFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .cc-animate { animation: ccFadeIn 0.35s ease-out both; }
      `}</style>

      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#fff", borderBottom: `1px solid ${NAVY_BORDER}`,
        padding: "16px clamp(24px, 4vw, 60px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.18em", color: NAVY_TEXT_MUTED, marginBottom: 2, textTransform: "uppercase" }}>
              {t.cc.commandCenter[lang]}
            </div>
            <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: NAVY, letterSpacing: "-0.02em" }}>
              {t.cc.welcome[lang]}, {parentName || (t.cc.familyOffice[lang])}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {onLangToggle && (
              <button
                onClick={onLangToggle}
                style={{
                  background: "#fff", border: `1px solid ${NAVY_BORDER}`,
                  borderRadius: 8, padding: "8px 12px", color: NAVY,
                  fontFamily: FONT, fontWeight: 800, fontSize: "0.6rem", cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                {lang === "en" ? "ES" : "EN"}
              </button>
            )}
            <button
              onClick={onLogout}
              style={{
                background: "#fff", border: `1px solid ${NAVY_BORDER}`,
                borderRadius: 8, padding: "8px 16px", color: NAVY_TEXT_MUTED,
                fontFamily: FONT, fontWeight: 700, fontSize: "0.6rem", cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              {t.cc.secureLogout[lang]}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: activeTab === i ? NAVY : "transparent",
                color: activeTab === i ? "#fff" : NAVY_TEXT_MUTED,
                fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
                fontFamily: FONT, transition: "all 0.2s ease",
                letterSpacing: "0.02em",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="cc-animate" key={activeTab} style={{ padding: "24px clamp(24px, 4vw, 60px)", maxWidth: 960, margin: "0 auto" }}>
        {tabContent[activeTab]()}
      </div>

      <div style={{ padding: "20px 24px 40px", textAlign: "center" }}>
        <div style={{ color: NAVY_TEXT_MUTED, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.05em" }}>
          Moolab · {t.cc.parentDashboard[lang]} · {t.cc.encryptedData[lang]}
        </div>
      </div>
    </div>
  );
}
