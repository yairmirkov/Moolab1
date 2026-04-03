import { useEffect, useState } from "react";

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
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
          <button
            onClick={onEnterApp}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Launch App
          </button>
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
            The addictive scroll experience your kids already love — rebuilt to teach real financial skills through AI-powered lessons, games, and boss battles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black text-lg tracking-wide shadow-xl shadow-emerald-200/40 hover:shadow-emerald-300/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Launch App — It's Free
            </button>
            <span className="text-sm text-[#1a3c2a]/30 font-medium">No ads · Safe for kids · No credit card</span>
          </div>
          <div className="mt-16 flex justify-center gap-12 sm:gap-16">
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
              <div className="space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
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
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-white to-emerald-50/60">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">💸</div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-5">
            Ready to Build Their
            <span className="bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"> Financial Future?</span>
          </h2>
          <p className="text-base text-[#1a3c2a]/40 font-medium mb-10 max-w-lg mx-auto">
            Free to start. No ads. No data selling. Just real financial education that sticks.
          </p>
          <button
            onClick={onEnterApp}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black text-xl tracking-wide shadow-xl shadow-emerald-200/40 hover:shadow-emerald-300/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Launch WealthScroll
          </button>
          <p className="mt-6 text-xs text-[#1a3c2a]/25 font-medium">
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
          <p className="text-xs text-[#1a3c2a]/25 font-medium">
            Building the next generation of financially literate humans.
          </p>
        </div>
      </footer>
    </div>
  );
}
