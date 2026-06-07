import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Map, Cloud, MessageCircle, Zap, Globe, Database, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/* ── Data ─────────────────────────────────────────────────────────────────── */
const destinations = [
  { name: 'Paris',     emoji: '🗼', color: 'from-stone-700/30 to-stone-800/30',   country: 'France' },
  { name: 'Tokyo',     emoji: '⛩️', color: 'from-stone-600/30 to-stone-800/30',   country: 'Japan' },
  { name: 'Bali',      emoji: '🌴', color: 'from-stone-700/30 to-stone-900/30',   country: 'Indonesia' },
  { name: 'Dubai',     emoji: '🏙️', color: 'from-stone-600/30 to-stone-700/30',  country: 'UAE' },
  { name: 'Swiss Alps',emoji: '🏔️', color: 'from-stone-700/30 to-stone-800/30',  country: 'Switzerland' },
];

const features = [
  { icon: <Sparkles size={24}/>, title: 'AI Trip Planner',      desc: 'Gemini 2.5 Pro crafts optimized day-by-day itineraries with route minimization and preference matching.',  color: 'text-brand-blue'   },
  { icon: <Database size={24}/>, title: 'RAG Knowledge Base',    desc: 'ChromaDB indexes Wikivoyage, Wikipedia, UNESCO & OSM data — retrieved semantically for hyper-local context.', color: 'text-brand-purple' },
  { icon: <Cloud size={24}/>,    title: 'Real-Time Weather',     desc: '7-day OpenWeather forecasts baked into your itinerary so every activity matches conditions.',                  color: 'text-brand-pink'   },
  { icon: <Map size={24}/>,      title: 'Interactive Maps',      desc: 'Day-coded Leaflet routes with attraction, restaurant, and hotel markers on a dark CartoDB base.',              color: 'text-brand-orange' },
  { icon: <Zap size={24}/>,      title: 'Route Optimization',    desc: 'Nearby attractions are clustered to minimize travel time and maximize your daily experience.',                  color: 'text-stone-400'    },
  { icon: <MessageCircle size={24}/>, title: 'Chat Assistant',   desc: 'Ask anything about your trip. RAG retrieves context from ChromaDB and Gemini gives accurate answers.',         color: 'text-stone-300'    },
  { icon: <Globe size={24}/>,    title: 'Live Attraction Data',  desc: 'Google Places provides real-time ratings, reviews, opening hours, and photos — never stored, always fresh.',   color: 'text-brand-purple' },
  { icon: <Sparkles size={24}/>, title: 'Budget Optimizer',      desc: 'Low, Standard, or Luxury modes. Cost estimates for every activity, meal, and transport leg.',                   color: 'text-brand-pink'   },
];

const steps = [
  { num: '01', emoji: '📍', title: 'Enter Your Destination', desc: 'Tell us where, when, your budget, and what experiences you love.' },
  { num: '02', emoji: '🤖', title: 'AI Collects Real Data',  desc: 'Pipeline fetches attractions, weather, travel guides, and reviews in parallel.' },
  { num: '03', emoji: '✨', title: 'Get Your Itinerary',     desc: 'Gemini generates an optimized day-by-day plan with maps, costs, and local tips.' },
];

// Data sources — RAG (stored) and real-time (live)
const ragSources = [
  {
    name: 'Wikivoyage',
    url: 'https://www.wikivoyage.org/',
    badge: 'RAG',
    icon: '📖',
    color: 'text-brand-blue',
    border: 'rgba(200,149,108,0.2)',
    desc: 'Travel-focused wiki written by travelers for travelers.',
    sections: ['See', 'Do', 'Eat', 'Drink', 'Sleep', 'Get Around'],
    stores: ['Attractions', 'Hidden gems', 'Food recommendations', 'Local transport', 'Safety info', 'Travel tips'],
    rag: 'Each section stored as a separate chunk — enables precise semantic retrieval (e.g. "vegetarian restaurants in Bali").',
  },
  {
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org/',
    badge: 'RAG',
    icon: '📚',
    color: 'text-brand-purple',
    border: 'rgba(125,174,168,0.2)',
    desc: 'World\'s largest encyclopedia — rich history and cultural context.',
    sections: ['City overview', 'History', 'Culture', 'Landmarks', 'Notable districts'],
    stores: ['City summary', 'Historical monuments', 'Museums', 'Cultural info'],
    rag: 'City and attraction summaries embedded for background context in itinerary generation.',
  },
  {
    name: 'UNESCO World Heritage',
    url: 'https://whc.unesco.org/',
    badge: 'RAG',
    icon: '🏛️',
    color: 'text-brand-orange',
    border: 'rgba(212,184,150,0.2)',
    desc: 'Official list of world-class heritage sites with cultural significance.',
    sections: ['Site description', 'Historical significance', 'Visitor info'],
    stores: ['Site name', 'Country & city', 'Cultural value', 'Tourist importance'],
    rag: 'Perfect for historical preferences — retrieved when user selects "Historical" travel type.',
  },
  {
    name: 'OpenStreetMap (Overpass API)',
    url: 'https://www.openstreetmap.org/',
    badge: 'RAG + DB',
    icon: '🗺️',
    color: 'text-brand-purple',
    border: 'rgba(125,174,168,0.2)',
    desc: 'Open geographic data — precise coordinates for every attraction.',
    sections: ['tourism=*', 'amenity=restaurant', 'leisure=park', 'historic=*'],
    stores: ['Name', 'Coordinates (lat/lng)', 'Category', 'Nearby locations'],
    rag: 'Coordinates stored in PostgreSQL for map rendering; descriptions chunked into ChromaDB for semantic search.',
  },
  {
    name: 'GeoNames',
    url: 'https://www.geonames.org/',
    badge: 'RAG',
    icon: '🌍',
    color: 'text-stone-300',
    border: 'rgba(200,149,108,0.15)',
    desc: 'Geographic database covering cities, regions, and populations worldwide.',
    sections: ['City metadata', 'Country info', 'Time zones', 'Administrative regions'],
    stores: ['City name', 'Country', 'Population', 'Timezone'],
    rag: 'Used to validate destination inputs and enrich city metadata in the knowledge base.',
  },
  {
    name: 'DBpedia',
    url: 'https://www.dbpedia.org/',
    badge: 'RAG',
    icon: '🔗',
    color: 'text-brand-pink',
    border: 'rgba(184,132,124,0.2)',
    desc: 'Structured, machine-readable knowledge extracted from Wikipedia infoboxes.',
    sections: ['Structured city data', 'Attraction metadata', 'Categories', 'Cross-references'],
    stores: ['Typed attraction data', 'Category tags', 'Wikipedia links'],
    rag: 'Enables filtering attractions by type (museum, park, beach) during itinerary slot filling.',
  },
];

const liveSources = [
  {
    name: 'Google Places API',
    url: 'https://developers.google.com/maps/documentation/places/web-service',
    icon: '📍',
    color: 'text-brand-blue',
    border: 'rgba(200,149,108,0.2)',
    desc: 'Real-time ratings, reviews, opening hours, photos, and popular times.',
    why: 'Google licensing prohibits storing review content — always queried live at itinerary generation time.',
    uses: ['Ratings & reviews', 'Opening hours', 'Photos', 'Popular times', 'Nearby restaurants'],
  },
  {
    name: 'OpenWeather API',
    url: 'https://openweathermap.org/api',
    icon: '🌤️',
    color: 'text-brand-purple',
    border: 'rgba(125,174,168,0.2)',
    desc: '7-day weather forecasts including temperature, precipitation, and conditions.',
    why: 'Weather changes daily — live data ensures outdoor activities match actual forecasts.',
    uses: ['7-day forecast', 'Temperature range', 'Precipitation', 'Wind & humidity'],
  },
  {
    name: 'Amadeus Travel APIs',
    url: 'https://developers.amadeus.com/',
    icon: '✈️',
    color: 'text-brand-orange',
    border: 'rgba(212,184,150,0.2)',
    desc: 'Real-time flights, hotels, and airport data from the world\'s largest travel tech company.',
    why: 'Prices and availability change in real time — caching would show stale results.',
    uses: ['Flight search & pricing', 'Hotel availability', 'Airport information', 'Travel offers'],
  },
];

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* ── Component ────────────────────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="overflow-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16"
        style={{ background: 'linear-gradient(135deg,#111111 0%,#1a1a1a 50%,#242424 100%)' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(200,149,108,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,108,0.06) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-8 animate-glow-pulse"
          style={{ background: 'radial-gradient(circle,#c8956c 0%,transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 animate-glow-pulse"
          style={{ background: 'radial-gradient(circle,#7daea8 0%,transparent 70%)', animationDelay: '1s' }} />

        {/* Floating destination cards */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {destinations.map((dest, i) => (
            <motion.div key={dest.name} className="absolute glass-card px-4 py-2 rounded-xl"
              style={{ top:`${15+(i*15)}%`, left:i%2===0?`${3+i*2}%`:'auto', right:i%2!==0?`${3+i*2}%`:'auto', border:'1px solid rgba(255,255,255,0.1)' }}
              animate={{ y:[0,-15,0], rotate:[0,i%2===0?2:-2,0] }}
              transition={{ duration:4+i, repeat:Infinity, ease:'easeInOut', delay:i*0.5 }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{dest.emoji}</span>
                <div>
                  <div className="text-white text-sm font-semibold">{dest.name}</div>
                  <div className="text-slate-400 text-xs">{dest.country}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{ background:'rgba(200,149,108,0.08)', border:'1px solid rgba(200,149,108,0.25)', color:'#c8956c' }}>
              <Sparkles size={14}/> Powered by Gemini 2.5 Pro + ChromaDB RAG
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Plan Your Perfect<br />
            <span className="gradient-text">Trip With AI</span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            6 verified data sources feed our RAG knowledge base. Gemini crafts optimized routes.
            Real-time weather, ratings, and flights — never hallucinated, always verified.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to={isAuthenticated ? '/plan' : '/register'}>
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                <Sparkles size={20}/> Start Planning Free
              </motion.button>
            </Link>
            <a href="#data-sources" onClick={(e)=>{ e.preventDefault(); document.getElementById('data-sources')?.scrollIntoView({behavior:'smooth'}); }}>
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
                View Data Sources
              </motion.button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            className="flex flex-wrap justify-center gap-3">
            {['🤖 Gemini 2.5 Pro','🗃️ ChromaDB RAG','🌤️ OpenWeather','🗺️ OSM + Overpass','📖 Wikivoyage','🏛️ UNESCO','✈️ Amadeus'].map((b)=>(
              <span key={b} className="text-xs text-slate-500 px-3 py-1 rounded-full"
                style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
                {b}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background:'#1a1a1a' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-stone-400 text-lg">Three steps to your dream vacation</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.15 }} className="glass-card p-8 text-center relative">
                <div className="text-5xl mb-4">{step.emoji}</div>
                <div className="text-6xl font-black opacity-10 absolute top-4 right-6" style={{ color:'#c8956c' }}>{step.num}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ background:'#111111' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You <span className="gradient-text">Need</span></h2>
            <p className="text-slate-400 text-lg">Powered by cutting-edge AI and verified real-world data</p>
          </motion.div>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once:true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat) => (
              <motion.div key={feat.title} variants={itemVariants} whileHover={{ scale:1.02, translateY:-4 }}
                className="glass-card p-6 cursor-default">
                <div className={`${feat.color} mb-4`}>{feat.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Popular Destinations ──────────────────────────────────────────── */}
      <section id="destinations" className="py-24 px-6" style={{ background:'#1a1a1a' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular <span className="gradient-text">Destinations</span></h2>
            <p className="text-slate-400">All with pre-indexed RAG knowledge — ready to plan instantly</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {destinations.map((dest, i) => (
              <motion.div key={dest.name} initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:true }} transition={{ delay:i*0.1 }} whileHover={{ scale:1.05 }}>
                <Link to={isAuthenticated ? '/plan' : '/register'}>
                  <div className={`glass-card p-6 text-center cursor-pointer bg-gradient-to-br ${dest.color}`}>
                    <div className="text-4xl mb-3">{dest.emoji}</div>
                    <div className="font-bold text-white">{dest.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{dest.country}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Sources ──────────────────────────────────────────────────── */}
      <section id="data-sources" className="py-24 px-6" style={{ background:'#111111' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background:'rgba(125,174,168,0.08)', border:'1px solid rgba(125,174,168,0.25)', color:'#7daea8' }}>
              <Database size={12}/> Knowledge Architecture
            </div>
            <h2 className="text-4xl font-bold mb-4">Where We Get <span className="gradient-text">Our Data</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every recommendation is grounded in verified sources — never hallucinated.
              We separate static knowledge (stored in ChromaDB RAG) from live data (always queried fresh).
            </p>
          </motion.div>

          {/* RAG Sources */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-8 mt-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background:'rgba(125,174,168,0.1)', color:'#7daea8', border:'1px solid rgba(125,174,168,0.25)' }}>
                🗃️ RAG Knowledge Base (ChromaDB)
              </div>
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
              <span className="text-xs text-slate-500">Indexed once · retrieved semantically at query time</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ragSources.map((src, i) => (
                <motion.div key={src.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.08 }}
                  className="glass-card p-6 group hover:bg-white/[0.06] transition-all duration-300"
                  style={{ borderColor:src.border }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{src.icon}</span>
                      <div>
                        <h3 className={`font-bold text-sm ${src.color}`}>{src.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background:'rgba(125,174,168,0.1)', color:'#7daea8' }}>{src.badge}</span>
                      </div>
                    </div>
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink size={14}/>
                    </a>
                  </div>

                  <p className="text-slate-400 text-xs mb-3 leading-relaxed">{src.desc}</p>

                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sections Extracted</p>
                    <div className="flex flex-wrap gap-1">
                      {src.sections.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full text-slate-400"
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Stored Fields</p>
                    <div className="flex flex-wrap gap-1">
                      {src.stores.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background:src.border, color:'#e2e8f0' }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      <span className="text-brand-purple font-semibold">RAG Usage: </span>{src.rag}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Live sources */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background:'rgba(200,149,108,0.1)', color:'#c8956c', border:'1px solid rgba(200,149,108,0.25)' }}>
                ⚡ Real-Time APIs (Never Stored)
              </div>
              <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }} />
              <span className="text-xs text-slate-500">Always queried live · never cached in RAG</span>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {liveSources.map((src, i) => (
                <motion.div key={src.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.1 }}
                  className="glass-card p-6 group hover:bg-white/[0.06] transition-all duration-300"
                  style={{ borderColor:src.border }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{src.icon}</span>
                      <div>
                        <h3 className={`font-bold text-sm ${src.color}`}>{src.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background:'rgba(200,149,108,0.1)', color:'#c8956c' }}>Live</span>
                      </div>
                    </div>
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink size={14}/>
                    </a>
                  </div>

                  <p className="text-slate-400 text-xs mb-3 leading-relaxed">{src.desc}</p>

                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Used For</p>
                    <div className="flex flex-wrap gap-1">
                      {src.uses.map((u) => (
                        <span key={u} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background:src.border, color:'#e2e8f0' }}>{u}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      <span className="text-brand-blue font-semibold">Why live: </span>{src.why}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6" style={{ background:'#1a1a1a' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple <span className="gradient-text">Pricing</span></h2>
            <p className="text-slate-400">Start free. Scale as you explore.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name:'Explorer', price:'Free', color:'#7daea8', features:['3 trip plans / month','Basic itinerary','Weather forecast','Interactive map'] },
              { name:'Voyager',  price:'$9/mo', color:'#c8956c', popular:true, features:['Unlimited trips','All data sources','RAG chat assistant','PDF export','Priority support'] },
              { name:'Elite',    price:'$29/mo', color:'#d4b896', features:['Everything in Voyager','Team workspace','API access','Custom branding','Dedicated manager'] },
            ].map((plan) => (
              <motion.div key={plan.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} whileHover={{ scale:1.02 }}
                className="glass-card p-8 relative"
                style={plan.popular ? { borderColor:`${plan.color}40` } : {}}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: plan.color }}>Most Popular</div>
                )}
                <p className="text-sm font-semibold mb-1" style={{ color:plan.color }}>{plan.name}</p>
                <p className="text-4xl font-black text-white mb-4">{plan.price}</p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span style={{ color:plan.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to={isAuthenticated ? '/plan' : '/register'}>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                    style={plan.popular
                      ? { background: plan.color, color:'white' }
                      : { background:'rgba(255,255,255,0.04)', color:'white', border:'1px solid rgba(255,255,255,0.08)' }}>
                    Get Started
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background:'#111111' }}>
        <motion.div initial={{ opacity:0, scale:0.9 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to <span className="gradient-text">Explore?</span></h2>
          <p className="text-slate-400 mb-8">Join thousands of travelers using verified AI to plan perfect trips.</p>
          <Link to={isAuthenticated ? '/plan' : '/register'}>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} className="btn-primary text-lg px-10 py-4">
              <span className="flex items-center gap-2"><Sparkles size={20}/> Plan Your First AI Trip</span>
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t" style={{ borderColor:'rgba(255,255,255,0.06)', background:'#111111' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <span className="font-bold text-slate-300">Compass AI</span>
          </div>
          <p className="text-sm text-slate-600">Built with FastAPI · LangChain · ChromaDB · Gemini 2.5 Pro · React</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <a href="#features"      onClick={(e)=>{ e.preventDefault(); document.getElementById('features')?.scrollIntoView({behavior:'smooth'}); }} className="hover:text-slate-400 cursor-pointer">Features</a>
            <a href="#destinations"  onClick={(e)=>{ e.preventDefault(); document.getElementById('destinations')?.scrollIntoView({behavior:'smooth'}); }} className="hover:text-slate-400 cursor-pointer">Destinations</a>
            <a href="#data-sources"  onClick={(e)=>{ e.preventDefault(); document.getElementById('data-sources')?.scrollIntoView({behavior:'smooth'}); }} className="hover:text-slate-400 cursor-pointer">Data Sources</a>
            <a href="#pricing"       onClick={(e)=>{ e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'}); }} className="hover:text-slate-400 cursor-pointer">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
