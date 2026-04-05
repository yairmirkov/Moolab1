export function SharkFace5() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center">
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
            {/* Main square */}
            <rect x="10" y="20" width="140" height="140" rx="28" fill="#0c2d48" />
            {/* Dorsal fin — tall sleek */}
            <polygon points="80,0 64,25 96,25" fill="#0c2d48" />
            {/* Left pectoral — aggressive angle */}
            <polygon points="0,76 16,52 18,82" fill="#0c2d48" />
            {/* Right pectoral */}
            <polygon points="160,76 144,52 142,82" fill="#0c2d48" />
            {/* Eyes — angry angled brows with glow */}
            {/* Left eye brow */}
            <line x1="36" y1="50" x2="62" y2="46" stroke="#2e8bc0" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="52" cy="56" rx="9" ry="6" fill="#2e8bc0" />
            <circle cx="54" cy="55" r="2.5" fill="#b1d4e0" />
            <circle cx="55" cy="54.5" r="1" fill="#fff" />
            {/* Right eye brow */}
            <line x1="124" y1="50" x2="98" y2="46" stroke="#2e8bc0" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="108" cy="56" rx="9" ry="6" fill="#2e8bc0" />
            <circle cx="106" cy="55" r="2.5" fill="#b1d4e0" />
            <circle cx="105" cy="54.5" r="1" fill="#fff" />
            {/* Nose */}
            <ellipse cx="80" cy="72" rx="3" ry="2" fill="rgba(46,139,192,0.2)" />
            {/* Teeth — M formed by 3 downward fangs with center V up */}
            {/* Left pillar */}
            <rect x="26" y="84" width="14" height="64" rx="1" fill="#fff" />
            {/* Right pillar */}
            <rect x="120" y="84" width="14" height="64" rx="1" fill="#fff" />
            {/* Left fang down */}
            <polygon points="40,84 60,84 50,128" fill="#fff" />
            {/* Center tooth up from bottom */}
            <polygon points="60,148 80,88 100,148" fill="#fff" />
            {/* Right fang down */}
            <polygon points="100,84 120,84 110,128" fill="#fff" />
            {/* MOOLAB text */}
            <text x="80" y="187" textAnchor="middle" fill="#0c2d48" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.12em">MOOLAB</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          F5 — Angry Brows · Nose · Bold Fang M
        </p>
      </div>
    </div>
  );
}
