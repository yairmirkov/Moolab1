export function Navigation() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center">
          <svg width="180" height="230" viewBox="0 0 180 230" fill="none">
            <defs>
              <linearGradient id="nav-grad" x1="0.5" y1="1" x2="0.5" y2="0">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              <filter id="nav-glow">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            {/* Glow */}
            <path d="M90 10 L68 80 L90 70 L112 80 Z" fill="#0ea5e9" opacity="0.1" filter="url(#nav-glow)" />
            {/* Compass circle — outer ring */}
            <circle cx="90" cy="80" r="48" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.2" />
            <circle cx="90" cy="80" r="44" fill="none" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.12" />
            {/* Compass ticks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const major = angle % 90 === 0;
              const x1 = 90 + Math.cos(rad) * (major ? 42 : 44);
              const y1 = 80 + Math.sin(rad) * (major ? 42 : 44);
              const x2 = 90 + Math.cos(rad) * 48;
              const y2 = 80 + Math.sin(rad) * 48;
              return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0ea5e9" strokeWidth={major ? 1.5 : 0.8} opacity={major ? 0.5 : 0.25} />;
            })}
            {/* Cardinal labels */}
            <text x="90" y="28" textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="700" fontFamily="'Inter', sans-serif" opacity="0.4">N</text>
            <text x="90" y="137" textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="700" fontFamily="'Inter', sans-serif" opacity="0.25">S</text>
            <text x="37" y="82" textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="700" fontFamily="'Inter', sans-serif" opacity="0.25">W</text>
            <text x="143" y="82" textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="700" fontFamily="'Inter', sans-serif" opacity="0.25">E</text>
            {/* Dorsal fin + compass needle — unified shape pointing UP */}
            {/* The fin IS the needle */}
            <path d="M90 12 L80 78 L90 72 L100 78 Z" fill="url(#nav-grad)" opacity="0.9" />
            {/* South needle (subtle) */}
            <path d="M90 148 L85 85 L90 88 L95 85 Z" fill="#0c4a6e" opacity="0.3" />
            {/* Center pivot */}
            <circle cx="90" cy="80" r="4" fill="#0a0a0a" stroke="#0ea5e9" strokeWidth="1.5" />
            <circle cx="90" cy="80" r="1.5" fill="#38bdf8" />
            {/* MOOLAB */}
            <text x="90" y="172" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontSize="20" letterSpacing="0.18em" opacity="0.9">MOOLAB</text>
            <text x="90" y="187" textAnchor="middle" fill="#38bdf8" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" fontSize="7" letterSpacing="0.3em" opacity="0.35">.APP</text>
          </svg>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#475569", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>
          The Navigation — Dorsal Fin Compass
        </p>
      </div>
    </div>
  );
}
