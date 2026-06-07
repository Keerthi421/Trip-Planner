import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrips, deleteTrip, duplicateTrip } from '../services/api';
import { PlusCircle, Trash2, Copy, Eye, MapPin, Calendar, Loader2, AlertCircle } from 'lucide-react';
import type { TripList } from '../types';

const STATUS_COLORS: Record<string, string> = {
  planning: '#d4b896',
  generated: '#7daea8',
  saved: '#8aab9c',
};

const DEST_GRADIENTS = [
  'from-stone-700 to-stone-800',
  'from-stone-600 to-stone-800',
  'from-stone-700 to-stone-900',
  'from-stone-600 to-stone-700',
  'from-stone-700 to-stone-800',
  'from-stone-600 to-stone-900',
];

const EMOJIS = ['🗼', '⛩️', '🌴', '🏔️', '🏙️', '🏛️', '🌊', '🏝️', '🗽', '🕌'];

function TripSkeleton() {
  return (
    <div className="glass-card p-0 overflow-hidden animate-pulse">
      <div className="h-32 bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
        <div className="h-3 bg-slate-800 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function Trips() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
  });

  const { mutate: doDelete } = useMutation({
    mutationFn: (id: number) => deleteTrip(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => {
      setDeletingId(null);
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const { mutate: doDuplicate } = useMutation({
    mutationFn: (id: number) => duplicateTrip(id),
    onMutate: (id) => setDuplicatingId(id),
    onSuccess: (trip) => {
      qc.invalidateQueries({ queryKey: ['trips'] });
      navigate(`/dashboard/${trip.id}`);
    },
    onSettled: () => setDuplicatingId(null),
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-6" style={{ background: '#111111' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">My Trips</h1>
            <p className="text-slate-400 mt-1">
              {trips ? `${trips.length} trip${trips.length !== 1 ? 's' : ''}` : 'Loading...'}
            </p>
          </div>
          <Link to="/plan">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Plan New Trip
            </motion.button>
          </Link>
        </motion.div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <TripSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && trips && trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="text-7xl mb-6">🗺️</div>
            <h2 className="text-2xl font-bold text-white mb-3">No trips yet</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Let our AI plan your first adventure. Just enter a destination and we'll handle the rest.
            </p>
            <Link to="/plan">
              <button className="btn-primary flex items-center gap-2 mx-auto">
                <PlusCircle size={18} />
                Plan Your First Trip
              </button>
            </Link>
          </motion.div>
        )}

        <AnimatePresence>
          {trips && trips.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {trips.map((trip: TripList, index: number) => {
                const gradient = DEST_GRADIENTS[index % DEST_GRADIENTS.length];
                const emoji = EMOJIS[index % EMOJIS.length];
                const statusColor = STATUS_COLORS[trip.status] || '#64748b';

                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="glass-card overflow-hidden group"
                  >
                    {/* Card header gradient */}
                    <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                      <span className="text-5xl drop-shadow-lg">{emoji}</span>
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-xs px-2 py-1 rounded-full font-semibold capitalize"
                          style={{
                            background: `${statusColor}20`,
                            border: `1px solid ${statusColor}40`,
                            color: statusColor,
                          }}
                        >
                          {trip.status}
                        </span>
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg mb-1 truncate">{trip.title}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
                        <MapPin size={13} />
                        <span className="truncate">{trip.destination}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {trip.start_date ? trip.start_date : 'Flexible dates'}
                        </div>
                        <div>{trip.num_days} days</div>
                        <div className="capitalize">{trip.budget}</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link to={`/dashboard/${trip.id}`} className="flex-1">
                          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-white transition-all hover:bg-white/10"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Eye size={15} />
                            View
                          </button>
                        </Link>
                        <button
                          onClick={() => doDuplicate(trip.id)}
                          disabled={duplicatingId === trip.id}
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-all hover:bg-white/10"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                          title="Duplicate"
                        >
                          {duplicatingId === trip.id ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${trip.title}"?`)) doDelete(trip.id);
                          }}
                          disabled={deletingId === trip.id}
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 transition-all hover:bg-red-500/10"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                          title="Delete"
                        >
                          {deletingId === trip.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}