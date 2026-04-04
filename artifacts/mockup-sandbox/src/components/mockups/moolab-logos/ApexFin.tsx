export function ApexFin() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="48" width="6" height="10" fill="#0D9668" opacity="0.4" />
            <rect x="18" y="40" width="6" height="18" fill="#0D9668" opacity="0.6" />
            <rect x="28" y="30" width="6" height="28" fill="#0D9668" opacity="0.8" />
            <rect x="38" y="18" width="6" height="40" fill="#0D9668" />
            <polygon points="44,18 44,4 58,4" fill="#0D9668" />
          </svg>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "28px", letterSpacing: "-0.02em", color: "#0D9668" }}>
            MOOLAB
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          A — Apex Fin · Bar chart + shark fin
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="bg-[#0a0a0a] rounded-xl px-5 py-3 flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
              <rect x="8" y="48" width="6" height="10" fill="#0D9668" opacity="0.4" />
              <rect x="18" y="40" width="6" height="18" fill="#0D9668" opacity="0.6" />
              <rect x="28" y="30" width="6" height="28" fill="#0D9668" opacity="0.8" />
              <rect x="38" y="18" width="6" height="40" fill="#0D9668" />
              <polygon points="44,18 44,4 58,4" fill="#0D9668" />
            </svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "13px", color: "#0D9668", letterSpacing: "0.04em" }}>MOOLAB</span>
          </div>
          <span style={{ fontSize: "10px", color: "#aaa" }}>on dark</span>
        </div>
      </div>
    </div>
  );
}
