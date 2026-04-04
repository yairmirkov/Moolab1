export function SharkM1() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <rect x="5" y="5" width="130" height="130" rx="26" fill="#145374" />
            {/* Dorsal fin on top center */}
            <polygon points="70,8 62,30 78,30" fill="#b1d4e0" />
            {/* Side fin left */}
            <polygon points="12,65 22,50 28,70" fill="#b1d4e0" />
            {/* Side fin right */}
            <polygon points="128,65 118,50 112,70" fill="#b1d4e0" />
            {/* M as jagged crown teeth (M3 style) */}
            <polygon points="22,105 22,45 32,45 42,75 52,35 60,62 70,35 80,62 88,35 98,75 108,45 118,45 118,105 108,105 108,60 100,85 88,48 80,78 70,48 60,78 52,48 42,85 32,60 32,105" fill="#fff" />
            {/* Shark eyes - two menacing dots above the M */}
            <circle cx="48" cy="38" r="4" fill="#2e8bc0" />
            <circle cx="92" cy="38" r="4" fill="#2e8bc0" />
            <circle cx="49" cy="37" r="1.5" fill="#fff" />
            <circle cx="93" cy="37" r="1.5" fill="#fff" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            S1 — Crown Teeth + Eyes + 3 Fins
          </p>
        </div>
      </div>
    </div>
  );
}
