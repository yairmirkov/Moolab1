export function SharkTooth() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <svg width="42" height="48" viewBox="0 0 42 52" fill="none">
            <polygon points="21,2 40,50 2,50" fill="#0D9668" />
            <polygon points="21,16 30,42 12,42" fill="#fff" />
            <polygon points="21,28 26,42 16,42" fill="#0D9668" />
          </svg>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "28px", letterSpacing: "-0.02em", color: "#0D9668" }}>
            MOOLAB
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
          E — Shark Tooth · Layered triangle / fang
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="bg-[#0a0a0a] rounded-xl px-5 py-3 flex items-center gap-2.5">
            <svg width="18" height="22" viewBox="0 0 42 52" fill="none">
              <polygon points="21,2 40,50 2,50" fill="#0D9668" />
              <polygon points="21,16 30,42 12,42" fill="#0a0a0a" />
              <polygon points="21,28 26,42 16,42" fill="#0D9668" />
            </svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "13px", color: "#0D9668", letterSpacing: "0.04em" }}>MOOLAB</span>
          </div>
          <span style={{ fontSize: "10px", color: "#aaa" }}>on dark</span>
        </div>
      </div>
    </div>
  );
}
