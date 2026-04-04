export function SharkM2() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center gap-2">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <rect x="5" y="5" width="130" height="130" rx="26" fill="#145374" />
            {/* Dorsal fin — tall and sharp */}
            <polygon points="70,4 58,28 82,28" fill="#2e8bc0" />
            <polygon points="70,4 64,20 76,20" fill="#b1d4e0" opacity="0.4" />
            {/* Side fins — sweeping */}
            <polygon points="8,72 24,52 30,75" fill="#2e8bc0" />
            <polygon points="132,72 116,52 110,75" fill="#2e8bc0" />
            {/* Triple fang M (M4 style) — 3 teeth: down-up-down */}
            <rect x="24" y="40" width="12" height="65" rx="1" fill="#fff" />
            <rect x="104" y="40" width="12" height="65" rx="1" fill="#fff" />
            <polygon points="36,40 58,40 47,80" fill="#fff" />
            <polygon points="58,105 70,55 82,105" fill="#fff" />
            <polygon points="82,40 104,40 93,80" fill="#fff" />
            {/* Shark eyes — slitted and fierce */}
            <ellipse cx="50" cy="36" rx="5" ry="3.5" fill="#b1d4e0" />
            <ellipse cx="90" cy="36" rx="5" ry="3.5" fill="#b1d4e0" />
            <ellipse cx="51" cy="36" rx="2" ry="3" fill="#0c2d48" />
            <ellipse cx="91" cy="36" rx="2" ry="3" fill="#0c2d48" />
          </svg>
        </div>
        <div className="space-y-1">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            S2 — Triple Fang + Slitted Eyes + Swept Fins
          </p>
        </div>
      </div>
    </div>
  );
}
