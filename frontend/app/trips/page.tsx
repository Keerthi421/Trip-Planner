"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Trip } from "@/lib/api";

function TripCard({ trip }: { trip: Trip }) {
  const travelers =
    trip.adults + trip.children > 1
      ? `${trip.adults} adult${trip.adults > 1 ? "s" : ""}${trip.children > 0 ? `, ${trip.children} child${trip.children > 1 ? "ren" : ""}` : ""}`
      : "1 adult";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-xl font-bold mb-0.5">{trip.destination}</h3>
        <p className="text-gray-500 text-sm">{trip.user_name}</p>
      </div>

      <div className="space-y-1.5 text-sm text-gray-600">
        <p>✈️ From {trip.origin}</p>
        <p>
          📅 {trip.departure_date} – {trip.return_date}
        </p>
        <p>⏱️ {trip.duration_days} days</p>
        <p>👥 {travelers}</p>
        <p>💰 {trip.budget_per_person} per person</p>
        <p>🏠 {trip.duration_days} night(s), {trip.accommodation_type}</p>
      </div>

      {trip.trip_vibes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trip.trip_vibes.map((v) => (
            <span key={v} className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-300 text-gray-800">
              {v}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">Pace: {trip.pace}</p>

      <p className="text-xs text-gray-300">
        Created {new Date(trip.created_at).toLocaleString()}
      </p>

      <div className="flex gap-3 mt-auto">
        <Link
          href={`/trips/${trip.id}`}
          className="flex-1 text-center py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          View Details
        </Link>
        <Link
          href={`/trips/${trip.id}`}
          className="flex-1 text-center py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: "#E63946" }}
        >
          Edit Plan
        </Link>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .getTrips()
      .then(setTrips)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">🧳 Your Trip Plans</h1>
          <p className="text-gray-500 text-sm">Manage and review all your planned adventures</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            🔄 Refresh
          </button>
          <Link
            href="/plan"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: "#E63946" }}
          >
            + New Trip Plan
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-4xl mb-3 animate-pulse">✈️</div>
          <p>Loading your trips…</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="font-semibold text-lg mb-2">No trips yet</p>
          <p className="text-sm mb-6">Create your first AI-powered travel plan</p>
          <Link
            href="/plan"
            className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "#E63946" }}
          >
            Plan a Trip
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{trips.length} plan{trips.length !== 1 ? "s" : ""} found</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
