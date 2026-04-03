export function MintFresh() {
  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(160deg, #f0faf4 0%, #e6f7ed 30%, #d4f1e0 60%, #f5faf7 100%)",
      color: "#1a3c2a", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 20,
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
      `}</style>

      <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)",top:"10%",left:"-15%",filter:"blur(60px)"}} />
      <div style={{position:"absolute",width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,0.08) 0%,transparent 70%)",bottom:"15%",right:"-10%",filter:"blur(60px)"}} />

      <div style={{fontSize:"4rem",marginBottom:8,animation:"float 3s ease-in-out infinite",filter:"drop-shadow(0 0 25px rgba(16,185,129,0.3))"}}>💸</div>
      <h1 style={{
        fontSize: "3.2rem", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 6px 0", textAlign: "center",
        background: "linear-gradient(135deg, #059669, #10b981, #047857)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>WealthScroll</h1>
      <p style={{
        color: "rgba(26,60,42,0.35)", fontWeight: 800, letterSpacing: "0.2em", fontSize: "0.65rem",
        marginBottom: 6, textTransform: "uppercase",
        animation: "pulse 3s ease-in-out infinite",
      }}>SWIPE · LEARN · EARN</p>
      <p style={{ color: "rgba(26,60,42,0.4)", fontSize: "0.75rem", fontWeight: 600, maxWidth: 280, textAlign: "center", lineHeight: 1.5, marginBottom: 36 }}>
        Financial literacy for kids & teens. Learn money skills through bite-sized lessons and games.
      </p>

      <button style={{
        width: "100%", maxWidth: 340, padding: "18px 40px", borderRadius: 18,
        border: "none", fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(135deg, #10b981, #34d399)",
        color: "#fff", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "0.06em",
        cursor: "pointer",
        boxShadow: "0 0 40px rgba(16,185,129,0.2), 0 8px 24px rgba(0,0,0,0.08)",
      }}>
        GET STARTED
      </button>
      <p style={{ color: "rgba(26,60,42,0.2)", fontSize: "0.6rem", fontWeight: 600, marginTop: 14 }}>
        Free · No ads · Safe for kids
      </p>

      <div style={{ position: "absolute", bottom: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["#10b981","#34d399","#059669","#d4f1e0","#f0faf4"].map((c,i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "2px solid rgba(26,60,42,0.15)" }} />
          ))}
        </div>
        <span style={{ color: "rgba(26,60,42,0.3)", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em", marginTop: 4 }}>MINT FRESH PALETTE</span>
      </div>
    </div>
  );
}
