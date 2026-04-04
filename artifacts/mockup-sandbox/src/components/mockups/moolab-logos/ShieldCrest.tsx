export function ShieldCrest() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <svg width="44" height="48" viewBox="0 0 44 52" fill="none">
            <path d="M22 2 L40 10 L40 28 Q40 42 22 50 Q4 42 4 28 L4 10 Z" fill="#0D9668" />
            <path d="M14 30 L14 22 L18 22 L18 30 Z" fill="#fff" opacity="0.5" />
            <path d="M20 30 L20 18 L24 18 L24 30 Z" fill="#fff" opacity="0.7" />
            <path d="M26 30 L26 14 L30 14 L30 30 Z" fill="#fff" />
            <path d="M22 2 L40 10 L40 28 Q40 42 22 50 Q4 42 4 28 L4 10 Z" fill="none" stroke="#0D9668" strokeWidth="2" />
          </svg>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "28px", letterSpacing: "-0.02em", color: "#0D9668" }}>
            MOOLAB
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          B — Shield Crest · Growth bars inside shield
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="bg-[#0a0a0a] rounded-xl px-5 py-3 flex items-center gap-2.5">
            <svg width="18" height="22" viewBox="0 0 44 52" fill="none">
              <path d="M22 2 L40 10 L40 28 Q40 42 22 50 Q4 42 4 28 L4 10 Z" fill="#0D9668" />
              <path d="M14 30 L14 22 L18 22 L18 30 Z" fill="#fff" opacity="0.5" />
              <path d="M20 30 L20 18 L24 18 L24 30 Z" fill="#fff" opacity="0.7" />
              <path d="M26 30 L26 14 L30 14 L30 30 Z" fill="#fff" />
            </svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "13px", color: "#0D9668", letterSpacing: "0.04em" }}>MOOLAB</span>
          </div>
          <span style={{ fontSize: "10px", color: "#aaa" }}>on dark</span>
        </div>
      </div>
    </div>
  );
}
