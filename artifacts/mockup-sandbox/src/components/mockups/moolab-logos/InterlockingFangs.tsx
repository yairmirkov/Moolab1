export function InterlockingFangs() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="5" y="5" width="110" height="110" rx="22" fill="#0D9668" />
            {/* M formed by interlocking upper and lower shark teeth */}
            {/* Left pillar */}
            <rect x="20" y="25" width="10" height="70" fill="#fff" />
            {/* Right pillar */}
            <rect x="90" y="25" width="10" height="70" fill="#fff" />
            {/* Upper teeth coming down (form the two peaks of M) */}
            <polygon points="30,25 45,65 38,65 30,40" fill="#fff" />
            <polygon points="90,25 75,65 82,65 90,40" fill="#fff" />
            {/* Lower tooth coming up (forms the center valley of M) */}
            <polygon points="52,95 60,55 68,95" fill="#fff" />
            {/* Small serration details */}
            <polygon points="45,65 52,80 38,80" fill="#fff" opacity="0.5" />
            <polygon points="75,65 82,80 68,80" fill="#fff" opacity="0.5" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            M2 — Interlocking Fangs · Upper + lower teeth form M
          </p>
        </div>
      </div>
    </div>
  );
}
