"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

/* ── Data ──────────────────────────────────────────────────────────────── */
const destinations = [
  { name: "Paris",       country: "France",      emoji: "🗼", color: "#f472b6", bg: "from-rose-600/40 to-pink-900/60",    tag: "Romance",   temp: "18°C", rating: 4.9 },
  { name: "Tokyo",       country: "Japan",       emoji: "⛩️", color: "#f97316", bg: "from-orange-600/40 to-red-900/60",   tag: "Culture",   temp: "22°C", rating: 4.8 },
  { name: "Bali",        country: "Indonesia",   emoji: "🌴", color: "#34d399", bg: "from-emerald-600/40 to-teal-900/60", tag: "Nature",    temp: "28°C", rating: 4.9 },
  { name: "Switzerland", country: "Switzerland", emoji: "🏔️", color: "#60a5fa", bg: "from-blue-600/40 to-indigo-900/60",  tag: "Adventure", temp: "8°C",  rating: 4.7 },
  { name: "Dubai",       country: "UAE",         emoji: "🌆", color: "#fbbf24", bg: "from-amber-600/40 to-orange-900/60", tag: "Luxury",    temp: "35°C", rating: 4.8 },
];

const features = [
  { icon: "🤖", title: "AI Trip Planner",       desc: "6 specialized AI agents collaborate to build your perfect itinerary",      color: "#60a5fa" },
  { icon: "💰", title: "Budget Optimization",    desc: "Smart cost tracking and money-saving tips for every budget",               color: "#a78bfa" },
  { icon: "🏨", title: "Hotel Recommendations",  desc: "Curated stays matched to your style, location, and price range",          color: "#f472b6" },
  { icon: "✈️", title: "Flight Suggestions",     desc: "Best routes and prices from top airlines with one-click booking",         color: "#fb923c" },
  { icon: "🌤️", title: "Weather Forecasts",      desc: "Real-time weather insights baked right into your day-by-day plan",       color: "#34d399" },
  { icon: "🗺️", title: "Local Attractions",      desc: "Hidden gems and must-sees discovered by our RAG knowledge base",         color: "#f59e0b" },
];

const steps = [
  { n: "01", icon: "📍", title: "Enter Destination",    desc: "Tell us where you want to go, your dates, budget, and travel style through our 7-step wizard." },
  { n: "02", icon: "🤖", title: "AI Creates Itinerary", desc: "Six specialized AI agents search, analyse, and craft a personalised day-by-day travel plan." },
  { n: "03", icon: "🚀", title: "Customize & Book",     desc: "Review, tweak, and save your plan. Access flights, hotels, and activities all in one place." },
];

const testimonials = [
  { name: "Sarah Mitchell",  role: "Travel Blogger",     avatar: "SM", text: "Compass AI planned my entire 2-week Japan trip in under 2 minutes. The itinerary was incredibly detailed and spot-on!" },
  { name: "James Rodriguez",  role: "Business Traveler",  avatar: "JR", text: "Saved me hours of research every trip. The budget optimization feature alone is worth the subscription." },
  { name: "Priya Kapoor",    role: "Family Traveler",    avatar: "PK", text: "It understood our family's needs perfectly—kid-friendly activities, great hotels, and a relaxed pace. Best Bali trip ever!" },
];

const plans = [
  { name: "Explorer", price: "Free",  period: "",     desc: "Try it risk-free",       color: "#60a5fa", features: ["3 trip plans / month", "Basic itinerary", "Budget overview", "Community support"] },
  { name: "Voyager",  price: "$9",    period: "/mo",  desc: "Most popular",           color: "#a78bfa", features: ["Unlimited trips", "All 6 AI agents", "RAG knowledge base", "Priority support", "Export to PDF"], popular: true },
  { name: "Elite",    price: "$29",   period: "/mo",  desc: "For travel pros",        color: "#f472b6", features: ["Everything in Voyager", "Team workspace", "API access", "Custom branding", "Dedicated support"] },
];

/* ── Phone Mockup: Itinerary ───────────────────────────────────────────── */
function PhoneItinerary() {
  return (
    <div className="w-56 h-[420px] rounded-[2.5rem] glass-strong glow-blue overflow-hidden relative flex flex-col animate-float" style={{ border: "1.5px solid rgba(96,165,250,0.3)" }}>
      {/* notch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />
      {/* header */}
      <div className="pt-8 px-4 pb-3" style={{ background: "linear-gradient(135deg,rgba(96,165,250,0.2),rgba(167,139,250,0.1))" }}>
        <p className="text-[10px] text-blue-300 font-semibold">🤖 AI Itinerary</p>
        <p className="text-sm font-bold text-white">Paris, France 🗼</p>
        <p className="text-[9px] text-slate-400">Jun 15 – Jun 22 · 7 days</p>
      </div>
      {/* day card */}
      <div className="mx-3 mt-2 p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg,rgba(244,114,182,0.3),rgba(167,139,250,0.2))", border:"1px solid rgba(244,114,182,0.2)" }}>
        <p className="text-[9px] text-pink-300 font-bold mb-1">DAY 1 — ARRIVAL</p>
        <div className="space-y-1.5">
          {[["☀️","Morning","Visit the Louvre Museum"],["🌤️","Afternoon","Eiffel Tower & Champ de Mars"],["🌙","Evening","Seine River Cruise"]].map(([ic,t,a])=>(
            <div key={t} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center text-[8px]">{ic}</div>
              <div>
                <p className="text-[8px] text-purple-300">{t}</p>
                <p className="text-[8px] text-slate-300 leading-tight">{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* attraction chips */}
      <div className="px-3 mt-2">
        <p className="text-[9px] text-slate-400 mb-1.5">Top Attractions</p>
        <div className="flex flex-wrap gap-1">
          {["Louvre","Eiffel","Versailles","Montmartre"].map(a=>(
            <span key={a} className="text-[8px] px-2 py-0.5 rounded-full" style={{ background:"rgba(96,165,250,0.2)", border:"1px solid rgba(96,165,250,0.3)", color:"#93c5fd" }}>{a}</span>
          ))}
        </div>
      </div>
      {/* progress */}
      <div className="px-3 mt-3">
        <div className="flex justify-between text-[8px] text-slate-400 mb-1"><span>Planning Progress</span><span>85%</span></div>
        <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full w-[85%]" style={{ background:"linear-gradient(90deg,#60a5fa,#a78bfa)" }} />
        </div>
      </div>
      {/* bottom cta */}
      <div className="mt-auto mx-3 mb-4">
        <div className="rounded-xl py-2 text-center text-[10px] font-bold text-white" style={{ background:"linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
          View Full Itinerary →
        </div>
      </div>
    </div>
  );
}

/* ── Phone Mockup: Budget ──────────────────────────────────────────────── */
function PhoneBudget() {
  return (
    <div className="w-52 h-[400px] rounded-[2.5rem] glass-strong glow-purple overflow-hidden relative flex flex-col animate-float2 mt-16" style={{ border:"1.5px solid rgba(167,139,250,0.3)" }}>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />
      <div className="pt-8 px-4 pb-3" style={{ background:"linear-gradient(135deg,rgba(167,139,250,0.2),rgba(244,114,182,0.1))" }}>
        <p className="text-[10px] text-purple-300 font-semibold">💰 Budget Tracker</p>
        <p className="text-lg font-bold text-white">$2,450</p>
        <p className="text-[9px] text-slate-400">Total trip budget</p>
      </div>
      {/* budget bars */}
      <div className="px-3 mt-2 space-y-2">
        {[
          { label:"✈️ Flights",     val:620,  max:2450, color:"#60a5fa" },
          { label:"🏨 Hotels",      val:890,  max:2450, color:"#a78bfa" },
          { label:"🍽️ Dining",      val:340,  max:2450, color:"#f472b6" },
          { label:"🎭 Activities",  val:200,  max:2450, color:"#34d399" },
        ].map(({ label, val, max, color })=>(
          <div key={label}>
            <div className="flex justify-between text-[8px] text-slate-300 mb-0.5"><span>{label}</span><span>${val}</span></div>
            <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full" style={{ width:`${(val/max)*100}%`, background:color }} />
            </div>
          </div>
        ))}
      </div>
      {/* flight card */}
      <div className="mx-3 mt-3 p-2.5 rounded-xl" style={{ background:"rgba(251,146,60,0.15)", border:"1px solid rgba(251,146,60,0.25)" }}>
        <p className="text-[9px] text-orange-300 font-bold mb-1">✈️ Best Flight Found</p>
        <p className="text-[10px] text-white font-semibold">Air France · $620/person</p>
        <p className="text-[8px] text-slate-400">12h 30m · 1 stop · CDG</p>
      </div>
      {/* hotel card */}
      <div className="mx-3 mt-2 p-2.5 rounded-xl" style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)" }}>
        <p className="text-[9px] text-emerald-300 font-bold mb-0.5">🏨 Top Hotel</p>
        <p className="text-[10px] text-white font-semibold">Hôtel Le Marais ⭐⭐⭐⭐</p>
        <p className="text-[8px] text-slate-400">$148/night · Free WiFi</p>
      </div>
    </div>
  );
}

/* ── Destination Card ──────────────────────────────────────────────────── */
function DestCard({ d, i }: { d: typeof destinations[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${hovered ? "scale-105" : "scale-100"}`}
      style={{ animationDelay: `${i * 0.1}s` }}
    >
      <div className={`h-52 bg-gradient-to-br ${d.bg} flex flex-col justify-between p-5`} style={{ border:"1px solid rgba(255,255,255,0.08)" }}>
        {/* top */}
        <div className="flex justify-between items-start">
          <span className="text-3xl">{d.emoji}</span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background:"rgba(0,0,0,0.4)", color:d.color, border:`1px solid ${d.color}40` }}>{d.tag}</span>
        </div>
        {/* bottom */}
        <div>
          <p className="text-xl font-bold text-white">{d.name}</p>
          <p className="text-xs text-slate-300 mb-2">{d.country}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{d.temp}</span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs text-slate-300">{d.rating}</span>
            </div>
          </div>
          {hovered && (
            <Link href="/plan" className="mt-2 block text-center text-xs py-1.5 rounded-lg font-semibold text-white transition-all" style={{ background:`linear-gradient(135deg,${d.color}80,${d.color}40)`, border:`1px solid ${d.color}50` }}>
              Plan This Trip →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background:"#050818" }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-glow" style={{ background:"radial-gradient(circle,rgba(96,165,250,0.15),transparent 70%)" }} />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full animate-glow" style={{ background:"radial-gradient(circle,rgba(167,139,250,0.12),transparent 70%)", animationDelay:"1.5s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full animate-glow" style={{ background:"radial-gradient(circle,rgba(244,114,182,0.1),transparent 70%)", animationDelay:"3s" }} />
          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden opacity-30">
            <svg viewBox="0 0 1440 120" className="w-full animate-wave" preserveAspectRatio="none">
              <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" fill="url(#waveGrad)" />
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#60a5fa" />
                  <stop offset="50%"  stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left – copy */}
          <div className="animate-slide-up">
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6" style={{ border:"1px solid rgba(96,165,250,0.3)" }}>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-blue-300 font-medium">Powered by 6 AI Agents + RAG</span>
            </div>
            {/* heading */}
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Plan Your{" "}
              <span className="gradient-text block">Perfect Trip</span>
              with AI
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
              Generate personalized itineraries, discover attractions, optimize budgets, and book smarter — all powered by cutting-edge AI agents.
            </p>
            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/plan" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-lg" style={{ background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow:"0 0 30px rgba(139,92,246,0.4)" }}>
                ✈️ Start Planning
              </Link>
              <Link href="/trips" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-300 text-sm glass hover:bg-white/10 transition-all">
                ▶ Watch Demo
              </Link>
            </div>
            {/* trust */}
            <div className="flex flex-wrap gap-6">
              {[["✈️","10,000+ Trips Planned"],["🤖","AI Powered Recommendations"],["⚡","Real-Time Travel Insights"]].map(([ic,t])=>(
                <div key={t} className="flex items-center gap-2">
                  <span>{ic}</span>
                  <span className="text-sm text-slate-400">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right – phone mockups */}
          <div className="relative hidden lg:flex items-start justify-center gap-4 pt-8">
            <PhoneItinerary />
            <PhoneBudget />
            {/* floating chips */}
            <div className="absolute -top-4 right-8 glass rounded-xl px-4 py-2 animate-float2" style={{ border:"1px solid rgba(52,211,153,0.3)", animationDelay:"0.5s" }}>
              <p className="text-xs text-emerald-300 font-semibold">✓ Itinerary ready</p>
            </div>
            <div className="absolute bottom-12 -left-4 glass rounded-xl px-4 py-2 animate-float" style={{ border:"1px solid rgba(251,146,60,0.3)", animationDelay:"2s" }}>
              <p className="text-xs text-orange-300 font-semibold">💰 Saved $340</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-400 font-semibold mb-2 uppercase tracking-widest">How It Works</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">Three steps to your<br/><span className="gradient-text">dream vacation</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="glass rounded-2xl p-8 relative group hover:bg-white/[0.07] transition-all duration-300">
                <div className="absolute top-6 right-6 text-5xl font-black opacity-10 text-white">{s.n}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-500 font-bold">{s.n}</span>
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-3 text-slate-600 text-xl z-10">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-purple-400 font-semibold mb-2 uppercase tracking-widest">Features</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">Everything you need to<br/><span className="gradient-text">travel smarter</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 group hover:scale-[1.02] hover:bg-white/[0.07] transition-all duration-300 cursor-default">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="mt-4 h-0.5 rounded-full w-12 transition-all duration-300 group-hover:w-24" style={{ background:f.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-pink-400 font-semibold mb-2 uppercase tracking-widest">Destinations</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">Most loved<br/><span className="gradient-text">destinations</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {destinations.map((d, i) => <DestCard key={d.name} d={d} i={i} />)}
          </div>
          <div className="text-center mt-8">
            <Link href="/plan" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass text-sm text-slate-300 font-medium hover:bg-white/10 transition-all" style={{ border:"1px solid rgba(255,255,255,0.1)" }}>
              Plan any destination →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-orange-400 font-semibold mb-2 uppercase tracking-widest">Testimonials</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">Loved by <span className="gradient-text">10,000+ travelers</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(n=><span key={n} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background:"linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-400 font-semibold mb-2 uppercase tracking-widest">Pricing</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">Simple, <span className="gradient-text">transparent pricing</span></h2>
            <p className="text-slate-400">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl p-8 relative transition-all duration-300 hover:scale-[1.02] ${p.popular ? "glass-strong" : "glass"}`}
                style={p.popular ? { border:`1px solid ${p.color}50`, boxShadow:`0 0 40px ${p.color}20` } : {}}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background:`linear-gradient(135deg,${p.color},${p.color}80)` }}>
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-1" style={{ color:p.color }}>{p.name}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-white">{p.price}</span>
                    <span className="text-slate-400 text-sm pb-1">{p.period}</span>
                  </div>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-xs" style={{ color:p.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/plan" className="block text-center py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={p.popular ? { background:`linear-gradient(135deg,${p.color},${p.color}80)`, color:"white" } : { background:"rgba(255,255,255,0.07)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse at center,rgba(96,165,250,0.1) 0%,transparent 70%)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6">
            Ready to plan your<br/><span className="gradient-text">dream adventure?</span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg">Join thousands of travelers who plan smarter with Compass AI.</p>
          <Link href="/plan" className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-105" style={{ background:"linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)", boxShadow:"0 0 50px rgba(139,92,246,0.4)" }}>
            ✈️ Start Planning for Free
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t py-10 px-6" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <span className="font-bold text-white">Compass <span style={{ color:"#60a5fa" }}>AI</span></span>
          </div>
          <p className="text-sm text-slate-500">© 2025 Compass AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/plan" className="hover:text-white transition-colors">Plan Trip</Link>
            <Link href="/trips" className="hover:text-white transition-colors">My Trips</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
