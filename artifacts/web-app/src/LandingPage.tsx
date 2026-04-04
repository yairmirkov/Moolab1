import { useEffect, useState } from "react";

const MoolabLogo = ({ size = 32, glow = false }: { size?: number; glow?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={glow ? {
      filter: "drop-shadow(0 0 6px #2e8bc0) drop-shadow(0 0 14px rgba(46,139,192,0.4))",
      animation: "logoGlow 2s ease-in-out infinite",
    } : undefined}
  >
    <rect x="6" y="46" width="7" height="12" fill="#2e8bc0" opacity="0.3" rx="1" />
    <rect x="17" y="38" width="7" height="20" fill="#2e8bc0" opacity="0.5" rx="1" />
    <rect x="28" y="28" width="7" height="30" fill="#2e8bc0" opacity="0.7" rx="1" />
    <path d="M39 58 L39 20 L46 20 L46 58 Z" fill="#2e8bc0" opacity="0.85" />
    <path d="M46 20 L46 4 L58 4 L46 20Z" fill="#145374" />
    <path d="M46 4 L58 4 L52 12 Z" fill="#145374" opacity="0.5" />
  </svg>
);

interface LandingPageProps {
  onParentLogin: () => void;
  onTestApp?: () => void;
}

const AppStoreBadge = () => (
  <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-105 active:scale-95 transition-transform duration-200">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" className="h-[44px]">
      <rect width="120" height="40" rx="5" fill="#000"/>
      <path d="M24.77 20.3a4.95 4.95 0 012.36-4.15 5.07 5.07 0 00-3.99-2.16c-1.68-.18-3.31 1.01-4.17 1.01-.87 0-2.18-.99-3.59-.96a5.31 5.31 0 00-4.47 2.72c-1.93 3.34-.49 8.27 1.36 10.97.93 1.33 2.01 2.82 3.44 2.76 1.39-.06 1.91-.88 3.59-.88 1.67 0 2.15.88 3.59.85 1.49-.03 2.43-1.33 3.33-2.67a11.02 11.02 0 001.51-3.09 4.77 4.77 0 01-2.96-4.4zM22.04 12.21a4.87 4.87 0 001.11-3.49 4.96 4.96 0 00-3.21 1.66 4.64 4.64 0 00-1.14 3.37 4.1 4.1 0 003.24-1.54z" fill="#fff"/>
      <g fill="#fff">
        <path d="M42.3 27.14h-4.73l-1.14 3.36H34.1l4.48-12.42h2.42l4.48 12.42h-2.36l-1.13-3.36zm-4.24-1.66h3.75l-1.85-5.45h-.05l-1.85 5.45zM55.16 25.97c0 2.81-1.51 4.62-3.78 4.62a3.07 3.07 0 01-2.85-1.58h-.04v4.48h-2.07V21.44h2v1.5h.04a3.21 3.21 0 012.89-1.6c2.3 0 3.81 1.82 3.81 4.63zm-2.13 0c0-1.83-.95-3.04-2.39-3.04-1.42 0-2.38 1.23-2.38 3.04 0 1.83.96 3.05 2.38 3.05 1.44 0 2.39-1.2 2.39-3.05zM65.12 25.97c0 2.81-1.5 4.62-3.77 4.62a3.07 3.07 0 01-2.85-1.58h-.04v4.48h-2.07V21.44h2v1.5h.03a3.21 3.21 0 012.9-1.6c2.3 0 3.8 1.82 3.8 4.63zm-2.13 0c0-1.83-.95-3.04-2.38-3.04-1.42 0-2.39 1.23-2.39 3.04 0 1.83.97 3.05 2.39 3.05 1.43 0 2.38-1.2 2.38-3.05zM71.71 27.04c.15 1.23 1.34 2.04 2.98 2.04 1.57 0 2.69-.81 2.69-1.92 0-.96-.68-1.54-2.3-1.93l-1.62-.39c-2.28-.55-3.34-1.62-3.34-3.34 0-2.14 1.87-3.61 4.52-3.61 2.62 0 4.42 1.47 4.48 3.61h-2.09c-.13-1.24-1.13-1.99-2.43-1.99s-2.3.76-2.3 1.86c0 .87.65 1.38 2.27 1.77l1.38.34c2.55.6 3.61 1.63 3.61 3.45 0 2.32-1.85 3.78-4.79 3.78-2.75 0-4.61-1.42-4.73-3.67h2.11z"/>
        <path d="M83.35 19.3v2.14h1.92v1.58h-1.92v5.1c0 .79.35 1.16 1.12 1.16a5.93 5.93 0 00.79-.05v1.57a6.63 6.63 0 01-1.33.11c-1.87 0-2.6-.7-2.6-2.49v-5.4h-1.47v-1.58h1.47V19.3h2.02zM86.07 25.97c0-2.85 1.68-4.64 4.3-4.64 2.63 0 4.31 1.79 4.31 4.64 0 2.86-1.67 4.64-4.31 4.64-2.64 0-4.3-1.78-4.3-4.64zm6.5 0c0-1.95-.9-3.1-2.2-3.1s-2.2 1.16-2.2 3.1c0 1.96.9 3.1 2.2 3.1s2.2-1.15 2.2-3.1zM96.19 21.44h1.97v1.54h.04a2.38 2.38 0 012.37-1.64 3.08 3.08 0 01.73.08v1.93a2.83 2.83 0 00-.97-.14 2.07 2.07 0 00-2.14 2.3v5h-2V21.44zM110.42 27.84c-.28 1.82-2.06 3.07-4.33 3.07-2.93 0-4.74-1.76-4.74-4.59s1.82-4.69 4.66-4.69c2.79 0 4.54 1.72 4.54 4.47v.71h-7.14v.12a2.6 2.6 0 002.69 2.82 2.26 2.26 0 002.31-1.41l2.01.5zm-7.02-2.7h5.07a2.4 2.4 0 00-2.44-2.54 2.52 2.52 0 00-2.63 2.54z"/>
      </g>
      <g fill="#fff">
        <text x="43" y="14" fontSize="8" fontFamily="system-ui" fontWeight="400" fill="#fff">Download on the</text>
      </g>
    </svg>
  </a>
);

const PlayStoreBadge = () => (
  <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="inline-block hover:scale-105 active:scale-95 transition-transform duration-200">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135 40" className="h-[44px]">
      <rect width="135" height="40" rx="5" fill="#000"/>
      <rect x="0.5" y="0.5" width="134" height="39" rx="4.5" stroke="#a6a6a6" strokeWidth="1" fill="none"/>
      <g transform="translate(10,7) scale(0.55)">
        <path d="M6.58 3.89c-.37.4-.58.97-.53 1.63v36.96c-.05.66.16 1.23.53 1.63l.09.08L27.2 23.74v-.53L6.67 3.81l-.09.08z" fill="#4285F4"/>
        <path d="M33.87 30.5l-6.67-6.76v-.53-.53l6.67-6.76.15.09 7.9 4.51c2.26 1.29 2.26 3.39 0 4.68l-7.9 4.51-.15.09v.7z" fill="#FBBC04"/>
        <path d="M34.02 29.81L27.2 22.95 6.58 44.11c.74.79 1.97.88 3.34.1l24.1-13.71v-.69z" fill="#EA4335"/>
        <path d="M34.02 16.08L9.92 2.37C8.55 1.59 7.32 1.68 6.58 2.48L27.2 22.95l6.82-6.87z" fill="#34A853"/>
      </g>
      <text x="47" y="13.5" fontSize="7" fontFamily="'Segoe UI','Roboto','Helvetica Neue',Arial,sans-serif" fontWeight="400" fill="#b3b3b3" letterSpacing="0.7">GET IT ON</text>
      <text x="47" y="28" fontSize="15" fontFamily="'Segoe UI','Roboto','Helvetica Neue',Arial,sans-serif" fontWeight="500" fill="#fff" letterSpacing="0.3">Google Play</text>
    </svg>
  </a>
);


const DownloadBadges = () => (
  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
    <AppStoreBadge />
    <PlayStoreBadge />
  </div>
);

export default function LandingPage({ onParentLogin, onTestApp }: LandingPageProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const scrollToDownload = () =>
    document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      className={`min-h-screen bg-white font-['Inter',system-ui,sans-serif] text-[#0c2d48] transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ overflowX: "hidden" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-sky-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoolabLogo size={30} glow />
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-lg font-black tracking-tight bg-gradient-to-r from-[#2e8bc0] to-[#145374] bg-clip-text text-transparent">
              MOOLAB
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="?lang=es"
              className="px-3 py-2 rounded-full text-[#0c2d48]/40 font-bold text-xs tracking-wide hover:text-[#145374] hover:bg-sky-50 transition-all duration-200"
            >
              ES
            </a>
            <button
              onClick={onParentLogin}
              className="px-4 py-2 rounded-full border border-sky-200 text-[#145374] font-bold text-xs sm:text-sm tracking-wide hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Parent Login
            </button>
            <button
              onClick={scrollToDownload}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Download App
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-white to-white" />
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="absolute top-40 right-[5%] w-48 h-48 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200/60 mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-[#2e8bc0] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-[#145374] tracking-wide uppercase">
              Building Financial Sharks Since Day One
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-5">
            STOP SCROLLING.
            <br />
            <span className="bg-gradient-to-r from-[#0c2d48] via-[#145374] to-[#2e8bc0] bg-clip-text text-transparent">
              START EARNING.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#0c2d48]/45 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
            The financial system is designed to keep your kids in the rat race. Moolab is the escape hatch. AI-powered financial mastery to build Sharks, not employees.
          </p>
          <div id="download-section" className="mb-8">
            <DownloadBadges />
            <p className="text-xs text-[#0c2d48]/25 font-medium mt-4">Free · No ads · Safe for kids</p>
            {onTestApp && (
              <button
                onClick={onTestApp}
                className="mt-3 text-xs text-[#2e8bc0]/60 font-semibold hover:text-[#145374] underline underline-offset-2 cursor-pointer transition-colors"
              >
                Try the web demo instead
              </button>
            )}
          </div>
          <div className="flex justify-center gap-10 sm:gap-14">
            {[
              { value: "8–21", label: "Age Range" },
              { value: "8", label: "Modules" },
              { value: "AI", label: "Powered" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#145374]">{s.value}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-[#0c2d48]/30 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-white to-sky-50/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              WARNING: THIS IS NOT
              <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent"> FOR EVERY FAMILY.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#0c2d48]/40 font-medium max-w-lg mx-auto">
              If your dream is for your kid to get a "safe" job, barely make rent, and spend 30 years paying off a mortgage... close this app. Moolab is for parents who want their kids to achieve financial freedom early. We teach healthy risk appetite, calculated leverage, and educated investments — not gambling. We are building the next generation of financial sharks.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "🦈", title: "Shark Mindset", desc: "Ownership over wages. Leverage over savings. Speed over waiting." },
              { icon: "🤖", title: "AI-Powered", desc: "Gemini AI generates aggressive, personalized wealth lessons every session." },
              { icon: "⚔️", title: "Boss Battles", desc: "Prove mastery under pressure. No participation trophies here." },
              { icon: "🏆", title: "Gamification", desc: "Earn XP, build streaks, level up, and track your dominance." },
            ].map((f) => (
              <div key={f.title} className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-sky-50/80 to-cyan-50/60 border border-sky-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
                <h3 className="text-sm sm:text-base font-extrabold mb-1.5 tracking-tight">{f.title}</h3>
                <p className="text-xs sm:text-sm text-[#0c2d48]/40 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              Three Identities.{" "}
              <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent">One Predator.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#0c2d48]/40 font-medium max-w-lg mx-auto">
              We don't water down the truth. We scale it to their age.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                emoji: "🌟", mode: "MATRIX BREAKER", ages: "Ages 8–12",
                desc: "Escaping the Matrix early. Teaching the mechanics of money, digital assets, and ownership before middle school.",
                topics: ["How money really works", "Digital asset ownership", "Building vs. buying"],
                accent: "emerald",
              },
              {
                emoji: "🔥", mode: "TEEN TYCOON", ages: "Ages 13–17",
                desc: "Mastering the creator economy, cash flow, and building leverage while others are just playing video games.",
                topics: ["High-velocity side hustles", "Trend recognition", "Aggressive reinvestment"],
                accent: "amber",
              },
              {
                emoji: "💎", mode: "APEX PREDATOR", ages: "Ages 18–21",
                desc: "Aggressive portfolio expansion, educated risk in high-volatility markets, and hacking the credit system.",
                topics: ["Capital leverage", "High-volatility assets", "Credit system mastery"],
                accent: "violet",
              },
            ].map((card) => {
              const colors = {
                emerald: { bg: "bg-sky-50", border: "border-sky-200/60", bar: "bg-[#2e8bc0]", text: "text-[#145374]" },
                amber: { bg: "bg-amber-50", border: "border-amber-200/60", bar: "bg-amber-400", text: "text-amber-600" },
                violet: { bg: "bg-violet-50", border: "border-violet-200/60", bar: "bg-violet-400", text: "text-violet-600" },
              }[card.accent];
              return (
                <div key={card.mode} className={`relative rounded-2xl ${colors.bg} border ${colors.border} p-6 sm:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bar}`} />
                  <div className="text-3xl mb-3 mt-1">{card.emoji}</div>
                  <div className={`text-[10px] font-black tracking-[0.2em] uppercase ${colors.text} mb-1`}>{card.mode} MODE</div>
                  <div className="text-xs font-bold text-[#0c2d48]/40 mb-3">{card.ages}</div>
                  <p className="text-xs sm:text-sm text-[#0c2d48]/50 font-medium leading-relaxed mb-4">{card.desc}</p>
                  <div className="space-y-1.5">
                    {card.topics.map((t) => (
                      <div key={t} className="flex items-center gap-2 text-[11px] font-semibold text-[#0c2d48]/40">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.bar}`} />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-sky-50/40 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/60 border border-sky-200/50 mb-5">
                <span className="text-[10px] sm:text-xs font-bold text-[#145374] uppercase tracking-wider">For Parents</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
                Parental
                <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent"> War Room</span>
              </h2>
              <p className="text-sm text-[#0c2d48]/45 font-medium leading-relaxed mb-6">
                Full operational intelligence on your child's financial training. Track every module conquered, every boss defeated, every level of mastery achieved.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: "📊", text: "Real-time XP, streak, and dominance tracking" },
                  { icon: "🎯", text: "Module-by-module conquest progress" },
                  { icon: "🧠", text: "Competency assessment and mastery insights" },
                  { icon: "👀", text: "Full transparency — see exactly what they're learning" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#0c2d48]/55">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-200/25 to-cyan-200/15 blur-2xl scale-110" />
              <div className="relative bg-white rounded-2xl border border-sky-200/50 shadow-xl p-5 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2e8bc0] to-[#145374] flex items-center justify-center text-white font-bold text-xs">J</div>
                  <div>
                    <div className="font-extrabold text-sm">Jordan's Progress</div>
                    <div className="text-[10px] text-[#0c2d48]/30 font-medium">Explorer Mode · Age 10</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "XP", value: "2,450", icon: "⚡" },
                    { label: "Streak", value: "7 days", icon: "🔥" },
                    { label: "Boss Wins", value: "4", icon: "🏆" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-sky-50 rounded-lg p-2.5 text-center">
                      <div className="text-base">{stat.icon}</div>
                      <div className="text-xs font-black text-[#145374]">{stat.value}</div>
                      <div className="text-[9px] font-semibold text-[#0c2d48]/25 uppercase">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Saving Basics", pct: 100 },
                    { name: "Smart Budgeting", pct: 67 },
                    { name: "Earning Money", pct: 33 },
                  ].map((m) => (
                    <div key={m.name}>
                      <div className="flex justify-between text-[10px] font-semibold mb-0.5">
                        <span className="text-[#0c2d48]/50">{m.name}</span>
                        <span className="text-[#145374]">{m.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#145374] to-[#2e8bc0]" style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/50 mb-5">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Mastermind
            <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent"> Arsenal</span>
          </h2>
          <p className="text-sm text-[#0c2d48]/40 font-medium max-w-md mx-auto mb-10">
            For families who refuse to raise average. Unlock the full weapons cache.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-2xl mx-auto mb-10">
            {[
              { icon: "♾️", title: "Unlimited Scrolls", desc: "No daily limits — infinite reps build infinite edge." },
              { icon: "📈", title: "War Room Analytics", desc: "Deep performance intelligence on mastery velocity and gaps." },
              { icon: "🎓", title: "Elite Modules", desc: "Exclusive topics: leverage strategies, crypto mechanics, empire building." },
            ].map((perk) => (
              <div key={perk.title} className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center">
                <div className="text-2xl mb-2">{perk.icon}</div>
                <h3 className="text-xs font-extrabold tracking-tight mb-1.5">{perk.title}</h3>
                <p className="text-[11px] text-[#0c2d48]/40 font-medium leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-white to-sky-50/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-4"><MoolabLogo size={48} glow /></div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
            Raise a Shark
            <span className="bg-gradient-to-r from-[#0c2d48] to-[#2e8bc0] bg-clip-text text-transparent"> Today.</span>
          </h2>
          <p className="text-sm text-[#0c2d48]/35 font-medium mb-8 max-w-md mx-auto">
            Free to start. No ads. No data selling. Just aggressive financial education that creates builders, not borrowers.
          </p>
          <DownloadBadges />
          <p className="text-[10px] text-[#0c2d48]/20 font-medium mt-4">
            Available on iOS and Android · Ages 7–21
          </p>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-sky-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MoolabLogo size={22} />
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm font-black bg-gradient-to-r from-[#2e8bc0] to-[#145374] bg-clip-text text-transparent">
              MOOLAB
            </span>
          </div>
          <p className="text-[10px] text-[#0c2d48]/20 font-medium text-center sm:text-right">
            Building the next generation of financial sharks.
          </p>
        </div>
      </footer>
    </div>
  );
}
