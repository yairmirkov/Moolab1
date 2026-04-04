export function SharkM3() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <rect x="5" y="5" width="130" height="130" rx="26" fill="#0c2d48" />
            {/* Dorsal fin — curved sleek */}
            <path d="M70 6 Q65 18 58 30 L82 30 Q75 18 70 6Z" fill="#2e8bc0" />
            {/* Left pectoral fin */}
            <path d="M10 68 Q18 48 28 58 L22 74Z" fill="#2e8bc0" />
            {/* Right pectoral fin */}
            <path d="M130 68 Q122 48 112 58 L118 74Z" fill="#2e8bc0" />
            {/* Shark eyes — round aggressive */}
            <circle cx="46" cy="38" r="5" fill="#2e8bc0" />
            <circle cx="94" cy="38" r="5" fill="#2e8bc0" />
            <circle cx="47.5" cy="37" r="2" fill="#fff" />
            <circle cx="95.5" cy="37" r="2" fill="#fff" />
            {/* M — hybrid crown-fang style */}
            {/* Left pillar */}
            <polygon points="24,108 24,48 36,48 36,108" fill="#fff" />
            {/* Left teeth descending */}
            <polygon points="36,48 50,78 42,78" fill="#fff" />
            {/* Center tooth ascending */}
            <polygon points="50,108 62,58 70,58 58,108" fill="#fff" />
            <polygon points="90,108 78,58 70,58 82,108" fill="#fff" />
            {/* Right teeth descending */}
            <polygon points="104,48 90,78 98,78" fill="#fff" />
            {/* Right pillar */}
            <polygon points="104,48 116,48 116,108 104,108" fill="#fff" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            S3 — Deep Navy + Curved Fins + Bold Eyes
          </p>
        </div>
      </div>
    </div>
  );
}
