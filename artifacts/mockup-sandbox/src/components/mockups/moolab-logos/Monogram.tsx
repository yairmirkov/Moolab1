export function Monogram() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <rect x="2" y="2" width="60" height="60" rx="14" fill="#0D9668" />
            <text x="32" y="44" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="36" fill="#fff" letterSpacing="-2">M</text>
            <rect x="42" y="8" width="4" height="12" rx="1" fill="#fff" opacity="0.3" />
            <rect x="48" y="4" width="4" height="16" rx="1" fill="#fff" opacity="0.5" />
            <rect x="54" y="0" width="4" height="20" rx="1" fill="#fff" opacity="0.7" />
          </svg>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "28px", letterSpacing: "-0.02em", color: "#0D9668" }}>
            MOOLAB
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          D — Monogram · "M" badge with growth accent
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="bg-[#0a0a0a] rounded-xl px-5 py-3 flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
              <rect x="2" y="2" width="60" height="60" rx="14" fill="#0D9668" />
              <text x="32" y="44" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="36" fill="#fff" letterSpacing="-2">M</text>
              <rect x="42" y="8" width="4" height="12" rx="1" fill="#fff" opacity="0.3" />
              <rect x="48" y="4" width="4" height="16" rx="1" fill="#fff" opacity="0.5" />
              <rect x="54" y="0" width="4" height="20" rx="1" fill="#fff" opacity="0.7" />
            </svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "13px", color: "#0D9668", letterSpacing: "0.04em" }}>MOOLAB</span>
          </div>
          <span style={{ fontSize: "10px", color: "#aaa" }}>on dark</span>
        </div>
      </div>
    </div>
  );
}
