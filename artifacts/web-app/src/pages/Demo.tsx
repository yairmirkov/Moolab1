import { useEffect, useState } from "react";
import App from "../App";
import { useLang, t, translations } from "../useLang";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

type Device = {
  id: string;
  label: string;
  group: string;
  w: number;
  h: number;
};

const DEVICES: Device[] = [
  { id: "responsive", label: "📐 Responsive (Fit Window)", group: "Auto", w: 0, h: 0 },
  { id: "iphone-se", label: "iPhone SE", group: "iPhone", w: 375, h: 667 },
  { id: "iphone-13", label: "iPhone 13 / 14", group: "iPhone", w: 390, h: 844 },
  { id: "iphone-15-pro", label: "iPhone 15 Pro", group: "iPhone", w: 393, h: 852 },
  { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max", group: "iPhone", w: 430, h: 932 },
  { id: "pixel-7", label: "Pixel 7", group: "Android", w: 412, h: 915 },
  { id: "galaxy-s24", label: "Galaxy S24", group: "Android", w: 384, h: 832 },
  { id: "galaxy-fold", label: "Galaxy Z Fold (folded)", group: "Android", w: 344, h: 882 },
  { id: "ipad-mini", label: "iPad Mini", group: "Tablet", w: 744, h: 1133 },
  { id: "ipad-air", label: "iPad Air", group: "Tablet", w: 820, h: 1180 },
  { id: "ipad-pro-11", label: 'iPad Pro 11"', group: "Tablet", w: 834, h: 1194 },
  { id: "ipad-pro-13", label: 'iPad Pro 13"', group: "Tablet", w: 1024, h: 1366 },
  { id: "galaxy-tab-s9", label: "Galaxy Tab S9", group: "Tablet", w: 800, h: 1280 },
  { id: "laptop-13", label: 'Laptop 13"', group: "Desktop", w: 1280, h: 800 },
  { id: "laptop-15", label: 'Laptop 15"', group: "Desktop", w: 1440, h: 900 },
  { id: "desktop-fhd", label: "Desktop 1080p", group: "Desktop", w: 1920, h: 1080 },
];

function syncLangToStorage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang === "es" || urlLang === "en") {
    localStorage.setItem("ws_lang", urlLang);
  }
}
syncLangToStorage();

export default function Demo() {
  const lang = useLang();
  const tx = translations.pages.demo;

  const [ageGroup, setAgeGroup] = useState(() => {
    const saved = localStorage.getItem("ws_demo_age") || "Teens";
    localStorage.setItem("ws_demo_age", saved);
    localStorage.setItem("ws_name", "Demo Tester");
    localStorage.setItem("ws_acctType", "learner");
    return saved;
  });

  const [deviceId, setDeviceId] = useState<string>(
    () => localStorage.getItem("ws_demo_device") || "responsive"
  );
  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];
  const [stage, setStage] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const headerH = 48;
      setStage({ w: window.innerWidth, h: window.innerHeight - headerH });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isResponsive = device.id === "responsive";
  const fitScale = isResponsive
    ? 1
    : Math.min(
        1,
        (stage.w - 48) / device.w,
        (stage.h - 48) / device.h
      );

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

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <label style={{ color: "rgba(177,212,224,0.6)", fontSize: "0.65rem", fontWeight: 700 }}>
            Device:
          </label>
          <select
            value={deviceId}
            onChange={(e) => {
              const v = e.target.value;
              localStorage.setItem("ws_demo_device", v);
              setDeviceId(v);
            }}
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(177,212,224,0.2)",
              color: "#b1d4e0", fontFamily: FONT, fontWeight: 700, fontSize: "0.8rem",
              padding: "6px 12px", borderRadius: 10, cursor: "pointer",
              outline: "none", maxWidth: 220,
            }}
          >
            {(["Auto", "iPhone", "Android", "Tablet", "Desktop"] as const).map((g) => (
              <optgroup key={g} label={g} style={{ color: "#0c2d48" }}>
                {DEVICES.filter((d) => d.group === g).map((d) => (
                  <option key={d.id} value={d.id} style={{ color: "#0c2d48" }}>
                    {d.label}{d.w > 0 ? `  ·  ${d.w}×${d.h}` : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

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

      {isResponsive ? (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <App demoMode={true} demoAgeGroup={ageGroup} />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            overflow: "auto",
            background:
              "radial-gradient(ellipse at center, #0c2d48 0%, #061522 70%, #030b14 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 12,
              fontFamily: FONT,
              fontSize: "0.65rem",
              fontWeight: 800,
              color: "rgba(177,212,224,0.5)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              pointerEvents: "none",
            }}
          >
            {device.label} · {device.w}×{device.h}
            {fitScale < 1 ? `  ·  ${Math.round(fitScale * 100)}% scale` : ""}
          </div>
          <div
            style={{
              width: device.w * fitScale,
              height: device.h * fitScale,
              position: "relative",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.6), 0 0 0 8px #1a1a1a, 0 0 0 9px rgba(46,139,192,0.25)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: device.w,
                height: device.h,
                transform: `scale(${fitScale})`,
                transformOrigin: "top left",
              }}
            >
              <App demoMode={true} demoAgeGroup={ageGroup} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
