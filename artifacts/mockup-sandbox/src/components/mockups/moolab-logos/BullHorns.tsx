export function BullHorns() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <path d="M8 12 Q8 4 16 8 L28 20 L28 28 L16 18 Q12 14 8 12Z" fill="#0D9668" />
            <path d="M56 12 Q56 4 48 8 L36 20 L36 28 L48 18 Q52 14 56 12Z" fill="#0D9668" />
            <path d="M24 24 L24 52 L28 52 L28 24 Z" fill="#0D9668" opacity="0.5" />
            <path d="M30 20 L30 52 L34 52 L34 20 Z" fill="#0D9668" opacity="0.7" />
            <path d="M36 24 L36 52 L40 52 L40 24 Z" fill="#0D9668" />
            <line x1="20" y1="52" x2="44" y2="52" stroke="#0D9668" strokeWidth="3" />
          </svg>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "28px", letterSpacing: "-0.02em", color: "#0D9668" }}>
            MOOLAB
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          C — Bull Horns · Bull market + growth bars
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="bg-[#0a0a0a] rounded-xl px-5 py-3 flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
              <path d="M8 12 Q8 4 16 8 L28 20 L28 28 L16 18 Q12 14 8 12Z" fill="#0D9668" />
              <path d="M56 12 Q56 4 48 8 L36 20 L36 28 L48 18 Q52 14 56 12Z" fill="#0D9668" />
              <path d="M24 24 L24 52 L28 52 L28 24 Z" fill="#0D9668" opacity="0.5" />
              <path d="M30 20 L30 52 L34 52 L34 20 Z" fill="#0D9668" opacity="0.7" />
              <path d="M36 24 L36 52 L40 52 L40 24 Z" fill="#0D9668" />
              <line x1="20" y1="52" x2="44" y2="52" stroke="#0D9668" strokeWidth="3" />
            </svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "13px", color: "#0D9668", letterSpacing: "0.04em" }}>MOOLAB</span>
          </div>
          <span style={{ fontSize: "10px", color: "#aaa" }}>on dark</span>
        </div>
      </div>
    </div>
  );
}
