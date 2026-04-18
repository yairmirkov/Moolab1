import { useEffect, useState } from "react";
import vaultPhoneImg from "@assets/2Iehj_(1)_1776470240857.jpg";
import heroVideoSrc from "@assets/grok-video-a87d9c6d-11cc-4b74-83c2-1d1d7284be5c_1776470240857.mp4";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSent(true);
    setName(""); setEmail(""); setMessage("");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 px-6 bg-gradient-to-b from-sky-50/40 to-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/60 border border-sky-200/50 mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-[#145374] uppercase tracking-wider">Contact</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            Questions?{" "}
            <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">We're here to help.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0c2d48]/45 font-medium">
            Reach us directly at{" "}
            <a href="mailto:contact@moolab.app" className="text-[#145374] font-bold underline decoration-sky-300 underline-offset-4 hover:text-[#2e8bc0] transition-colors">
              contact@moolab.app
            </a>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-sky-200/60 p-6 sm:p-8 shadow-xl shadow-sky-100/40 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#0c2d48]/50 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-sky-50/40 text-sm font-semibold text-[#0c2d48] placeholder:text-[#0c2d48]/25 focus:outline-none focus:border-[#2e8bc0] focus:bg-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#0c2d48]/50 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-sky-50/40 text-sm font-semibold text-[#0c2d48] placeholder:text-[#0c2d48]/25 focus:outline-none focus:border-[#2e8bc0] focus:bg-white transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#0c2d48]/50 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-sky-200 bg-sky-50/40 text-sm font-semibold text-[#0c2d48] placeholder:text-[#0c2d48]/25 focus:outline-none focus:border-[#2e8bc0] focus:bg-white transition-all resize-none"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              className={`text-xs font-bold transition-all ${sent ? "text-[#145374] opacity-100" : "opacity-0"}`}
              role="status"
              aria-live="polite"
            >
              ✓ Message Sent! We'll be in touch shortly.
            </div>
            <button
              type="submit"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function LandingPage({ onParentLogin, onTestApp, onSignUp }: LandingPageProps) {
  const goSignUp = onSignUp ?? onTestApp ?? (() => {});
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`min-h-screen bg-white font-['Inter',system-ui,sans-serif] text-[#0c2d48] transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ overflowX: "hidden" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoolabLogo height={37} />
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="?lang=es"
              onClick={() => { localStorage.setItem("ws_lang", "es"); }}
              className="px-3 py-2 rounded-full text-[#0c2d48]/40 font-bold text-xs tracking-wide hover:text-[#145374] hover:bg-sky-50 transition-all duration-200"
            >
              ES
            </a>
            <button
              onClick={onParentLogin}
              className="px-4 py-2 rounded-full border border-sky-200 text-[#145374] font-bold text-xs sm:text-sm tracking-wide hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={goSignUp}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-24 sm:pt-28 pb-20 sm:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-white to-white" />
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute top-40 right-[5%] w-48 h-48 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-[2rem] sm:text-5xl md:text-[3.5rem] font-black tracking-tight leading-[1.1] mb-6 sm:mb-8">
            Stop Fighting Screen Time.
            <br />
            <span className="bg-gradient-to-r from-[#0c2d48] via-[#145374] to-[#2e8bc0] bg-clip-text text-transparent whitespace-nowrap">
              Turn It Into Financial Literacy.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#0c2d48]/55 font-medium max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            The gamified financial simulator for kids and teens. They learn the rules of money in 5 minutes a day, trade in a risk-free simulator, and build habits that last a lifetime.
          </p>
          <button
            onClick={goSignUp}
            className="px-9 py-4 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-sky-300/30 hover:shadow-sky-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Start Now &#x26A1;
          </button>
          <p className="text-xs text-[#0c2d48]/30 font-medium mt-5">Free to start · No ads · Safe for kids</p>
        </div>
      </section>

      {/* SHOWCASE: PHONE + VIDEO */}
      <section className="relative py-16 sm:py-24 px-6 overflow-hidden bg-gradient-to-b from-white via-sky-50/40 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-[8%] w-72 h-72 rounded-full bg-sky-300/15 blur-3xl" />
          <div className="absolute bottom-1/4 right-[10%] w-80 h-80 rounded-full bg-[#2e8bc0]/15 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/60 border border-sky-200/50 mb-4">
              <span className="text-[10px] sm:text-xs font-bold text-[#145374] uppercase tracking-wider">See it in action</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              A swipe-based experience kids{" "}
              <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">already love.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
            {/* Video card */}
            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#2e8bc0]/25 via-sky-200/20 to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
              <div
                className="relative rounded-3xl overflow-hidden border border-sky-200/60 bg-[#0c2d48] shadow-2xl shadow-sky-300/30"
                style={{ aspectRatio: "9 / 16", maxHeight: 560 }}
              >
                <video
                  src={heroVideoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl" />
              </div>
              <div className="mt-5 text-center">
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-[#2e8bc0] mb-1">The Lab</div>
                <div className="text-sm font-bold text-[#0c2d48]/65">Bite-sized lessons. Built for the swipe generation.</div>
              </div>
            </div>

            {/* Phone image */}
            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-amber-200/20 via-sky-300/25 to-[#2e8bc0]/20 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center" style={{ minHeight: 480 }}>
                <img
                  src={vaultPhoneImg}
                  alt="The Vault — spend Moolies on epic rewards"
                  className="relative w-full max-w-[360px] h-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-1"
                  style={{ filter: "drop-shadow(0 30px 50px rgba(20, 83, 116, 0.35))" }}
                />
              </div>
              <div className="mt-5 text-center">
                <div className="text-[10px] font-black tracking-[0.2em] uppercase text-[#2e8bc0] mb-1">The Vault</div>
                <div className="text-sm font-bold text-[#0c2d48]/65">Earn Moolies. Unlock rewards. No real money. Ever.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-16 sm:py-24 px-6 border-y border-sky-100/60 bg-sky-50/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-sky-200/60 mb-5">
            <span className="text-[10px] sm:text-xs font-bold text-[#145374] uppercase tracking-wider">The Problem</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-5 leading-tight">
            Schools aren't teaching them{" "}
            <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">how money works.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#0c2d48]/55 font-medium leading-relaxed max-w-2xl mx-auto">
            Piggy banks don't teach them to invest, and real trading apps are too dangerous. We built the bridge.
          </p>
        </div>
      </section>

      {/* FEATURES — THREE COLUMN */}
      <section id="features" className="py-16 sm:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              Three pillars.{" "}
              <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">One financial fluency.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#0c2d48]/45 font-medium max-w-lg mx-auto">
              Learning, practice, and reward — all in one safe, closed environment built for families.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                emoji: "🧪",
                name: "The Lab",
                desc: "Bite-sized, AI-driven lessons on credit, savings, and investing using a familiar swipe interface.",
              },
              {
                emoji: "🦈",
                name: "The Tank",
                desc: "A risk-free simulator using real-world stock market data.",
              },
              {
                emoji: "🏦",
                name: "The Vault",
                desc: "A closed economy where they earn Moolies for learning and spend them on app customization.",
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
              <span>✓ Zero real money traded.</span>
              <span className="text-[#0c2d48]/20">•</span>
              <span>✓ Strictly NO crypto.</span>
              <span className="text-[#0c2d48]/20">•</span>
              <span>✓ Safe, closed environment.</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28 px-6" style={{ background: "linear-gradient(135deg, #0c2d48 0%, #145374 50%, #0c2d48 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-white leading-tight">
            Give them the financial foundation
            <br />
            <span style={{ color: "#b1d4e0" }}>you wish you had.</span>
          </h2>
          <p className="text-sm sm:text-base font-semibold mb-10" style={{ color: "rgba(177,212,224,0.55)" }}>
            5 minutes a day. A lifetime of fluency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onTestApp}
              className="px-8 py-3.5 rounded-full font-bold text-sm sm:text-base tracking-wide shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
                color: "#0c2d48",
                boxShadow: "0 4px 30px rgba(46,139,192,0.35), 0 0 60px rgba(46,139,192,0.15)",
              }}
            >
              Sign Up
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
              Log In
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
              Building the next generation of financially literate leaders.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-[#145374]">
            <button
              onClick={() => scrollToId("contact")}
              className="hover:text-[#2e8bc0] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <a
              href="/privacy"
              className="hover:text-[#2e8bc0] transition-colors"
            >
              Privacy Policy
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
