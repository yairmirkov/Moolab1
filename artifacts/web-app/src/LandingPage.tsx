import { useEffect, useState } from "react";

interface LandingPageProps {
  onParentLogin: () => void;
}

const AppleStoreSvg = () => (
  <svg viewBox="0 0 120 40" className="h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="40" rx="6" fill="#000" />
    <text x="60" y="12" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="system-ui" fontWeight="400">Download on the</text>
    <text x="67" y="27" textAnchor="middle" fill="#fff" fontSize="13" fontFamily="system-ui" fontWeight="700">App Store</text>
    <g transform="translate(18,10) scale(0.75)">
      <path d="M18.72 12.61c-.02-2.14 1.75-3.17 1.83-3.22-1-1.46-2.55-1.66-3.1-1.68-1.32-.13-2.57.78-3.24.78-.67 0-1.7-.76-2.8-.74-1.44.02-2.77.84-3.51 2.13-1.49 2.59-.38 6.43 1.07 8.53.71 1.03 1.56 2.18 2.68 2.14 1.07-.04 1.48-.7 2.78-.7 1.3 0 1.67.7 2.78.67 1.16-.02 1.89-1.05 2.59-2.08.82-1.19 1.15-2.35 1.17-2.41-.03-.01-2.25-.86-2.27-3.42zM16.63 6.18c.59-.72 .99-1.71.88-2.7-.85.03-1.88.57-2.49 1.28-.55.63-1.03 1.65-.9 2.62.95.07 1.92-.48 2.51-1.2z" fill="#fff"/>
    </g>
  </svg>
);

const GooglePlaySvg = () => (
  <svg viewBox="0 0 135 40" className="h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="135" height="40" rx="6" fill="#000" />
    <text x="75" y="12" textAnchor="middle" fill="#fff" fontSize="6.5" fontFamily="system-ui" fontWeight="400">GET IT ON</text>
    <text x="78" y="27" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="system-ui" fontWeight="700">Google Play</text>
    <g transform="translate(14,8) scale(0.6)">
      <path d="M7.54 30.85 22.78 16.5 7.54 2.15c-.33.2-.54.57-.54.98v26.74c0 .41.21.78.54.98z" fill="#4285F4"/>
      <path d="M27.84 12.67l-5.06-2.84L17.1 16.5l5.68 6.67 5.06-2.84c1.02-.57 1.02-2.09 0-2.66z" fill="#FBBC04"/>
      <path d="M7.54 2.15 22.78 16.5l-5.68-6.67L7.54 2.15z" fill="#34A853"/>
      <path d="M22.78 16.5 7.54 30.85l9.56-7.68L22.78 16.5z" fill="#EA4335"/>
    </g>
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 60 25" className="h-6 sm:h-7" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10.17c0-.59.49-.82 1.3-.82a8.54 8.54 0 013.49.89V7.2a10.15 10.15 0 00-3.49-.63C3.68 6.57 2 7.89 2 10.33c0 3.79 5.22 3.18 5.22 4.81 0 .7-.61.93-1.46.93-1.26 0-2.88-.52-4.16-1.22v3.1a10.58 10.58 0 004.16.87c2.74 0 4.62-1.26 4.62-3.75 0-4.08-5.24-3.36-5.24-4.9h-.14zM14.15 4l-2.89.62v13.25h2.89V4zM18.1 7.13l-.18-.9h-2.56v11.64h2.89v-7.9a2.08 2.08 0 012.2-.94v-2.8a1.98 1.98 0 00-2.35.9zM23.42 6.57l-2.86.61v10.5a2.83 2.83 0 002.91 2.88 4.74 4.74 0 001.51-.29V18a2.49 2.49 0 01-.8.13c-.63 0-1.06-.25-1.06-1.12V9.51h1.86V7.13h-1.56V6.57zM30.57 7.13l-.18-.9h-2.55v11.64h2.89v-7.9a2.08 2.08 0 012.2-.94v-2.8a1.98 1.98 0 00-2.36.9zM38.24 6.57a3.07 3.07 0 00-2.17.85l-.14-.72h-2.56v15.46l2.89-.61v-3.76a3.04 3.04 0 001.82.59c1.83 0 3.5-1.48 3.5-4.72 0-2.97-1.7-4.52-3.34-5.09zm-.59 8.87c-.6 0-.96-.22-1.21-.49V10.2c.26-.3.63-.5 1.21-.5 .93 0 1.57 1.04 1.57 2.88 0 1.87-.63 2.86-1.57 2.86zM47.68 6.57c-2.84 0-4.63 2.43-4.63 5.17s1.76 5.03 4.83 5.03a6.55 6.55 0 003.06-.71v-2.32a5.96 5.96 0 01-2.84.77c-1.13 0-2.12-.39-2.24-1.77h5.66c0-.15.02-.76.02-1.04 0-3.06-1.48-5.13-3.86-5.13zm-1.52 4.12c0-1.32.8-1.86 1.53-1.86.71 0 1.46.54 1.46 1.86h-2.99zM58.42 6.57c-2.84 0-4.14 2.43-4.14 5.17s1.76 5.03 4.34 5.03a6.55 6.55 0 002.56-.71v-2.32a5.96 5.96 0 01-2.34.77c-1.13 0-1.62-.39-1.75-1.77h5.16c0-.15.02-.76.02-1.04 0-3.06-.98-5.13-3.37-5.13h-.48z" fill="#635BFF"/>
  </svg>
);

const PayPalLogo = () => (
  <svg viewBox="0 0 80 22" className="h-5 sm:h-6" xmlns="http://www.w3.org/2000/svg">
    <path d="M27.47 4.74h-4.24a.58.58 0 00-.57.49l-1.72 10.9a.35.35 0 00.35.4h2.17a.41.41 0 00.4-.34l.49-3.08a.58.58 0 01.57-.49h1.31c2.73 0 4.31-1.32 4.72-3.94.19-1.15.01-2.05-.52-2.68-.59-.69-1.63-1.03-3.01-1.03l.05-.23zm.48 3.88c-.23 1.49-1.36 1.49-2.46 1.49h-.63l.44-2.78a.35.35 0 01.34-.29h.29c.75 0 1.45 0 1.81.43.22.25.28.63.21 1.15z" fill="#253B80"/>
    <path d="M44.56 8.56h-2.17a.35.35 0 00-.34.29l-.1.6-.15-.22c-.47-.68-1.52-.91-2.56-.91-2.4 0-4.44 1.82-4.84 4.37-.21 1.27.09 2.48.82 3.32.67.78 1.62 1.1 2.76 1.1 1.95 0 3.03-1.25 3.03-1.25l-.1.61a.35.35 0 00.35.4h1.96a.58.58 0 00.57-.49l1.15-7.42a.35.35 0 00-.38-.4zm-3.05 4.23c-.21 1.25-1.2 2.09-2.47 2.09-.64 0-1.15-.2-1.47-.59-.32-.38-.44-.93-.34-1.53.2-1.24 1.21-2.11 2.46-2.11.62 0 1.13.21 1.46.6.33.39.47.94.36 1.54z" fill="#253B80"/>
    <path d="M55.47 8.56h-2.18a.58.58 0 00-.48.25l-2.77 4.08-1.17-3.92a.58.58 0 00-.56-.41h-2.14a.35.35 0 00-.33.47l2.21 6.49-2.08 2.94a.35.35 0 00.29.55h2.17a.58.58 0 00.48-.25l6.69-9.65a.35.35 0 00-.29-.55h.16z" fill="#253B80"/>
    <path d="M61.77 4.74h-4.24a.58.58 0 00-.57.49l-1.72 10.9a.35.35 0 00.35.4h2.28a.41.41 0 00.4-.34l.49-3.08a.58.58 0 01.57-.49h1.31c2.73 0 4.31-1.32 4.72-3.94.19-1.15.01-2.05-.52-2.68-.59-.69-1.63-1.03-3.01-1.03l-.06-.23zm.48 3.88c-.23 1.49-1.36 1.49-2.46 1.49h-.63l.44-2.78a.35.35 0 01.34-.29h.29c.75 0 1.45 0 1.81.43.22.25.28.63.21 1.15z" fill="#179BD7"/>
    <path d="M78.86 8.56h-2.17a.35.35 0 00-.34.29l-.1.6-.15-.22c-.47-.68-1.52-.91-2.56-.91-2.4 0-4.44 1.82-4.84 4.37-.21 1.27.09 2.48.82 3.32.67.78 1.62 1.1 2.76 1.1 1.95 0 3.03-1.25 3.03-1.25l-.1.61a.35.35 0 00.35.4h1.96a.58.58 0 00.57-.49l1.15-7.42a.35.35 0 00-.38-.4zm-3.05 4.23c-.21 1.25-1.2 2.09-2.47 2.09-.64 0-1.15-.2-1.47-.59-.32-.38-.44-.93-.34-1.53.2-1.24 1.21-2.11 2.46-2.11.62 0 1.13.21 1.46.6.33.39.47.94.36 1.54z" fill="#179BD7"/>
  </svg>
);

export default function LandingPage({ onParentLogin }: LandingPageProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`min-h-screen bg-white font-['Inter',system-ui,sans-serif] text-[#1a3c2a] transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ overflowX: "hidden" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              WealthScroll
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onParentLogin}
              className="px-5 py-2.5 rounded-full border border-emerald-200 text-emerald-700 font-bold text-sm tracking-wide hover:bg-emerald-50 active:scale-95 transition-all duration-200 cursor-pointer hidden sm:block"
            >
              Parent Login
            </button>
            <button
              onClick={() => document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Download App
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white to-white" />
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-40 right-[5%] w-56 h-56 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
              Financial Literacy for the Next Generation
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            STOP SCROLLING.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              START EARNING.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#1a3c2a]/50 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            The scroll experience your kids already love — reimagined to teach real financial skills through AI-powered lessons, games, and boss battles.
          </p>
          <p className="text-sm text-[#1a3c2a]/30 font-medium mb-6">Free · No ads · Safe for kids · No credit card</p>

          <div id="download-section" className="flex items-center justify-center gap-4 mb-12">
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 active:scale-95 transition-transform duration-200">
              <AppleStoreSvg />
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 active:scale-95 transition-transform duration-200">
              <GooglePlaySvg />
            </a>
          </div>

          <div className="flex justify-center gap-12 sm:gap-16">
            {[
              { value: "8-21", label: "Age Range" },
              { value: "8", label: "Modules" },
              { value: "AI", label: "Powered" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-emerald-600">{s.value}</div>
                <div className="text-xs font-semibold text-[#1a3c2a]/35 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-white to-emerald-50/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Learning That Feels Like
              <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"> Playing</span>
            </h2>
            <p className="text-base text-[#1a3c2a]/40 font-medium max-w-xl mx-auto">
              Every swipe delivers bite-sized financial wisdom wrapped in games, challenges, and rewards.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎮",
                title: "Super Kid-Friendly",
                desc: "Designed for ages 8+. No jargon, no confusion — just fun, safe, age-appropriate money lessons.",
                color: "from-emerald-50 to-teal-50",
                border: "border-emerald-100",
              },
              {
                icon: "📚",
                title: "Rich AI Content",
                desc: "Gemini AI generates fresh, personalized lessons every session. No two scrolls are the same.",
                color: "from-blue-50 to-cyan-50",
                border: "border-blue-100",
              },
              {
                icon: "⚔️",
                title: "Boss Fight Arena",
                desc: "Beat the Boss Quiz after every 4 lessons to level up and unlock new financial modules.",
                color: "from-amber-50 to-orange-50",
                border: "border-amber-100",
              },
              {
                icon: "🏆",
                title: "XP & Gamification",
                desc: "Earn XP, build streaks, level up, and track boss wins. Real progress, real motivation.",
                color: "from-purple-50 to-pink-50",
                border: "border-purple-100",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`relative p-7 rounded-2xl bg-gradient-to-br ${f.color} border ${f.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-extrabold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-[#1a3c2a]/45 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Three Paths.{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">One Mission.</span>
            </h2>
            <p className="text-base text-[#1a3c2a]/40 font-medium max-w-xl mx-auto">
              Content adapts to their age so every lesson hits home.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: "🌟",
                mode: "EXPLORER",
                ages: "Ages 7–12",
                desc: "Piggy banks, allowance math, and saving goals. Learn money basics through stories and simple games.",
                topics: ["What is money?", "Saving vs spending", "Setting goals"],
                gradient: "from-emerald-400 to-teal-400",
                bg: "bg-emerald-50",
                border: "border-emerald-200/60",
              },
              {
                emoji: "🔥",
                mode: "HUSTLER",
                ages: "Ages 13–17",
                desc: "Side hustles, budgeting apps, and investing basics. Real talk for teens ready to build wealth.",
                topics: ["Earning income", "Budgeting 101", "Intro to investing"],
                gradient: "from-amber-400 to-orange-400",
                bg: "bg-amber-50",
                border: "border-amber-200/60",
              },
              {
                emoji: "💎",
                mode: "INVESTOR",
                ages: "Ages 18–21",
                desc: "Credit scores, crypto, real estate, and tax strategy. Adulting-level finance, zero fluff.",
                topics: ["Credit & debt", "Crypto basics", "Tax strategies"],
                gradient: "from-violet-400 to-purple-400",
                bg: "bg-violet-50",
                border: "border-violet-200/60",
              },
            ].map((card) => (
              <div
                key={card.mode}
                className={`relative rounded-2xl ${card.bg} border ${card.border} p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-80" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                  <div className={`h-full w-full bg-gradient-to-r ${card.gradient}`} />
                </div>
                <div className="text-4xl mb-4 mt-2">{card.emoji}</div>
                <div className={`text-xs font-black tracking-[0.2em] uppercase bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-1`}>
                  {card.mode} MODE
                </div>
                <div className="text-sm font-bold text-[#1a3c2a]/50 mb-4">{card.ages}</div>
                <p className="text-sm text-[#1a3c2a]/55 font-medium leading-relaxed mb-6">{card.desc}</p>
                <div className="space-y-2">
                  {card.topics.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-xs font-semibold text-[#1a3c2a]/45">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-emerald-50/40 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/60 border border-emerald-200/50 mb-6">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">For Parents</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-5">
                Parental
                <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"> Command Center</span>
              </h2>
              <p className="text-base text-[#1a3c2a]/45 font-medium leading-relaxed mb-8">
                Complete visibility into your child's financial education journey. Real-time metrics, module progress, and learning insights — all in one dashboard.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: "📊", text: "Real-time XP, streak, and level tracking" },
                  { icon: "🎯", text: "Module-by-module progress bars" },
                  { icon: "🧠", text: "Learning insights and competency assessment" },
                  { icon: "👀", text: "Kids can see what parents see — full transparency" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <span className="text-sm font-semibold text-[#1a3c2a]/60">{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onParentLogin}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-200/40 hover:shadow-emerald-300/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Parent Login
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-200/30 to-teal-200/20 blur-2xl scale-110" />
              <div className="relative bg-white rounded-2xl border border-emerald-200/50 shadow-xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                    J
                  </div>
                  <div>
                    <div className="font-extrabold text-sm">Jordan's Progress</div>
                    <div className="text-xs text-[#1a3c2a]/35 font-medium">Explorer Mode · Age 10</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "XP", value: "2,450", icon: "⚡" },
                    { label: "Streak", value: "7 days", icon: "🔥" },
                    { label: "Boss Wins", value: "4", icon: "🏆" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-emerald-50 rounded-xl p-3 text-center">
                      <div className="text-lg">{stat.icon}</div>
                      <div className="text-sm font-black text-emerald-700">{stat.value}</div>
                      <div className="text-[10px] font-semibold text-[#1a3c2a]/30 uppercase">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: "Saving Basics", pct: 100 },
                    { name: "Smart Budgeting", pct: 67 },
                    { name: "Earning Money", pct: 33 },
                  ].map((m) => (
                    <div key={m.name}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#1a3c2a]/60">{m.name}</span>
                        <span className="text-emerald-600">{m.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                          style={{ width: `${m.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/50 mb-6">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Mastermind
            <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent"> Subscription</span>
          </h2>
          <p className="text-base text-[#1a3c2a]/40 font-medium max-w-xl mx-auto mb-12">
            Unlock the full WealthScroll experience for serious learners.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            {[
              { icon: "♾️", title: "Unlimited Scrolls", desc: "No daily limits — learn as much as you want, whenever you want." },
              { icon: "📈", title: "Advanced Analytics", desc: "Deep-dive reports on learning patterns, strengths, and growth areas." },
              { icon: "🎓", title: "Premium Modules", desc: "Exclusive advanced topics like entrepreneurship, real estate, and crypto strategy." },
            ].map((perk) => (
              <div key={perk.title} className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center">
                <div className="text-3xl mb-3">{perk.icon}</div>
                <h3 className="text-sm font-extrabold tracking-tight mb-2">{perk.title}</h3>
                <p className="text-xs text-[#1a3c2a]/40 font-medium leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold text-[#1a3c2a]/30 uppercase tracking-wider">Secure payments powered by</p>
            <div className="flex items-center justify-center gap-8">
              <StripeLogo />
              <PayPalLogo />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-emerald-200/50 shadow-xl p-8 text-center">
            <div className="text-3xl mb-4">👨‍👩‍👧</div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Parent Login</h2>
            <p className="text-sm text-[#1a3c2a]/40 font-medium mb-6">
              Sign in to view your child's progress, manage subscriptions, and more.
            </p>
            <div className="space-y-3 mb-6">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-200/40 text-[#1a3c2a] font-medium text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all placeholder:text-[#1a3c2a]/30"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl bg-emerald-50/60 border border-emerald-200/40 text-[#1a3c2a] font-medium text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all placeholder:text-[#1a3c2a]/30"
              />
            </div>
            <button
              onClick={onParentLogin}
              className="w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-200/40 hover:shadow-emerald-300/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer mb-4"
            >
              Sign In
            </button>
            <p className="text-xs text-[#1a3c2a]/25 font-medium">
              Don't have an account?{" "}
              <button onClick={onParentLogin} className="text-emerald-600 font-bold hover:underline cursor-pointer">
                Sign up as a Parent
              </button>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-emerald-50/30 to-emerald-50/60">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">💸</div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-5">
            Ready to Build Their
            <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"> Financial Future?</span>
          </h2>
          <p className="text-base text-[#1a3c2a]/40 font-medium mb-10 max-w-lg mx-auto">
            Free to start. No ads. No data selling. Just real financial education that sticks.
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 active:scale-95 transition-transform duration-200">
              <AppleStoreSvg />
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="hover:scale-105 active:scale-95 transition-transform duration-200">
              <GooglePlaySvg />
            </a>
          </div>
          <p className="text-xs text-[#1a3c2a]/25 font-medium">
            Free · No ads · Safe for kids · Ages 7–21
          </p>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-emerald-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💸</span>
            <span className="text-sm font-black bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              WealthScroll
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <StripeLogo />
              <PayPalLogo />
            </div>
          </div>
          <p className="text-xs text-[#1a3c2a]/25 font-medium">
            Building the next generation of financially literate humans.
          </p>
        </div>
      </footer>
    </div>
  );
}
