export function Circuitry() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <svg width="180" height="230" viewBox="0 0 180 230" fill="none">
            <defs>
              <linearGradient id="circ-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              <filter id="circ-glow">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            {/* Glow layer */}
            <path d="M90 15 Q50 25 35 60 Q25 90 40 115 Q50 130 65 140 L55 150 L70 142 Q75 148 80 152 L75 160 L85 155 L90 158 L95 155 L105 160 L100 152 Q105 148 110 142 L125 150 L115 140 Q130 130 140 115 Q155 90 145 60 Q130 25 90 15Z" stroke="#0ea5e9" strokeWidth="0.5" fill="none" opacity="0.15" filter="url(#circ-glow)" />
            {/* Main shark outline — circuit trace style */}
            {/* Body outline */}
            <path d="M90 18 Q55 28 42 58 Q32 85 42 110 Q50 125 65 135" stroke="url(#circ-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M90 18 Q125 28 138 58 Q148 85 138 110 Q130 125 115 135" stroke="url(#circ-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Tail / lower fins */}
            <path d="M65 135 L56 145 L68 138 Q74 144 80 148" stroke="url(#circ-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M115 135 L124 145 L112 138 Q106 144 100 148" stroke="url(#circ-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M80 148 L76 156 L85 150 L90 154 L95 150 L104 156 L100 148" stroke="url(#circ-grad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Dorsal fin */}
            <path d="M90 18 L90 10" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
            {/* Internal circuit traces */}
            <line x1="90" y1="30" x2="90" y2="70" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.3" />
            <line x1="90" y1="70" x2="65" y2="90" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.25" />
            <line x1="90" y1="70" x2="115" y2="90" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.25" />
            <line x1="65" y1="90" x2="65" y2="110" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
            <line x1="115" y1="90" x2="115" y2="110" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
            <line x1="90" y1="70" x2="90" y2="100" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
            {/* Circuit nodes — data points */}
            {[
              [90, 18], [90, 30], [90, 50], [90, 70], [90, 100],
              [65, 90], [115, 90], [65, 110], [115, 110],
              [42, 58], [138, 58], [42, 110], [138, 110],
              [56, 145], [124, 145], [76, 156], [104, 156], [90, 154],
              [55, 70], [125, 70], [50, 95], [130, 95],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i < 5 ? 2.5 : 1.8} fill="#0ea5e9" opacity={i < 5 ? 0.9 : 0.5} />
            ))}
            {/* Eye node — brighter */}
            <circle cx="68" cy="55" r="3.5" fill="#38bdf8" opacity="0.9" />
            <circle cx="68" cy="55" r="1.5" fill="#fff" opacity="0.8" />
            <circle cx="112" cy="55" r="3.5" fill="#38bdf8" opacity="0.9" />
            <circle cx="112" cy="55" r="1.5" fill="#fff" opacity="0.8" />
            {/* MOOLAB */}
            <text x="90" y="192" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="20" letterSpacing="0.18em" opacity="0.9">MOOLAB</text>
            <text x="90" y="207" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" fontSize="7" letterSpacing="0.3em" opacity="0.35">.APP</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
          The Circuitry — Data-Point Shark Network
        </p>
      </div>
    </div>
  );
}
