export function SharkFace3() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center">
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
            {/* Main square */}
            <rect x="10" y="20" width="140" height="140" rx="28" fill="#0c2d48" />
            {/* Dorsal fin — large iconic */}
            <polygon points="80,1 62,25 98,25" fill="#0c2d48" />
            {/* Fin detail line */}
            <line x1="80" y1="6" x2="80" y2="22" stroke="#2e8bc0" strokeWidth="1" opacity="0.5" />
            {/* Left pectoral */}
            <polygon points="1,82 16,60 18,88" fill="#0c2d48" />
            {/* Right pectoral */}
            <polygon points="159,82 144,60 142,88" fill="#0c2d48" />
            {/* Eyes — fierce angular diamonds */}
            <path d="M38 58 L54 52 L68 58 L54 64 Z" fill="#2e8bc0" />
            <circle cx="54" cy="58" r="3.5" fill="#b1d4e0" />
            <circle cx="54" cy="58" r="1.5" fill="#0c2d48" />
            <path d="M92 58 L106 52 L120 58 L106 64 Z" fill="#2e8bc0" />
            <circle cx="106" cy="58" r="3.5" fill="#b1d4e0" />
            <circle cx="106" cy="58" r="1.5" fill="#0c2d48" />
            {/* Snout / nose */}
            <circle cx="80" cy="72" r="2" fill="rgba(255,255,255,0.12)" />
            <circle cx="74" cy="73" r="1.5" fill="rgba(255,255,255,0.08)" />
            <circle cx="86" cy="73" r="1.5" fill="rgba(255,255,255,0.08)" />
            {/* Teeth M — clean bold M shape as open jaw */}
            {/* Left vertical */}
            <rect x="28" y="85" width="12" height="62" fill="#fff" />
            {/* Right vertical */}
            <rect x="120" y="85" width="12" height="62" fill="#fff" />
            {/* Left diagonal */}
            <polygon points="40,85 62,85 51,120" fill="#fff" />
            {/* Center V (up from bottom — the tongue/throat) */}
            <polygon points="62,147 80,95 98,147" fill="#fff" />
            {/* Right diagonal */}
            <polygon points="98,85 120,85 109,120" fill="#fff" />
            {/* MOOLAB text */}
            <text x="80" y="185" textAnchor="middle" fill="#0c2d48" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.12em">MOOLAB</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          F3 — Diamond Eyes · Nostrils · Clean M Jaw
        </p>
      </div>
    </div>
  );
}
