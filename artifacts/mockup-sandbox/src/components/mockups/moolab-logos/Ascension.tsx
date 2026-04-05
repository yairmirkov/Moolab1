export function Ascension() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <svg width="180" height="240" viewBox="0 0 180 240" fill="none">
            <defs>
              <linearGradient id="asc-glow" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#0a1628" />
                <stop offset="40%" stopColor="#1a3a5c" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="asc-body" x1="0.5" y1="1" x2="0.5" y2="0">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="60%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              <filter id="asc-blur">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>
            {/* Subtle glow behind */}
            <path d="M90 180 Q70 140 75 100 Q78 60 82 40 Q86 20 90 8 Q94 20 98 40 Q102 60 105 100 Q110 140 90 180Z" fill="#0ea5e9" opacity="0.12" filter="url(#asc-blur)" />
            {/* Shark body — sleek upward profile like a growth chart */}
            <path d="M90 12 Q86 28 82 50 Q78 72 76 95 Q74 115 76 130 Q78 140 82 148 L72 155 L82 150 Q85 156 88 160 L84 168 L90 162 L96 168 L92 160 Q95 156 98 150 L108 155 L98 148 Q102 140 104 130 Q106 115 104 95 Q102 72 98 50 Q94 28 90 12Z" fill="url(#asc-body)" />
            {/* Eye */}
            <circle cx="84" cy="88" r="3" fill="#0a0a0a" />
            <circle cx="83.5" cy="87.5" r="1" fill="#38bdf8" />
            {/* Gill slits */}
            <line x1="79" y1="98" x2="79" y2="106" stroke="#0a0a0a" strokeWidth="0.8" opacity="0.5" />
            <line x1="77" y1="99" x2="77" y2="105" stroke="#0a0a0a" strokeWidth="0.6" opacity="0.4" />
            {/* Dorsal fin */}
            <path d="M92 65 Q96 50 100 42 Q97 55 94 70Z" fill="url(#asc-body)" opacity="0.8" />
            {/* Pectoral fin */}
            <path d="M76 110 Q68 118 62 124 Q70 116 78 112Z" fill="url(#asc-body)" opacity="0.7" />
            {/* Growth line trail behind the shark */}
            <path d="M90 180 Q85 170 88 160 Q82 155 80 148 Q76 138 76 130" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="3 4" />
            {/* MOOLAB text */}
            <text x="90" y="210" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="20" letterSpacing="0.18em" opacity="0.9">MOOLAB</text>
            <text x="90" y="225" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" fontSize="7" letterSpacing="0.3em" opacity="0.35">.APP</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
          The Ascension — Growth-Line Shark
        </p>
      </div>
    </div>
  );
}
