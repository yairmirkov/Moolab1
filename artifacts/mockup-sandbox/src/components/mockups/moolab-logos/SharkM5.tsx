export function SharkM5() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <rect x="5" y="5" width="130" height="130" rx="26" fill="#0c2d48" />
            {/* Dorsal fin — large, iconic */}
            <polygon points="70,3 56,30 84,30" fill="#2e8bc0" />
            <line x1="70" y1="8" x2="70" y2="28" stroke="#b1d4e0" strokeWidth="1" opacity="0.4" />
            {/* Side fins — like pectoral fins */}
            <polygon points="6,70 22,48 28,72" fill="#2e8bc0" />
            <line x1="14" y1="62" x2="26" y2="64" stroke="#b1d4e0" strokeWidth="0.8" opacity="0.4" />
            <polygon points="134,70 118,48 112,72" fill="#2e8bc0" />
            <line x1="126" y1="62" x2="114" y2="64" stroke="#b1d4e0" strokeWidth="0.8" opacity="0.4" />
            {/* Eyes — fierce angled */}
            <path d="M40 35 L48 32 L56 35 L48 38 Z" fill="#2e8bc0" />
            <circle cx="48" cy="35" r="2" fill="#fff" />
            <path d="M84 35 L92 32 L100 35 L92 38 Z" fill="#2e8bc0" />
            <circle cx="92" cy="35" r="2" fill="#fff" />
            {/* M — clean triple fang with sharp base */}
            <rect x="22" y="44" width="12" height="62" fill="#fff" />
            <rect x="106" y="44" width="12" height="62" fill="#fff" />
            {/* Left diagonal */}
            <polygon points="34,44 56,44 45,82" fill="#fff" />
            {/* Center tooth (up from bottom) */}
            <polygon points="56,106 70,52 84,106" fill="#fff" />
            {/* Right diagonal */}
            <polygon points="84,44 106,44 95,82" fill="#fff" />
            {/* Tooth serration marks */}
            <line x1="38" y1="55" x2="45" y2="70" stroke="#0c2d48" strokeWidth="0.8" opacity="0.2" />
            <line x1="102" y1="55" x2="95" y2="70" stroke="#0c2d48" strokeWidth="0.8" opacity="0.2" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            S5 — Diamond Eyes + Big Dorsal + Serrated Fangs
          </p>
        </div>
      </div>
    </div>
  );
}
