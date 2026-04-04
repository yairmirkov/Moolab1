export function RazorM() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="5" y="5" width="110" height="110" rx="22" fill="#0D9668" />
            {/* M formed by razor-sharp angular teeth — no curves, all edges */}
            {/* Left leg */}
            <polygon points="18,92 18,24 30,24 30,92" fill="#fff" />
            {/* Left diagonal going to center */}
            <polygon points="30,24 60,68 52,68 30,36" fill="#fff" />
            {/* Right diagonal going to center */}
            <polygon points="90,24 60,68 68,68 90,36" fill="#fff" />
            {/* Right leg */}
            <polygon points="90,24 102,24 102,92 90,92" fill="#fff" />
            {/* Tooth edge details — small sharp notches */}
            <polygon points="38,38 44,52 32,52" fill="#0D9668" opacity="0.15" />
            <polygon points="82,38 88,52 76,52" fill="#0D9668" opacity="0.15" />
            <polygon points="56,60 60,68 64,60" fill="#0D9668" opacity="0.15" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            M5 — Razor M · Clean angular M with tooth-edge serrations
          </p>
        </div>
      </div>
    </div>
  );
}
