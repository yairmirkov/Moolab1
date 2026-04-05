export function SharkFace1() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center">
          <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
            <defs>
              <clipPath id="sf1-clip">
                <rect x="10" y="20" width="140" height="140" rx="28" />
              </clipPath>
            </defs>
            {/* Main rounded square — the shark's face */}
            <rect x="10" y="20" width="140" height="140" rx="28" fill="#0c2d48" />
            {/* Dorsal fin — poking up above the square */}
            <polygon points="80,2 68,24 92,24" fill="#0c2d48" />
            {/* Left pectoral fin — extends from left edge */}
            <polygon points="2,85 14,65 18,90" fill="#0c2d48" />
            {/* Right pectoral fin — extends from right edge */}
            <polygon points="158,85 146,65 142,90" fill="#0c2d48" />
            {/* Eyes — menacing, slightly angled */}
            <ellipse cx="55" cy="62" rx="8" ry="6" fill="#2e8bc0" />
            <ellipse cx="105" cy="62" rx="8" ry="6" fill="#2e8bc0" />
            <circle cx="57" cy="61" r="3" fill="#fff" />
            <circle cx="107" cy="61" r="3" fill="#fff" />
            {/* Jaw / teeth forming M — bottom half of the square */}
            {/* Upper gum line */}
            <rect x="25" y="88" width="110" height="3" rx="1" fill="rgba(255,255,255,0.15)" />
            {/* Teeth forming M shape */}
            {/* Left pillar tooth */}
            <polygon points="28,91 36,91 36,145 28,145" fill="#fff" />
            {/* Left fang going down */}
            <polygon points="36,91 52,91 44,125" fill="#fff" />
            {/* Center tooth going up (the valley) */}
            <polygon points="52,145 64,100 70,100 58,145" fill="#fff" />
            <polygon points="102,145 90,100 84,100 96,145" fill="#fff" />
            {/* Right fang going down */}
            <polygon points="108,91 124,91 116,125" fill="#fff" />
            {/* Right pillar tooth */}
            <polygon points="124,91 132,91 132,145 124,145" fill="#fff" />
            {/* Center M peak */}
            <polygon points="64,100 80,91 96,100 80,108" fill="#fff" />
            {/* MOOLAB text */}
            <text x="80" y="185" textAnchor="middle" fill="#0c2d48" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.12em">MOOLAB</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          F1 — Front-Facing Shark · Fang Teeth M
        </p>
      </div>
    </div>
  );
}
