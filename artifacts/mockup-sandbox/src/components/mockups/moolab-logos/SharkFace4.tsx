export function SharkFace4() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center">
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
            {/* Main square */}
            <rect x="10" y="20" width="140" height="140" rx="28" fill="#145374" />
            {/* Dorsal fin */}
            <polygon points="80,2 66,24 94,24" fill="#145374" />
            {/* Left fin */}
            <polygon points="2,78 15,56 17,84" fill="#145374" />
            {/* Right fin */}
            <polygon points="158,78 145,56 143,84" fill="#145374" />
            {/* Eyes — glowing circles with rings */}
            <circle cx="52" cy="56" r="11" fill="none" stroke="#2e8bc0" strokeWidth="2" opacity="0.4" />
            <circle cx="52" cy="56" r="7" fill="#2e8bc0" />
            <circle cx="54" cy="54" r="2.5" fill="#fff" />
            <circle cx="108" cy="56" r="11" fill="none" stroke="#2e8bc0" strokeWidth="2" opacity="0.4" />
            <circle cx="108" cy="56" r="7" fill="#2e8bc0" />
            <circle cx="110" cy="54" r="2.5" fill="#fff" />
            {/* Subtle gill lines on sides */}
            <line x1="26" y1="65" x2="26" y2="78" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
            <line x1="30" y1="65" x2="30" y2="78" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <line x1="134" y1="65" x2="134" y2="78" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
            <line x1="130" y1="65" x2="130" y2="78" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            {/* Jaw line */}
            <path d="M28 84 Q80 78 132 84" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
            {/* Teeth M — individual sharp teeth */}
            {/* Left pillar */}
            <polygon points="28,86 38,86 38,150 28,150" fill="#fff" />
            {/* Tooth 1 */}
            <polygon points="38,86 48,86 43,115" fill="#fff" />
            {/* Tooth 2 */}
            <polygon points="48,86 58,86 53,118" fill="#fff" />
            {/* Center gap tooth going up */}
            <polygon points="58,150 70,92 80,92 68,150" fill="#fff" />
            <polygon points="92,150 80,92 90,92 102,150" fill="#fff" />
            {/* Tooth 3 */}
            <polygon points="102,86 112,86 107,118" fill="#fff" />
            {/* Tooth 4 */}
            <polygon points="112,86 122,86 117,115" fill="#fff" />
            {/* Right pillar */}
            <polygon points="122,86 132,86 132,150 122,150" fill="#fff" />
            {/* MOOLAB text */}
            <text x="80" y="187" textAnchor="middle" fill="#145374" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.12em">MOOLAB</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          F4 — Glowing Eyes · Gills · Many-Tooth M
        </p>
      </div>
    </div>
  );
}
