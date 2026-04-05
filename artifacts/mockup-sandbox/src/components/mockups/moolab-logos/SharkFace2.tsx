export function SharkFace2() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center">
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
            {/* Main square — shark body */}
            <rect x="10" y="20" width="140" height="140" rx="28" fill="#145374" />
            {/* Dorsal fin — tall, sharp */}
            <polygon points="80,0 65,24 95,24" fill="#145374" />
            {/* Left fin — swept back */}
            <polygon points="0,80 14,58 16,88" fill="#145374" />
            {/* Right fin — swept back */}
            <polygon points="160,80 146,58 144,88" fill="#145374" />
            {/* Eyes — slitted vertical pupils */}
            <ellipse cx="54" cy="58" rx="10" ry="7" fill="#b1d4e0" />
            <ellipse cx="106" cy="58" rx="10" ry="7" fill="#b1d4e0" />
            <ellipse cx="54" cy="58" rx="3" ry="6" fill="#0c2d48" />
            <ellipse cx="106" cy="58" rx="3" ry="6" fill="#0c2d48" />
            {/* Nose bridge hint */}
            <line x1="72" y1="55" x2="80" y2="68" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
            <line x1="88" y1="55" x2="80" y2="68" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
            {/* Jaw line */}
            <path d="M28 82 Q80 76 132 82" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
            {/* Teeth forming M — zigzag row */}
            <polygon points="26,150 26,85 36,85 46,110 56,80 64,100 80,75 96,100 104,80 114,110 124,85 134,85 134,150 124,150 124,95 116,118 104,88 96,112 80,86 64,112 56,88 46,118 36,95 36,150" fill="#fff" />
            {/* MOOLAB text */}
            <text x="80" y="185" textAnchor="middle" fill="#145374" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.12em">MOOLAB</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          F2 — Slitted Eyes · Zigzag Jaw M
        </p>
      </div>
    </div>
  );
}
