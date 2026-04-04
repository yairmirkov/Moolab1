export function TripleFang() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="5" y="5" width="110" height="110" rx="22" fill="#0D9668" />
            {/* M made of 3 sharp downward-pointing teeth with gaps forming M shape */}
            {/* Left vertical */}
            <rect x="20" y="25" width="10" height="70" fill="#fff" />
            {/* Right vertical */}
            <rect x="90" y="25" width="10" height="70" fill="#fff" />
            {/* Left fang - sharp triangle pointing down from top-left */}
            <polygon points="30,25 50,25 40,65" fill="#fff" />
            {/* Center fang - pointing UP from bottom (the valley) */}
            <polygon points="50,95 60,45 70,95" fill="#fff" />
            {/* Right fang - sharp triangle pointing down from top-right */}
            <polygon points="70,25 90,25 80,65" fill="#fff" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            M4 — Triple Fang · Three teeth: down-up-down = M
          </p>
        </div>
      </div>
    </div>
  );
}
