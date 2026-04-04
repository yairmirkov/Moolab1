export function CrownTeeth() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="5" y="5" width="110" height="110" rx="22" fill="#0D9668" />
            {/* M as a row of shark teeth — jagged crown shape */}
            {/* The entire M is one continuous jagged tooth shape */}
            <polygon points="18,90 18,35 28,35 40,70 50,28 60,60 70,28 80,70 92,35 102,35 102,90 92,90 92,50 82,80 70,42 60,75 50,42 40,80 28,50 28,90" fill="#fff" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            M3 — Crown Teeth · Jagged tooth-row forms M silhouette
          </p>
        </div>
      </div>
    </div>
  );
}
