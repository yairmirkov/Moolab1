export function JawBiteM() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="5" y="5" width="110" height="110" rx="22" fill="#0D9668" />
            {/* M made of shark teeth — upper jaw biting down forms the M peaks */}
            {/* Left leg */}
            <polygon points="20,90 20,30 30,30 30,90" fill="#fff" />
            {/* Left peak - tooth going up */}
            <polygon points="30,30 42,60 30,60" fill="#fff" />
            {/* Center valley - two teeth meeting to form the M valley */}
            <polygon points="42,60 52,30 60,30 48,60" fill="#fff" />
            <polygon points="60,30 70,60 78,60 68,30" fill="#fff" />
            {/* Right peak - tooth going up */}
            <polygon points="78,60 90,30 90,60" fill="#fff" />
            {/* Right leg */}
            <polygon points="90,30 100,30 100,90 90,90" fill="#fff" />
            {/* Tooth serrations on the peaks */}
            <polygon points="36,45 42,60 48,45" fill="#0D9668" opacity="0.3" />
            <polygon points="72,45 78,60 84,45" fill="#0D9668" opacity="0.3" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            M1 — Jaw Bite · Upper teeth form M peaks
          </p>
        </div>
      </div>
    </div>
  );
}
