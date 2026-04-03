import { useEffect, useState } from "react";

interface LandingPageProps {
  onParentLogin: () => void;
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
      <path d="M68.14 21.75a4.34 4.34 0 100 8.68 4.34 4.34 0 000-8.68zm0 6.98a2.64 2.64 0 110-5.28 2.64 2.64 0 010 5.28zm-9.47-6.98a4.34 4.34 0 100 8.68 4.34 4.34 0 000-8.68zm0 6.98a2.64 2.64 0 110-5.28 2.64 2.64 0 010 5.28zm-11.27-5.65v1.94h4.64a4.05 4.05 0 01-1.06 2.44 4.77 4.77 0 01-3.58 1.42 5.19 5.19 0 010-10.38 4.97 4.97 0 013.52 1.38l1.37-1.37a6.8 6.8 0 00-4.89-1.97 7.13 7.13 0 100 14.26 6.52 6.52 0 004.97-2 6.44 6.44 0 001.68-4.56 6.35 6.35 0 00-.1-1.16H47.4zm46.06 1.5a4.03 4.03 0 00-3.72-2.83 4.11 4.11 0 00-4.08 4.34 4.24 4.24 0 004.28 4.34 4.29 4.29 0 003.6-1.9l-1.47-.98a2.47 2.47 0 01-2.13 1.19 2.2 2.2 0 01-2.1-1.31l5.8-2.4-.18-.45zm-5.92 1.45a2.33 2.33 0 012.22-2.48 1.65 1.65 0 011.58.9l-3.8 1.58zM88.28 30h2V17h-2v13zm-3.27-7.6h-.07a3.15 3.15 0 00-2.38-1.02 4.35 4.35 0 000 8.69 3.1 3.1 0 002.38-1.03h.07v.62c0 1.64-.88 2.52-2.29 2.52a2.37 2.37 0 01-2.16-1.52l-1.74.72A4.22 4.22 0 0082.72 34c2.3 0 4.24-1.36 4.24-4.66v-8.04h-1.95v.7zm-2.16 6a2.65 2.65 0 010-5.29 2.46 2.46 0 012.33 2.66 2.44 2.44 0 01-2.33 2.63zm24.54-11.4h-4.79V30h2v-4.94h2.79a4.17 4.17 0 100-8.33 4.17 4.17 0 000 .27zm.05 6.46h-2.84v-4.6h2.84a2.3 2.3 0 110 4.6zm12.36-1.93a3.76 3.76 0 00-3.57 2.06l1.78.74a1.9 1.9 0 011.83-1 1.94 1.94 0 012.13 1.73v.14a4.46 4.46 0 00-2.1-.52c-1.93 0-3.89 1.06-3.89 3.04a3.12 3.12 0 003.34 2.98 2.83 2.83 0 002.57-1.31h.07v1.03h1.93v-5.18c0-2.4-1.79-3.74-4.1-3.74l.01.03zm-.24 7.4c-.66 0-1.58-.33-1.58-1.15 0-1.04 1.15-1.44 2.14-1.44a3.6 3.6 0 011.83.45 2.44 2.44 0 01-2.39 2.14zm11.35-7.1l-2.3 5.82h-.06l-2.38-5.82h-2.15l3.56 8.1-2.03 4.5h2.08L130.97 22h-2.06zm-17.88 8h2V17h-2v13z" fill="#fff"/>
      <path d="M10.44 7.54a2 2 0 00-.46 1.4v22.12a2 2 0 00.46 1.4l.07.07L22.7 20.37v-.27-.27L10.51 7.47l-.07.07z" fill="#4285F4"/>
      <path d="M26.76 24.43l-4.06-4.06v-.27-.27l4.06-4.06.09.05 4.81 2.73c1.37.78 1.37 2.06 0 2.84l-4.81 2.73-.09.05v.26z" fill="#FBBC04"/>
      <path d="M26.85 24.17L22.7 20.01 10.44 32.46a1.63 1.63 0 002.08.06l14.33-8.14v-.21z" fill="#EA4335"/>
      <path d="M26.85 15.86L12.52 7.71a1.63 1.63 0 00-2.08.06L22.7 20.01l4.15-4.15z" fill="#34A853"/>
      <text x="47" y="13" fontSize="7.5" fontFamily="system-ui" fontWeight="400" fill="#b3b3b3" letterSpacing="0.5">GET IT ON</text>
    </svg>
  </a>
);


const DownloadBadges = () => (
  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
    <AppStoreBadge />
    <PlayStoreBadge />
  </div>
);

export default function LandingPage({ onParentLogin }: LandingPageProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const scrollToDownload = () =>
    document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      className={`min-h-screen bg-white font-['Inter',system-ui,sans-serif] text-[#1a3c2a] transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ overflowX: "hidden" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              WealthScroll
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onParentLogin}
              className="px-4 py-2 rounded-full border border-emerald-200 text-emerald-700 font-bold text-xs sm:text-sm tracking-wide hover:bg-emerald-50 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Parent Login
            </button>
            <button
              onClick={scrollToDownload}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Download App
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white to-white" />
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-40 right-[5%] w-48 h-48 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 tracking-wide uppercase">
              Financial Literacy for the Next Generation
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-5">
            STOP SCROLLING.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              START EARNING.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#1a3c2a]/45 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
            The scroll experience your kids already love — reimagined to teach real financial skills through AI-powered lessons, games, and boss battles.
          </p>
          <div id="download-section" className="mb-8">
            <DownloadBadges />
            <p className="text-xs text-[#1a3c2a]/25 font-medium mt-4">Free · No ads · Safe for kids</p>
          </div>
          <div className="flex justify-center gap-10 sm:gap-14">
            {[
              { value: "8–21", label: "Age Range" },
              { value: "8", label: "Modules" },
              { value: "AI", label: "Powered" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">{s.value}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-[#1a3c2a]/30 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-white to-emerald-50/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              Learning That Feels Like
              <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"> Playing</span>
            </h2>
            <p className="text-sm sm:text-base text-[#1a3c2a]/40 font-medium max-w-lg mx-auto">
              Every swipe delivers bite-sized financial wisdom wrapped in games, challenges, and rewards.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "🎮", title: "Kid-Friendly", desc: "No jargon — just fun, safe, age-appropriate money lessons." },
              { icon: "🤖", title: "AI Content", desc: "Gemini AI generates fresh, personalized lessons every session." },
              { icon: "⚔️", title: "Boss Battles", desc: "Beat the Boss Quiz to level up and unlock new modules." },
              { icon: "🏆", title: "Gamification", desc: "Earn XP, build streaks, level up, and track boss wins." },
            ].map((f) => (
              <div key={f.title} className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
                <h3 className="text-sm sm:text-base font-extrabold mb-1.5 tracking-tight">{f.title}</h3>
                <p className="text-xs sm:text-sm text-[#1a3c2a]/40 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              Three Paths.{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">One Mission.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#1a3c2a]/40 font-medium max-w-lg mx-auto">
              Content adapts to their age so every lesson hits home.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                emoji: "🌟", mode: "EXPLORER", ages: "Ages 7–12",
                desc: "Piggy banks, allowance math, and saving goals through stories and games.",
                topics: ["What is money?", "Saving vs spending", "Setting goals"],
                accent: "emerald",
              },
              {
                emoji: "🔥", mode: "HUSTLER", ages: "Ages 13–17",
                desc: "Side hustles, budgeting, and investing basics. Real talk for teens.",
                topics: ["Earning income", "Budgeting 101", "Intro to investing"],
                accent: "amber",
              },
              {
                emoji: "💎", mode: "INVESTOR", ages: "Ages 18–21",
                desc: "Credit scores, crypto, real estate, and tax strategy. Zero fluff.",
                topics: ["Credit & debt", "Crypto basics", "Tax strategies"],
                accent: "violet",
              },
            ].map((card) => {
              const colors = {
                emerald: { bg: "bg-emerald-50", border: "border-emerald-200/60", bar: "bg-emerald-400", text: "text-emerald-600" },
                amber: { bg: "bg-amber-50", border: "border-amber-200/60", bar: "bg-amber-400", text: "text-amber-600" },
                violet: { bg: "bg-violet-50", border: "border-violet-200/60", bar: "bg-violet-400", text: "text-violet-600" },
              }[card.accent];
              return (
                <div key={card.mode} className={`relative rounded-2xl ${colors.bg} border ${colors.border} p-6 sm:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bar}`} />
                  <div className="text-3xl mb-3 mt-1">{card.emoji}</div>
                  <div className={`text-[10px] font-black tracking-[0.2em] uppercase ${colors.text} mb-1`}>{card.mode} MODE</div>
                  <div className="text-xs font-bold text-[#1a3c2a]/40 mb-3">{card.ages}</div>
                  <p className="text-xs sm:text-sm text-[#1a3c2a]/50 font-medium leading-relaxed mb-4">{card.desc}</p>
                  <div className="space-y-1.5">
                    {card.topics.map((t) => (
                      <div key={t} className="flex items-center gap-2 text-[11px] font-semibold text-[#1a3c2a]/40">
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

      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-emerald-50/40 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/60 border border-emerald-200/50 mb-5">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider">For Parents</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
                Parental
                <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"> Command Center</span>
              </h2>
              <p className="text-sm text-[#1a3c2a]/45 font-medium leading-relaxed mb-6">
                Complete visibility into your child's financial education. Real-time metrics, module progress, and learning insights.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: "📊", text: "Real-time XP, streak, and level tracking" },
                  { icon: "🎯", text: "Module-by-module progress bars" },
                  { icon: "🧠", text: "Learning insights and competency assessment" },
                  { icon: "👀", text: "Full transparency — kids see what parents see" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#1a3c2a]/55">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-200/25 to-teal-200/15 blur-2xl scale-110" />
              <div className="relative bg-white rounded-2xl border border-emerald-200/50 shadow-xl p-5 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-bold text-xs">J</div>
                  <div>
                    <div className="font-extrabold text-sm">Jordan's Progress</div>
                    <div className="text-[10px] text-[#1a3c2a]/30 font-medium">Explorer Mode · Age 10</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "XP", value: "2,450", icon: "⚡" },
                    { label: "Streak", value: "7 days", icon: "🔥" },
                    { label: "Boss Wins", value: "4", icon: "🏆" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-emerald-50 rounded-lg p-2.5 text-center">
                      <div className="text-base">{stat.icon}</div>
                      <div className="text-xs font-black text-emerald-700">{stat.value}</div>
                      <div className="text-[9px] font-semibold text-[#1a3c2a]/25 uppercase">{stat.label}</div>
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
                        <span className="text-[#1a3c2a]/50">{m.name}</span>
                        <span className="text-emerald-600">{m.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${m.pct}%` }} />
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
            <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent"> Subscription</span>
          </h2>
          <p className="text-sm text-[#1a3c2a]/40 font-medium max-w-md mx-auto mb-10">
            Unlock the full WealthScroll experience for serious learners.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-2xl mx-auto mb-10">
            {[
              { icon: "♾️", title: "Unlimited Scrolls", desc: "No daily limits — learn whenever you want." },
              { icon: "📈", title: "Advanced Analytics", desc: "Deep reports on learning patterns and growth." },
              { icon: "🎓", title: "Premium Modules", desc: "Exclusive topics like entrepreneurship and crypto." },
            ].map((perk) => (
              <div key={perk.title} className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center">
                <div className="text-2xl mb-2">{perk.icon}</div>
                <h3 className="text-xs font-extrabold tracking-tight mb-1.5">{perk.title}</h3>
                <p className="text-[11px] text-[#1a3c2a]/40 font-medium leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-6 bg-gradient-to-b from-white to-emerald-50/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">💸</div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
            Ready to Build Their
            <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"> Financial Future?</span>
          </h2>
          <p className="text-sm text-[#1a3c2a]/35 font-medium mb-8 max-w-md mx-auto">
            Free to start. No ads. No data selling. Just real financial education that sticks.
          </p>
          <DownloadBadges />
          <p className="text-[10px] text-[#1a3c2a]/20 font-medium mt-4">
            Available on iOS and Android · Ages 7–21
          </p>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-emerald-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💸</span>
            <span className="text-sm font-black bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              WealthScroll
            </span>
          </div>
          <p className="text-[10px] text-[#1a3c2a]/20 font-medium text-center sm:text-right">
            Building the next generation of financially literate humans.
          </p>
        </div>
      </footer>
    </div>
  );
}
