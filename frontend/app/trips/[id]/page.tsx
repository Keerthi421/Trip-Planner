"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Trip } from "@/lib/api";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">{title}</h2>
      {children}
    </section>
  );
}

function HotelCard({ hotel }: { hotel: Trip["hotels"][0] }) {
  return (
    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden border-l-4" style={{ borderLeftColor: "#E63946" }}>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">{hotel.name}</h3>
        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <p>📍 {hotel.address}</p>
          <p>💵 {hotel.price_total}</p>
          {hotel.amenities.length > 0 && (
            <div>
              <p className="font-semibold mb-1">Amenities:</p>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span key={a} className="px-3 py-1 border border-gray-200 rounded-full text-xs flex items-center gap-1">
                    📶 {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {hotel.website_url && (
        <div className="border-t border-gray-100 px-6 py-3">
          <a
            href={hotel.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: "#E63946" }}
          >
            Visit Hotel Website 🌐
          </a>
        </div>
      )}
    </div>
  );
}

function FlightCard({ flight }: { flight: Trip["flights"][0] }) {
  return (
    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden border-l-4" style={{ borderLeftColor: "#E63946" }}>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">✈️ {flight.airline}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="text-gray-400 text-xs mb-1">Duration</p>
            <p className="font-medium">{flight.duration}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Price</p>
            <p className="font-medium">{flight.price_per_person}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Departure</p>
            <p className="font-medium">{flight.departure_time}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Arrival</p>
            <p className="font-medium">{flight.arrival_time}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Stops</p>
            <p className="font-medium">{flight.stops}</p>
          </div>
        </div>
      </div>
      {flight.booking_url && (
        <div className="border-t border-gray-100 px-6 py-3">
          <a
            href={flight.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: "#E63946" }}
          >
            Book / View Flight 🌐
          </a>
        </div>
      )}
    </div>
  );
}

function DayCard({ day }: { day: Trip["itinerary"][0] }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: "#E63946" }}
        >
          {day.day}
        </div>
        <h3 className="font-bold">Day {day.day}</h3>
      </div>
      <div className="p-4">
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          {[
            { label: "☀️ Morning", text: day.morning },
            { label: "☀️ Afternoon", text: day.afternoon },
            { label: "🌙 Evening", text: day.evening },
          ].map((slot) => (
            <div key={slot.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">{slot.label}</p>
              <p className="text-sm text-gray-800">{slot.text}</p>
            </div>
          ))}
        </div>
        {day.note && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{ background: "#FFFDE7" }}>
            <span className="text-base flex-shrink-0">📎</span>
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> {day.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTrip(id)
      .then(setTrip)
      .catch(() => router.push("/trips"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="text-center py-24 text-gray-400">
        <div className="text-4xl mb-3 animate-pulse">✈️</div>
        <p>Loading your trip…</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back */}
      <Link href="/trips" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-6">
        ← Back to My Trips
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2">
          📍 {trip.destination}
        </h1>
        <p className="text-gray-500">
          {trip.user_name} · {trip.origin} → {trip.destination} · {trip.departure_date} – {trip.return_date} ({trip.duration_days} days)
        </p>
        {trip.trip_vibes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {trip.trip_vibes.map((v) => (
              <span key={v} className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-300 text-gray-800">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Overview */}
      {trip.destination_overview && (
        <Section title="🌍 Destination Overview">
          <p className="text-gray-700 leading-relaxed">{trip.destination_overview}</p>
        </Section>
      )}

      {/* Budget Summary */}
      {trip.budget_summary && (
        <div className="mb-8 p-5 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-1">BUDGET SUMMARY</p>
          <p className="text-sm text-gray-700">{trip.budget_summary}</p>
        </div>
      )}

      {/* Accommodation */}
      {trip.hotels.length > 0 && (
        <Section title="🏨 Accommodation">
          <div className="space-y-4">
            {trip.hotels.map((h, i) => <HotelCard key={i} hotel={h} />)}
          </div>
        </Section>
      )}

      {/* Flights */}
      {trip.flights.length > 0 && (
        <Section title="✈️ Flights">
          <div className="space-y-4">
            {trip.flights.map((f, i) => <FlightCard key={i} flight={f} />)}
          </div>
        </Section>
      )}

      {/* Itinerary */}
      {trip.itinerary.length > 0 && (
        <Section title="📅 Daily Itinerary">
          {trip.itinerary.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </Section>
      )}

      {/* Footer actions */}
      <div className="flex gap-4 pt-8 border-t border-gray-100">
        <Link
          href="/plan"
          className="px-6 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          style={{ background: "#E63946" }}
        >
          Plan Another Trip
        </Link>
        <Link
          href="/trips"
          className="px-6 py-3 rounded-lg border border-gray-300 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          All Trips
        </Link>
      </div>
    </div>
  );
}
