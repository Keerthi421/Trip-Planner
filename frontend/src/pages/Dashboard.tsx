import { useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrip, generateItinerary, exportPDF, regenerateDay } from '../services/api';
import { Loader2, MessageCircle, Download, RefreshCw, Sun, CloudRain, Cloud, MapPin, Clock, DollarSign, Utensils, Sunset } from 'lucide-react';
import type { DayItinerary, WeatherDay, FullItinerary } from '../types';

const TripMap = lazy(() => import('../components/map/TripMap'));

const DAY_COLORS = ['#c8956c', '#7daea8', '#b8847c', '#d4b896', '#9a8a7a', '#8aab9c', '#c4a882'];

function WeatherIcon({ desc }: { desc: string }) {
  const d = desc.toLowerCase();
  if (d.includes('rain') || d.includes('drizzle')) return <CloudRain size={20} className="text-brand-purple" />;
  if (d.includes('cloud')) return <Cloud size={20} className="text-slate-400" />;
  return <Sun size={20} className="text-brand-orange" />;
}

function ActivityCard({ title, icon, data, color }: { title: string; icon: React.ReactNode; data: any; color: string }) {
  if (!data) return null;
  const name = data.activity || data.restaurant || '';
  const desc = data.description || '';
  const cost = data.cost;
  const duration = data.duration;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</div>
          {cost !== undefined && cost !== null && (
            <div className="text-xs text-brand-purple font-semibold">${cost}</div>
          )}
        </div>
        <div className="text-sm font-semibold text-white mt-0.5 truncate">{name}</div>
        {desc && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{desc}</div>}
        {duration && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={11} />{duration}</div>}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { tripId } = useParams<{ tripId: string }>();
  const qc = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(1);
  const [mapSelectedDay, setMapSelectedDay] = useState(0); // 0 = show all

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(Number(tripId)),
    enabled: !!tripId,
  });

  const { mutate: generate, isPending: isGenerating } = useMutation({
    mutationFn: () => generateItinerary(Number(tripId), true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const { mutate: regenDay, isPending: isRegenerating } = useMutation({
    mutationFn: () => regenerateDay(Number(tripId), selectedDay),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const handleExport = async () => {
    try {
      const md = await exportPDF(Number(tripId));
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trip?.destination || 'trip'}-itinerary.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-slate-400">Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="text-5xl mb-4">🤔</div>
          <p className="text-white text-xl font-bold">Trip not found</p>
          <Link to="/trips" className="text-brand-blue mt-4 inline-block">← My Trips</Link>
        </div>
      </div>
    );
  }

  const itinerary: FullItinerary | null = trip.itinerary_data || null;
  const weather = trip.weather_data;
  const currentDay = itinerary?.days?.find((d) => d.day_number === selectedDay);
  const allAttractions = itinerary?.days?.flatMap((d) => d.attractions || []) || [];

  if (trip.status === 'planning' || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold text-white mb-2">{trip.destination}</h2>
          <p className="text-slate-400 mb-8">Your itinerary hasn't been generated yet.</p>
          <motion.button
            onClick={() => generate()}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Generating...</> : '✨ Generate Itinerary'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" style={{ background: '#111111' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Link to="/trips" className="hover:text-white transition-colors">My Trips</Link>
              <span>/</span>
              <span className="text-white">{trip.destination}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{trip.title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {trip.num_days} days · {trip.budget} budget · {trip.num_travelers} traveler{trip.num_travelers !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/chat?tripId=${tripId}`}>
              <button className="btn-secondary flex items-center gap-2 text-sm py-2">
                <MessageCircle size={16} /> Chat
              </button>
            </Link>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm py-2">
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => generate()}
              disabled={isGenerating}
              className="btn-secondary flex items-center gap-2 text-sm py-2"
            >
              <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
              Regenerate
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            {/* Trip Summary */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-brand-blue" /> Trip Summary
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Destination', `${trip.destination}${trip.country ? `, ${trip.country}` : ''}`],
                  ['Dates', trip.start_date && trip.end_date ? `${trip.start_date} → ${trip.end_date}` : 'Flexible'],
                  ['Duration', `${trip.num_days} days`],
                  ['Budget', trip.budget.charAt(0).toUpperCase() + trip.budget.slice(1)],
                  ['Travelers', String(trip.num_travelers)],
                  ['Est. Total', itinerary.total_budget ? `$${itinerary.total_budget}` : 'N/A'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather */}
            {weather?.forecast && (
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Sun size={16} className="text-brand-orange" /> Weather Forecast
                </h3>
                <div className="space-y-2">
                  {weather.forecast.slice(0, 7).map((day: WeatherDay, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 w-24">
                        <WeatherIcon desc={day.description} />
                        <span className="text-slate-400 text-xs">{day.date.slice(5)}</span>
                      </div>
                      <span className="text-slate-300 text-xs flex-1 px-2 truncate">{day.description}</span>
                      <span className="text-white text-xs font-medium">{day.temp_min}°–{day.temp_max}°</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Breakdown */}
            {itinerary.days && (
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-brand-purple" /> Budget Breakdown
                </h3>
                <div className="space-y-2">
                  {itinerary.days.slice(0, 5).map((day: DayItinerary) => (
                    <div key={day.day_number} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-12">Day {day.day_number}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((day.total_cost || 0) / (itinerary.total_budget || 1)) * itinerary.days.length * 100)}%`,
                            background: DAY_COLORS[(day.day_number - 1) % DAY_COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs text-white font-medium w-12 text-right">${day.total_cost || 0}</span>
                    </div>
                  ))}
                </div>
                {itinerary.total_budget && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between text-sm">
                    <span className="text-slate-400">Total</span>
                    <span className="text-brand-purple font-bold">${itinerary.total_budget}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="font-bold text-white mb-4">💡 Travel Tips</h3>
                <ul className="space-y-2">
                  {itinerary.tips.slice(0, 5).map((tip: string, i: number) => (
                    <li key={i} className="text-sm text-slate-400 flex gap-2">
                      <span className="text-brand-blue mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Map */}
            <div className="glass-card overflow-hidden" style={{ height: '380px' }}>
              <Suspense fallback={
                <div className="h-full flex items-center justify-center bg-slate-900">
                  <Loader2 size={24} className="animate-spin text-brand-blue" />
                </div>
              }>
                <TripMap
                  attractions={allAttractions}
                  days={itinerary.days || []}
                  selectedDay={mapSelectedDay}
                />
              </Suspense>
            </div>

            {/* Day selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {itinerary.days?.map((day: DayItinerary) => (
                <button
                  key={day.day_number}
                  onClick={() => {
                    setSelectedDay(day.day_number);
                    setMapSelectedDay(day.day_number);
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedDay === day.day_number
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  style={
                    selectedDay === day.day_number
                      ? {
                          background: `${DAY_COLORS[(day.day_number - 1) % DAY_COLORS.length]}30`,
                          border: `1px solid ${DAY_COLORS[(day.day_number - 1) % DAY_COLORS.length]}60`,
                          color: DAY_COLORS[(day.day_number - 1) % DAY_COLORS.length],
                        }
                      : { border: '1px solid transparent' }
                  }
                >
                  Day {day.day_number}
                </button>
              ))}
            </div>

            {/* Day Detail */}
            <AnimatePresence mode="wait">
              {currentDay && (
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-5 space-y-3"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">Day {currentDay.day_number}</h3>
                    <button
                      onClick={() => regenDay()}
                      disabled={isRegenerating}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                      Regenerate Day
                    </button>
                  </div>

                  <ActivityCard title="Morning" icon={<Sun size={16} />} data={currentDay.morning} color="#d4b896" />
                  <ActivityCard title="Lunch" icon={<Utensils size={16} />} data={currentDay.lunch} color="#7daea8" />
                  <ActivityCard title="Afternoon" icon={<MapPin size={16} />} data={currentDay.afternoon} color="#c8956c" />
                  <ActivityCard title="Evening" icon={<Sunset size={16} />} data={currentDay.evening} color="#b8847c" />
                  <ActivityCard title="Dinner" icon={<Utensils size={16} />} data={currentDay.dinner} color="#9a8a7a" />

                  {(currentDay.total_cost || currentDay.transport_cost) && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm">
                      <div className="flex gap-4">
                        {currentDay.transport_cost && (
                          <span className="text-slate-400">Transport: <span className="text-white">${currentDay.transport_cost}</span></span>
                        )}
                      </div>
                      {currentDay.total_cost && (
                        <div className="font-bold text-brand-purple">Day Total: ${currentDay.total_cost}</div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
