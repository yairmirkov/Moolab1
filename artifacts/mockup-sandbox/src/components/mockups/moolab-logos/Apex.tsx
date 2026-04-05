export function Apex() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <svg width="180" height="230" viewBox="0 0 180 230" fill="none">
            <defs>
              <linearGradient id="apex-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id="apex-glow">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            {/* Glow aura */}
            <path d="M90 20 L40 95 L55 105 L70 100 L80 110 L90 105 L100 110 L110 100 L125 105 L140 95 Z" fill="#0ea5e9" opacity="0.08" filter="url(#apex-glow)" />
            {/* Geometric shark head — head-on symmetrical view */}
            {/* Main head shape — angular, authoritative */}
            <path d="M90 24 L48 90 L58 100 L72 95 L82 108 L90 102 L98 108 L108 95 L122 100 L132 90 Z" fill="none" stroke="url(#apex-grad)" strokeWidth="2" strokeLinejoin="round" />
            {/* Inner structure lines — snout ridge */}
            <line x1="90" y1="24" x2="90" y2="75" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />
            <line x1="90" y1="75" x2="72" y2="95" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
            <line x1="90" y1="75" x2="108" y2="95" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
            {/* Eyes — geometric, intelligent */}
            <path d="M62 72 L74 67 L82 72 L74 77 Z" fill="#0ea5e9" opacity="0.9" />
            <circle cx="74" cy="72" r="2" fill="#7dd3fc" />
            <circle cx="74" cy="72" r="0.8" fill="#fff" />
            <path d="M118 72 L106 67 L98 72 L106 77 Z" fill="#0ea5e9" opacity="0.9" />
            <circle cx="106" cy="72" r="2" fill="#7dd3fc" />
            <circle cx="106" cy="72" r="0.8" fill="#fff" />
            {/* Nostrils */}
            <ellipse cx="82" cy="85" rx="2" ry="1" fill="#0ea5e9" opacity="0.3" />
            <ellipse cx="98" cy="85" rx="2" ry="1" fill="#0ea5e9" opacity="0.3" />
            {/* Jaw line — subtle, no teeth */}
            <path d="M58 100 Q90 112 122 100" stroke="#0ea5e9" strokeWidth="1" opacity="0.25" fill="none" />
            {/* Lateral lines — sensor network */}
            <line x1="48" y1="90" x2="38" y2="92" stroke="#38bdf8" strokeWidth="0.8" opacity="0.2" />
            <line x1="132" y1="90" x2="142" y2="92" stroke="#38bdf8" strokeWidth="0.8" opacity="0.2" />
            {/* MOOLAB */}
            <text x="90" y="155" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="20" letterSpacing="0.18em" opacity="0.9">MOOLAB</text>
            <text x="90" y="170" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" fontSize="7" letterSpacing="0.3em" opacity="0.35">.APP</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
          The Apex — Geometric Head-On
        </p>
      </div>
    </div>
  );
}
