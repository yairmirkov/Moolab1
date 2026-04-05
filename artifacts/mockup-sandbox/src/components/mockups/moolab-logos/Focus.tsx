export function Focus() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <svg width="180" height="230" viewBox="0 0 180 230" fill="none">
            <defs>
              <linearGradient id="focus-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              <radialGradient id="focus-eye-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
              <filter id="focus-blur">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>
            {/* Eye glow aura */}
            <circle cx="90" cy="65" r="40" fill="url(#focus-eye-glow)" />
            {/* Outer eye shape — almond/ancient */}
            <path d="M42 65 Q66 38 90 35 Q114 38 138 65 Q114 92 90 95 Q66 92 42 65Z" fill="none" stroke="url(#focus-grad)" strokeWidth="2" />
            {/* Inner iris ring */}
            <circle cx="90" cy="65" r="22" fill="none" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.6" />
            {/* Pupil */}
            <circle cx="90" cy="65" r="12" fill="#0c4a6e" />
            <circle cx="90" cy="65" r="8" fill="#0a1628" />
            {/* Pupil highlight */}
            <circle cx="86" cy="61" r="3" fill="#38bdf8" opacity="0.7" />
            <circle cx="94" cy="68" r="1.5" fill="#38bdf8" opacity="0.4" />
            {/* Iris detail lines */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 90 + Math.cos(rad) * 13;
              const y1 = 65 + Math.sin(rad) * 13;
              const x2 = 90 + Math.cos(rad) * 21;
              const y2 = 65 + Math.sin(rad) * 21;
              return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0ea5e9" strokeWidth="0.5" opacity="0.3" />;
            })}
            {/* Gill slits — 5 elegant parallel lines below eye */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={62 + i * 4} y1={108 + i * 2} x2={62 + i * 4} y2={120 + i * 1.5} stroke="#0ea5e9" strokeWidth="1.2" opacity={0.6 - i * 0.08} strokeLinecap="round" />
            ))}
            {/* Mirror gill slits on right */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={`r${i}`} x1={118 - i * 4} y1={108 + i * 2} x2={118 - i * 4} y2={120 + i * 1.5} stroke="#0ea5e9" strokeWidth="1.2" opacity={0.6 - i * 0.08} strokeLinecap="round" />
            ))}
            {/* MOOLAB */}
            <text x="90" y="158" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="20" letterSpacing="0.18em" opacity="0.9">MOOLAB</text>
            <text x="90" y="173" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" fontSize="7" letterSpacing="0.3em" opacity="0.35">.APP</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
          The Focus — All-Seeing Eye + Gills
        </p>
      </div>
    </div>
  );
}
