import { useState, useEffect } from "react";
import { api } from "../api";
import { gradeLabel } from "../gradeMap";

const FONT = "'Bricolage Grotesque', 'Lato', system-ui, -apple-system, sans-serif";
const NAVY = "#0c2d48";

type TabId = "overview" | "parents" | "students" | "messages";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "parents", label: "Parents", icon: "👤" },
  { id: "students", label: "Students", icon: "🦈" },
  { id: "messages", label: "Messages", icon: "✉️" },
];

const ADMIN_PASSWORD = "moolab-admin-2024";

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isToday(d: string | null | undefined): boolean {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "12px 16px", color: "rgba(12,45,72,0.45)",
  fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em",
  borderBottom: "1.5px solid rgba(12,45,72,0.08)", whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px", color: NAVY, fontSize: "0.85rem", fontWeight: 600,
  borderBottom: "1px solid rgba(12,45,72,0.05)",
};

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("ml_admin") === "1");
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState<TabId>("overview");
  const [parents, setParents] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([
      api.adminGetParents().catch(() => []),
      api.adminGetChildren().catch(() => []),
      api.adminGetMessages().catch(() => []),
    ]).then(([p, c, m]) => {
      setParents(Array.isArray(p) ? p : []);
      setChildren(Array.isArray(c) ? c : []);
      setMessages(Array.isArray(m) ? m : []);
    }).finally(() => setLoading(false));
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("ml_admin", "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("ml_admin");
    setAuthed(false);
    setPassword("");
  };

  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", background: `linear-gradient(160deg, #0a1f35 0%, ${NAVY} 60%, #145374 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, padding: 20,
      }}>
        <style>{`
          @keyframes ml-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>
        <form
          onSubmit={handleLogin}
          style={{
            width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(177,212,224,0.15)", borderRadius: 24,
            padding: "40px 32px", textAlign: "center",
            animation: shake ? "ml-shake 0.5s ease" : "none",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🦈</div>
          <h1 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.01em" }}>
            Moolab Admin
          </h1>
          <p style={{ color: "rgba(177,212,224,0.5)", fontSize: "0.75rem", fontWeight: 600, margin: "0 0 24px" }}>
            Enter the admin password to continue
          </p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            autoFocus
            style={{
              width: "100%", padding: "14px 18px", borderRadius: 14,
              background: "rgba(255,255,255,0.08)",
              border: error ? "1.5px solid #e74c3c" : "1.5px solid rgba(177,212,224,0.2)",
              color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: "0.95rem",
              outline: "none", boxSizing: "border-box", marginBottom: 12,
            }}
          />
          {error && (
            <p style={{ color: "#ff8f81", fontSize: "0.75rem", fontWeight: 700, margin: "0 0 12px" }}>
              Wrong password. Try again.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #2e8bc0, #145374)",
              color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: "0.95rem",
              letterSpacing: "0.03em", cursor: "pointer",
            }}
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  const activeToday = children.filter((c) => isToday(c.lastActiveAt)).length;
  const recentParents = [...parents]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);

  const childCount = (parentId: number) => children.filter((c) => c.parentId === parentId).length;

  const statCards = [
    { label: "Total Parents", value: parents.length, icon: "👤" },
    { label: "Total Students", value: children.length, icon: "🦈" },
    { label: "Messages", value: messages.length, icon: "✉️" },
    { label: "Active Today", value: activeToday, icon: "⚡" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f5f9", fontFamily: FONT }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #0a1f35, ${NAVY})`,
        padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ color: "#fff", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
          🦈 Moolab Admin
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 18px", borderRadius: 10, border: "1.5px solid rgba(177,212,224,0.25)",
            background: "transparent", color: "rgba(177,212,224,0.85)",
            fontFamily: FONT, fontWeight: 800, fontSize: "0.78rem", cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "16px 28px 0", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 20px", borderRadius: "12px 12px 0 0", border: "none",
              background: tab === t.id ? "#fff" : "rgba(12,45,72,0.05)",
              color: tab === t.id ? NAVY : "rgba(12,45,72,0.45)",
              fontFamily: FONT, fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 28px 40px" }}>
        <div style={{ background: "#fff", borderRadius: "0 16px 16px 16px", padding: 24, boxShadow: "0 8px 30px rgba(12,45,72,0.06)" }}>
          {loading && (
            <p style={{ color: "rgba(12,45,72,0.4)", fontWeight: 700, fontSize: "0.85rem", textAlign: "center", padding: 30 }}>
              Loading...
            </p>
          )}

          {!loading && tab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
                {statCards.map((s) => (
                  <div key={s.label} style={{
                    background: `linear-gradient(135deg, #0a1f35, ${NAVY})`,
                    borderRadius: 16, padding: "20px 22px",
                  }}>
                    <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ color: "rgba(177,212,224,0.6)", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.08em", marginTop: 6, textTransform: "uppercase" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <h2 style={{ color: NAVY, fontSize: "1rem", fontWeight: 900, margin: "0 0 12px" }}>Recent Signups</h2>
              {recentParents.length === 0 ? (
                <p style={{ color: "rgba(12,45,72,0.35)", fontWeight: 600, fontSize: "0.85rem" }}>No signups yet.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>EMAIL</th>
                        <th style={thStyle}>CHILDREN</th>
                        <th style={thStyle}>JOINED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentParents.map((p) => (
                        <tr key={p.id}>
                          <td style={tdStyle}>{p.email}</td>
                          <td style={tdStyle}>{childCount(p.id)}</td>
                          <td style={tdStyle}>{fmtDate(p.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!loading && tab === "parents" && (
            parents.length === 0 ? (
              <p style={{ color: "rgba(12,45,72,0.35)", fontWeight: 600, fontSize: "0.85rem", textAlign: "center", padding: 30 }}>No parents yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>EMAIL</th>
                      <th style={thStyle}>CHILDREN</th>
                      <th style={thStyle}>PLAN</th>
                      <th style={thStyle}>JOINED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.map((p) => (
                      <tr key={p.id}>
                        <td style={tdStyle}>{p.email}</td>
                        <td style={tdStyle}>{childCount(p.id)}</td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: "4px 12px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.06em",
                            background: p.subscriptionStatus === "free" ? "rgba(12,45,72,0.08)" : "linear-gradient(135deg, #2e8bc0, #145374)",
                            color: p.subscriptionStatus === "free" ? "rgba(12,45,72,0.5)" : "#fff",
                          }}>
                            {p.subscriptionStatus === "free" ? "FREE" : "APEX"}
                          </span>
                        </td>
                        <td style={tdStyle}>{fmtDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {!loading && tab === "students" && (
            children.length === 0 ? (
              <p style={{ color: "rgba(12,45,72,0.35)", fontWeight: 600, fontSize: "0.85rem", textAlign: "center", padding: 30 }}>No students yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>USERNAME</th>
                      <th style={thStyle}>DISPLAY NAME</th>
                      <th style={thStyle}>GRADE</th>
                      <th style={thStyle}>LEVEL</th>
                      <th style={thStyle}>XP</th>
                      <th style={thStyle}>STREAK</th>
                      <th style={thStyle}>LAST ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((c) => (
                      <tr key={c.id}>
                        <td style={tdStyle}>@{c.username}</td>
                        <td style={tdStyle}>{c.displayName}</td>
                        <td style={tdStyle}>{c.grade ? gradeLabel(c.grade, "en") : "—"}</td>
                        <td style={tdStyle}>{c.level ?? 1}</td>
                        <td style={tdStyle}>{c.xp ?? 0}</td>
                        <td style={tdStyle}>{c.streak ?? 0} 🔥</td>
                        <td style={tdStyle}>{fmtDate(c.lastActiveAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {!loading && tab === "messages" && (
            messages.length === 0 ? (
              <p style={{ color: "rgba(12,45,72,0.35)", fontWeight: 600, fontSize: "0.85rem", textAlign: "center", padding: 30 }}>No messages yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((m, i) => (
                  <div key={m.id ?? i} style={{
                    background: "rgba(177,212,224,0.1)", border: "1.5px solid rgba(46,139,192,0.12)",
                    borderRadius: 14, padding: "16px 20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                      <div>
                        <span style={{ color: NAVY, fontWeight: 900, fontSize: "0.9rem" }}>{m.name || "Anonymous"}</span>
                        <span style={{ color: "rgba(12,45,72,0.4)", fontWeight: 600, fontSize: "0.78rem", marginLeft: 10 }}>{m.email}</span>
                      </div>
                      <span style={{ color: "rgba(12,45,72,0.35)", fontWeight: 700, fontSize: "0.72rem" }}>{fmtDate(m.createdAt)}</span>
                    </div>
                    <p style={{ color: "rgba(12,45,72,0.75)", fontWeight: 600, fontSize: "0.85rem", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
