export function SharkM4() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <rect x="5" y="5" width="130" height="130" rx="26" fill="#145374" />
            {/* Dorsal fin — razor sharp, slightly angled */}
            <polygon points="66,5 60,32 80,32" fill="#b1d4e0" />
            {/* Left fin — angular */}
            <polygon points="8,60 20,42 26,62" fill="#b1d4e0" opacity="0.7" />
            {/* Right fin — angular */}
            <polygon points="132,60 120,42 114,62" fill="#b1d4e0" opacity="0.7" />
            {/* Eyes — glowing dots with outer ring */}
            <circle cx="48" cy="38" r="6" fill="none" stroke="#2e8bc0" strokeWidth="1.5" />
            <circle cx="48" cy="38" r="3" fill="#2e8bc0" />
            <circle cx="92" cy="38" r="6" fill="none" stroke="#2e8bc0" strokeWidth="1.5" />
            <circle cx="92" cy="38" r="3" fill="#2e8bc0" />
            {/* M — zigzag crown with 5 teeth */}
            <polygon points="20,108 20,50 30,50 40,72 50,38 58,60 70,32 82,60 90,38 100,72 110,50 120,50 120,108 110,108 110,62 102,82 90,50 82,74 70,46 58,74 50,50 40,82 30,62 30,108" fill="#fff" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            S4 — 5-Tooth Crown + Ringed Eyes + Light Fins
          </p>
        </div>
      </div>
    </div>
  );
}
