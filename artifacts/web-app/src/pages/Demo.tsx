import { useState, useEffect } from "react";
import App from "../App";
import { useLang, t, translations } from "../useLang";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

export default function Demo() {
  const lang = useLang();
  const tx = translations.pages.demo;

  const [ageGroup, setAgeGroup] = useState(() => {
    return localStorage.getItem("ws_demo_age") || "Teens";
  });

  useEffect(() => {
    localStorage.setItem("ws_demo_age", ageGroup);
    localStorage.setItem("ws_name", "Demo Tester");
    localStorage.setItem("ws_acctType", "learner");
    localStorage.setItem("ws_lang", lang);
  }, [ageGroup, lang]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: "linear-gradient(135deg, #0c2d48, #145374)",
        padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: FONT, flexShrink: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            background: "rgba(255,107,107,0.2)", color: "#FF6B6B",
            padding: "3px 10px", borderRadius: 8, fontSize: "0.6rem",
            fontWeight: 900, letterSpacing: "0.08em",
          }}>
            {t(tx.demoMode, lang)}
          </span>
          <span style={{ color: "rgba(177,212,224,0.5)", fontSize: "0.7rem", fontWeight: 600 }}>
            {t(tx.noAuth, lang)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ color: "rgba(177,212,224,0.6)", fontSize: "0.65rem", fontWeight: 700 }}>
            {t(tx.ageGroup, lang)}
          </label>
          <select
            value={ageGroup}
            onChange={(e) => {
              setAgeGroup(e.target.value);
              window.location.reload();
            }}
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(177,212,224,0.2)",
              color: "#b1d4e0", fontFamily: FONT, fontWeight: 700, fontSize: "0.8rem",
              padding: "6px 12px", borderRadius: 10, cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="Kids" style={{ color: "#0c2d48" }}>{t(tx.kids, lang)}</option>
            <option value="Teens" style={{ color: "#0c2d48" }}>{t(tx.teens, lang)}</option>
            <option value="Adults" style={{ color: "#0c2d48" }}>{t(tx.adults, lang)}</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <App demoMode={true} demoAgeGroup={ageGroup} />
      </div>
    </div>
  );
}
