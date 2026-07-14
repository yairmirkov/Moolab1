import { useEffect, useState } from "react";
import { api } from "./api";

const MoolabLogo = ({ height = 32, glow = false }: { height?: number; glow?: boolean }) => (
  <img
    src="/moolab-logo-trimmed.png"
    alt="Moolab"
    style={{
      height,
      width: "auto",
      objectFit: "contain",
      ...(glow ? {
        filter: "drop-shadow(0 0 6px #2e8bc0) drop-shadow(0 0 14px rgba(46,139,192,0.4))",
        animation: "logoGlow 2s ease-in-out infinite",
      } : {}),
    }}
  />
);

interface LandingPageProps {
  onParentLogin: () => void;
  onTestApp?: () => void;
  onSignUp?: () => void;
}

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await api.sendContact(name.trim(), email.trim(), message.trim(), "es");
      setSent(true);
      setName(""); setEmail(""); setMessage("");
    } catch (err: any) {
      setError(err?.message || "No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 px-6 bg-gradient-to-b from-sky-50/40 to-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/60 border border-sky-200/50 mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-[#145374] uppercase tracking-wider">Contacto</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            ¿Preguntas?{" "}
            <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">Estamos para ayudarte.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0c2d48]/45 font-medium">
            Escríbenos directamente a{" "}
            <a href="mailto:contact@moolab.app" className="text-[#145374] font-bold underline decoration-sky-300 underline-offset-4 hover:text-[#2e8bc0] transition-colors">
              contact@moolab.app
            </a>
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-sky-200/60 p-8 sm:p-12 shadow-xl shadow-sky-100/40 text-center animate-[fadeInUp_0.4s_ease-out]">
            <style>{`
              @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes checkPop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
              @keyframes ringPulse { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.7); opacity: 0; } }
            `}</style>
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div aria-hidden className="absolute inset-0 rounded-full bg-sky-300/40" style={{ animation: "ringPulse 1.6s ease-out infinite" }} />
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #2e8bc0, #145374)",
                  boxShadow: "0 8px 32px rgba(46,139,192,0.5), inset 0 2px 8px rgba(255,255,255,0.3)",
                  animation: "checkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">
              ¡Mensaje enviado! 🎉
            </h3>
            <p className="text-sm sm:text-base text-[#0c2d48]/65 font-medium max-w-md mx-auto mb-6 leading-relaxed">
              Gracias por escribirnos. Nuestro equipo te responderá a tu correo en menos de 24 horas.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="px-6 py-2.5 rounded-full bg-sky-50 border border-sky-200 text-[#145374] font-bold text-xs tracking-wide hover:bg-sky-100 transition-all cursor-pointer"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-sky-200/60 p-6 sm:p-8 shadow-xl shadow-sky-100/40 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#0c2d48]/50 mb-1.5">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-sky-50/40 text-sm font-semibold text-[#0c2d48] placeholder:text-[#0c2d48]/25 focus:outline-none focus:border-[#2e8bc0] focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#0c2d48]/50 mb-1.5">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-sky-50/40 text-sm font-semibold text-[#0c2d48] placeholder:text-[#0c2d48]/25 focus:outline-none focus:border-[#2e8bc0] focus:bg-white transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#0c2d48]/50 mb-1.5">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="¿En qué podemos ayudarte?"
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-sky-50/40 text-sm font-semibold text-[#0c2d48] placeholder:text-[#0c2d48]/25 focus:outline-none focus:border-[#2e8bc0] focus:bg-white transition-all resize-none"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              className={`text-xs font-bold transition-all ${error ? "text-rose-600 opacity-100" : "opacity-0"}`}
              role="status"
              aria-live="polite"
            >
              {error ? `✕ ${error}` : "placeholder"}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {sending ? "Enviando..." : "Enviar mensaje"}
            </button>
          </div>
        </form>
        )}
      </div>
    </section>
  );
}

export default function LandingPageES({ onParentLogin, onTestApp, onSignUp }: LandingPageProps) {
  const goSignUp = onSignUp ?? onTestApp ?? (() => {});
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`min-h-screen bg-white font-['Bricolage_Grotesque','Lato',system-ui,sans-serif] text-[#0c2d48] transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ overflowX: "hidden" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoolabLogo height={37} />
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="?lang=en"
              onClick={() => { localStorage.setItem("ws_lang", "en"); }}
              className="px-3 py-2 rounded-full text-[#0c2d48]/40 font-bold text-xs tracking-wide hover:text-[#145374] hover:bg-sky-50 transition-all duration-200"
            >
              EN
            </a>
            <button
              onClick={onParentLogin}
              className="px-4 py-2 rounded-full border border-sky-200 text-[#145374] font-bold text-xs sm:text-sm tracking-wide hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={goSignUp}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-white to-white" />
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute top-40 right-[5%] w-48 h-48 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0c2d48]/5 border border-[#0c2d48]/10 mb-7">
            <span style={{ fontSize: "1rem" }}>🦈</span>
            <span className="text-xs font-bold text-[#145374] tracking-wide">Piensa en Shark Tank más Duolingo — para niños</span>
          </div>
          <h1
            className="font-black tracking-tight leading-[1.1] mb-6 sm:mb-8"
            style={{ fontSize: "clamp(1.875rem, 6vw, 3.5rem)" }}
          >
            Deja de pelear con las pantallas.
            <br />
            <span className="bg-gradient-to-r from-[#0c2d48] via-[#145374] to-[#2e8bc0] bg-clip-text text-transparent">
              Conviértelas en educación financiera.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#0c2d48]/55 font-medium max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            El simulador financiero gamificado para niños y adolescentes. Aprenden las reglas del dinero en 5 minutos al día, invierten en un simulador sin riesgo y forman hábitos que duran toda la vida.
          </p>
          <button
            onClick={goSignUp}
            className="px-9 py-4 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-sky-300/30 hover:shadow-sky-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Empieza Gratis &#x26A1;
          </button>
          <p className="text-xs text-[#0c2d48]/30 font-medium mt-5">Gratis para empezar · Sin anuncios · Seguro para niños</p>
          <p className="text-[10px] text-[#0c2d48]/40 font-medium mt-2">Moolab = moola (dinero) + lab (laboratorio). El lugar donde se crea la fluidez financiera.</p>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-16 sm:py-24 px-6 border-y border-sky-100/60 bg-sky-50/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-sky-200/60 mb-5">
            <span className="text-[10px] sm:text-xs font-bold text-[#145374] uppercase tracking-wider">El Problema</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-5 leading-tight">
            Las escuelas no enseñan{" "}
            <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">cómo funciona el dinero.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#0c2d48]/55 font-medium leading-relaxed max-w-2xl mx-auto">
            Las alcancías no enseñan a invertir, y las apps reales de inversión son demasiado peligrosas. Nosotros construimos el puente entre el juego de la infancia y la confianza financiera.
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="py-10 sm:py-12 px-6 bg-white border-b border-sky-100/60">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "5 min", label: "Al día es todo lo que necesitan" },
              { value: "K–12", label: "Todos los grados cubiertos" },
              { value: "$0", label: "De dinero real en riesgo" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-black text-[#145374] tracking-tight">{stat.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-[#0c2d48]/45 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP PREVIEW */}
      <section className="py-16 sm:py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-left">
            <p className="text-xs font-bold text-[#145374] uppercase tracking-[0.15em] mb-3">Dentro de la app</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0c2d48] mb-4 leading-tight">
              El centro de mando financiero<br />de tu hijo.
            </h2>
            <p className="text-sm sm:text-base text-[#0c2d48]/55 font-medium leading-relaxed mb-6">
              Lecciones con IA, un simulador de bolsa en vivo y una economía de recompensas — todo en un solo lugar diseñado para cómo aprenden los niños de verdad.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: "🧠", text: "Lecciones cortas que se aprenden en 5 minutos" },
                { icon: "📈", text: "Datos reales del mercado, cero riesgo real" },
                { icon: "🏆", text: "Recompensas que hacen adictivo el aprendizaje" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-semibold text-[#0c2d48]/70">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-center">
            <div style={{
              width: 260,
              background: "#0a1629",
              borderRadius: 36,
              padding: "14px 10px",
              boxShadow: "0 40px 80px rgba(12,45,72,0.25), 0 0 0 8px #0c2d48",
            }}>
              <div style={{ borderRadius: 28, overflow: "hidden", background: "#0a1629" }}>
                <div style={{ padding: "10px 18px 6px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(177,212,224,0.4)", fontSize: 10, fontWeight: 700 }}>9:41</span>
                  <div style={{ width: 20, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, marginTop: 3 }} />
                </div>
                <div style={{ padding: "6px 18px 12px" }}>
                  <div style={{ color: "rgba(177,212,224,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>TIBURÓN NIVEL 4</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>El Laboratorio 🧪</div>
                    <div style={{ color: "#2e8bc0", fontSize: 11, fontWeight: 800 }}>1,240 XP</div>
                  </div>
                  <div style={{ marginTop: 7, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: "65%", height: "100%", background: "linear-gradient(90deg, #2e8bc0, #b1d4e0)", borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ margin: "0 10px 10px", background: "#0d1f35", borderRadius: 16, padding: "16px 14px" }}>
                  <div style={{ color: "rgba(177,212,224,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 7, textTransform: "uppercase" }}>LECCIÓN DE HOY</div>
                  <div style={{ color: "#fff", fontSize: 12, fontWeight: 900, marginBottom: 5, lineHeight: 1.4 }}>¿Qué es el interés compuesto?</div>
                  <div style={{ color: "rgba(177,212,224,0.5)", fontSize: 10, fontWeight: 600, lineHeight: 1.5, marginBottom: 12 }}>Dinero que genera dinero. El arma secreta de todo gran inversionista.</div>
                  <div style={{ background: "linear-gradient(135deg, #145374, #2e8bc0)", borderRadius: 10, padding: "9px 0", textAlign: "center", color: "#fff", fontWeight: 900, fontSize: 11 }}>Empezar Lección →</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "6px 10px 14px" }}>
                  {[{ v: "12🔥", l: "Racha" }, { v: "850", l: "Moolies" }, { v: "5", l: "Jefes" }].map((s) => (
                    <div key={s.l} style={{ textAlign: "center" }}>
                      <div style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>{s.v}</div>
                      <div style={{ color: "rgba(177,212,224,0.35)", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — THREE COLUMN */}
      <section id="features" className="py-16 sm:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              Tres pilares.{" "}
              <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">Una sola fluidez financiera.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#0c2d48]/45 font-medium max-w-lg mx-auto">
              Aprendizaje, práctica y recompensa — todo en un entorno cerrado y seguro, hecho para familias.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                emoji: "🧪",
                name: "El Laboratorio",
                desc: "Lecciones cortas guiadas por IA sobre crédito, ahorro e inversión, con la interfaz de deslizar que ya conocen.",
              },
              {
                emoji: "🦈",
                name: "El Tanque",
                desc: "Un simulador sin riesgo con datos reales del mercado bursátil.",
              },
              {
                emoji: "🏦",
                name: "La Bóveda",
                desc: "Una economía cerrada donde ganan Moolies por aprender y los gastan personalizando la app.",
              },
            ].map((card) => (
              <div
                key={card.name}
                className="relative rounded-2xl bg-white border border-sky-200/60 p-6 sm:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{ boxShadow: "0 4px 30px rgba(46,139,192,0.06)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#145374] to-[#2e8bc0]" />
                <div className="text-4xl mb-4 mt-1">{card.emoji}</div>
                <div className="text-lg sm:text-xl font-black text-[#145374] mb-2">{card.name}</div>
                <p className="text-sm text-[#0c2d48]/55 font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY GUARANTEE BANNER */}
      <section className="px-6 pb-4 sm:pb-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-2xl border border-sky-200/60 px-6 py-5 sm:py-6 text-center"
            style={{ background: "linear-gradient(135deg, rgba(177,212,224,0.25) 0%, rgba(46,139,192,0.08) 100%)" }}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold text-[#145374]">
              <span>✓ Cero dinero real en juego.</span>
              <span className="text-[#0c2d48]/20">•</span>
              <span>✓ Estrictamente SIN cripto.</span>
              <span className="text-[#0c2d48]/20">•</span>
              <span>✓ Entorno seguro y cerrado.</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28 px-6" style={{ background: "linear-gradient(135deg, #0c2d48 0%, #145374 50%, #0c2d48 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-white leading-tight">
            Dales la base financiera
            <br />
            <span style={{ color: "#b1d4e0" }}>que tú hubieras querido tener.</span>
          </h2>
          <p className="text-sm sm:text-base font-semibold mb-3" style={{ color: "rgba(177,212,224,0.55)" }}>
            5 minutos al día. Una vida entera de fluidez financiera.
          </p>
          <p className="text-xs font-medium mb-10" style={{ color: "rgba(177,212,224,0.3)" }}>
            Únete a las familias que están criando a la próxima generación de niños con confianza financiera.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={goSignUp}
              className="px-8 py-3.5 rounded-full font-bold text-sm sm:text-base tracking-wide shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
                color: "#0c2d48",
                boxShadow: "0 4px 30px rgba(46,139,192,0.35), 0 0 60px rgba(46,139,192,0.15)",
              }}
            >
              Registrarse
            </button>
            <button
              onClick={onParentLogin}
              className="px-8 py-3.5 rounded-full font-bold text-sm sm:text-base tracking-wide border-2 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
              style={{
                borderColor: "rgba(177,212,224,0.4)",
                color: "#b1d4e0",
                background: "transparent",
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-sky-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <MoolabLogo height={32} />
            <p className="text-[10px] text-[#0c2d48]/30 font-medium">
              Construyendo la próxima generación de líderes financieramente inteligentes.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-[#145374]">
            <button
              onClick={() => scrollToId("contact")}
              className="hover:text-[#2e8bc0] transition-colors cursor-pointer"
            >
              Contacto
            </button>
            <a
              href="/privacy"
              className="hover:text-[#2e8bc0] transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="mailto:contact@moolab.app"
              className="hover:text-[#2e8bc0] transition-colors hidden sm:inline"
            >
              contact@moolab.app
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 6px #2e8bc0) drop-shadow(0 0 14px rgba(46,139,192,0.4)); }
          50% { filter: drop-shadow(0 0 10px #2e8bc0) drop-shadow(0 0 20px rgba(46,139,192,0.6)); }
        }
      `}</style>
    </div>
  );
}
