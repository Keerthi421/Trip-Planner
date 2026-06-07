import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, MapPin, Calendar, DollarSign, Users, Heart, Star } from 'lucide-react';
import { createTrip } from '../services/api';
import { generateItinerary } from '../services/api';

const PREFERENCES = [
  { label: 'Historical', emoji: '🏛️' },
  { label: 'Adventure', emoji: '🧗' },
  { label: 'Nature', emoji: '🌿' },
  { label: 'Beaches', emoji: '🏖️' },
  { label: 'Food', emoji: '🍜' },
  { label: 'Shopping', emoji: '🛍️' },
  { label: 'Nightlife', emoji: '🌃' },
  { label: 'Photography', emoji: '📸' },
  { label: 'Family Friendly', emoji: '👨‍👩‍👧' },
  { label: 'Solo Travel', emoji: '🎒' },
];

const REQUIREMENTS = [
  { label: 'Vegetarian Food', emoji: '🥗' },
  { label: 'Wheelchair Accessible', emoji: '♿' },
  { label: 'Kid Friendly', emoji: '🧒' },
  { label: 'Non-Smoking', emoji: '🚭' },
  { label: 'Budget Meals', emoji: '💰' },
  { label: 'Skip Tourist Traps', emoji: '🙈' },
];

const BUDGETS = [
  { value: 'low', label: 'Budget', emoji: '🎒', desc: 'Hostels, street food, free attractions' },
  { value: 'medium', label: 'Standard', emoji: '⭐', desc: 'Mid-range hotels, restaurants, paid attractions' },
  { value: 'luxury', label: 'Luxury', emoji: '💎', desc: '5-star hotels, fine dining, VIP experiences' },
] as const;

const STEPS = [
  { label: 'Destination', icon: <MapPin size={18} /> },
  { label: 'Dates', icon: <Calendar size={18} /> },
  { label: 'Budget', icon: <DollarSign size={18} /> },
  { label: 'Travelers', icon: <Users size={18} /> },
  { label: 'Preferences', icon: <Heart size={18} /> },
  { label: 'Requirements', icon: <Star size={18} /> },
  { label: 'Review', icon: <CheckCircle2 size={18} /> },
];

const LOADING_STEPS = [
  'Fetching coordinates from OpenStreetMap...',
  'Collecting attractions via Overpass API...',
  'Fetching 7-day weather forecast...',
  'Downloading Wikipedia knowledge...',
  'Indexing data into ChromaDB RAG...',
  'Generating itinerary with Gemini AI...',
  'Finalizing your perfect trip...',
];

export default function Plan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numDays, setNumDays] = useState(5);
  const [budget, setBudget] = useState<'low' | 'medium' | 'luxury'>('medium');
  const [numTravelers, setNumTravelers] = useState(1);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [error, setError] = useState('');

  const togglePref = (pref: string) =>
    setPreferences((prev) => prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]);

  const toggleReq = (req: string) =>
    setRequirements((prev) => prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]);

  const handleDateChange = (start: string, end: string) => {
    if (start && end) {
      const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) setNumDays(diff);
    }
  };

  const canNext = () => {
    if (step === 0) return destination.trim().length > 0;
    return true;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratingStep(0);

    try {
      // Simulate loading steps
      const interval = setInterval(() => {
        setGeneratingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
      }, 1500);

      // Create trip
      const trip = await createTrip({
        destination,
        country,
        start_date: startDate,
        end_date: endDate,
        num_days: numDays,
        budget,
        num_travelers: numTravelers,
        preferences,
        special_requirements: requirements,
      });

      // Generate itinerary
      await generateItinerary(trip.id);

      clearInterval(interval);
      navigate(`/dashboard/${trip.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate itinerary. Please try again.');
      setIsGenerating(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16"
        style={{ background: 'linear-gradient(135deg, #111111, #1a1a1a)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-6 animate-float">🌍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Building Your Trip</h2>
          <p className="text-slate-400 mb-8">{LOADING_STEPS[generatingStep]}</p>

          <div className="flex justify-center gap-1 mb-8">
            {LOADING_STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
                i <= generatingStep ? 'bg-brand-blue w-6' : 'bg-slate-700 w-3'
              }`} />
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {['🗺️', '🌤️', '🤖', '✨'].map((emoji, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                className="text-2xl"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-24 pb-12" style={{ background: 'linear-gradient(135deg, #111111, #1a1a1a)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Plan Your <span className="gradient-text">AI Trip</span></h1>
          <p className="text-slate-400">Answer a few questions and let AI do the rest</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex items-center gap-1">
              <div
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-brand-blue' : 'bg-slate-800'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="text-brand-blue">{STEPS[step].icon}</div>
          <span className="text-sm text-slate-400">Step {step + 1} of {STEPS.length}</span>
          <span className="text-white font-semibold">— {STEPS[step].label}</span>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="glass-card p-8"
          >
            {/* Step 0: Destination */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Where do you want to go?</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="input-dark pl-11 text-lg"
                      placeholder="e.g. Paris, Tokyo, Bali..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Country <span className="text-slate-500">(optional)</span></label>
                  <input
                    className="input-dark"
                    placeholder="e.g. France, Japan, Indonesia..."
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Dates */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      className="input-dark"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        handleDateChange(e.target.value, endDate);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                    <input
                      type="date"
                      className="input-dark"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        handleDateChange(startDate, e.target.value);
                      }}
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Number of Days</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setNumDays(Math.max(1, numDays - 1))}
                      className="w-10 h-10 rounded-xl border border-slate-700 text-white hover:bg-white/10 transition-colors flex items-center justify-center font-bold">
                      −
                    </button>
                    <span className="text-3xl font-bold text-white w-16 text-center">{numDays}</span>
                    <button onClick={() => setNumDays(Math.min(30, numDays + 1))}
                      className="w-10 h-10 rounded-xl border border-slate-700 text-white hover:bg-white/10 transition-colors flex items-center justify-center font-bold">
                      +
                    </button>
                    <span className="text-slate-400">days</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Budget */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm mb-4">Choose your travel style</p>
                {BUDGETS.map((b) => (
                  <motion.div
                    key={b.value}
                    onClick={() => setBudget(b.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      budget === b.value
                        ? 'border-brand-blue bg-brand-blue/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{b.emoji}</span>
                      <div>
                        <div className="font-bold text-white text-lg">{b.label}</div>
                        <div className="text-slate-400 text-sm">{b.desc}</div>
                      </div>
                      {budget === b.value && (
                        <CheckCircle2 size={20} className="ml-auto text-brand-blue" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Step 3: Travelers */}
            {step === 3 && (
              <div className="text-center space-y-8">
                <p className="text-slate-400">How many travelers?</p>
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={() => setNumTravelers(Math.max(1, numTravelers - 1))}
                    className="w-14 h-14 rounded-2xl border border-slate-600 text-white hover:bg-white/10 transition-colors flex items-center justify-center text-2xl font-bold"
                  >
                    −
                  </button>
                  <div>
                    <div className="text-7xl font-black text-white">{numTravelers}</div>
                    <div className="text-slate-400 text-sm mt-1">{numTravelers === 1 ? 'traveler' : 'travelers'}</div>
                  </div>
                  <button
                    onClick={() => setNumTravelers(Math.min(20, numTravelers + 1))}
                    className="w-14 h-14 rounded-2xl border border-slate-600 text-white hover:bg-white/10 transition-colors flex items-center justify-center text-2xl font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: Math.min(numTravelers, 8) }).map((_, i) => (
                    <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">
                      👤
                    </motion.span>
                  ))}
                  {numTravelers > 8 && <span className="text-slate-400 text-lg">+{numTravelers - 8}</span>}
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div>
                <p className="text-slate-400 text-sm mb-4">Select all that apply</p>
                <div className="flex flex-wrap gap-3">
                  {PREFERENCES.map((pref) => (
                    <motion.button
                      key={pref.label}
                      onClick={() => togglePref(pref.label)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                        preferences.includes(pref.label)
                          ? 'border-brand-purple bg-brand-purple/20 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {pref.emoji} {pref.label}
                    </motion.button>
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-4">{preferences.length} selected</p>
              </div>
            )}

            {/* Step 5: Requirements */}
            {step === 5 && (
              <div>
                <p className="text-slate-400 text-sm mb-4">Any special requirements?</p>
                <div className="flex flex-wrap gap-3">
                  {REQUIREMENTS.map((req) => (
                    <motion.button
                      key={req.label}
                      onClick={() => toggleReq(req.label)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                        requirements.includes(req.label)
                          ? 'border-brand-pink bg-brand-pink/20 text-white'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {req.emoji} {req.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Trip Summary</h3>
                {[
                  { icon: '📍', label: 'Destination', value: `${destination}${country ? `, ${country}` : ''}` },
                  { icon: '📅', label: 'Dates', value: startDate && endDate ? `${startDate} → ${endDate}` : `${numDays} days (flexible)` },
                  { icon: '💰', label: 'Budget', value: BUDGETS.find((b) => b.value === budget)?.label || budget },
                  { icon: '👥', label: 'Travelers', value: `${numTravelers} ${numTravelers === 1 ? 'traveler' : 'travelers'}` },
                  { icon: '❤️', label: 'Preferences', value: preferences.length > 0 ? preferences.join(', ') : 'None selected' },
                  { icon: '⚙️', label: 'Requirements', value: requirements.length > 0 ? requirements.join(', ') : 'None' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                      <div className="text-sm text-white font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}

                {error && (
                  <div className="p-3 rounded-xl text-sm text-red-400"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    {error}
                  </div>
                )}

                <motion.button
                  onClick={handleGenerate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2 mt-2"
                >
                  ✨ Generate My AI Itinerary
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 6 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={goPrev}
              disabled={step === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                step === 0
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 text-slate-300 hover:bg-white/5'
              }`}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={goNext}
              disabled={!canNext()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                canNext()
                  ? 'btn-primary'
                  : 'opacity-40 cursor-not-allowed bg-slate-700 text-slate-400'
              }`}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
