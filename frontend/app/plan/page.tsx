"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, TripRequest } from "@/lib/api";

const VIBES = [
  "relaxing", "romantic", "photography", "adventure",
  "food-focused", "nature", "cultural", "beach",
  "nightlife", "budget-friendly", "family", "solo",
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "AED"];

const STEPS = [
  { id: 1, label: "Trip Basics",      icon: "✈️" },
  { id: 2, label: "Group Details",    icon: "👥" },
  { id: 3, label: "Budget & Style",   icon: "💵" },
  { id: 4, label: "Trip Vibe",        icon: "❤️" },
  { id: 5, label: "Stay Preferences", icon: "🏠" },
  { id: 6, label: "Pace & Style",     icon: "⏱️" },
  { id: 7, label: "Personal Touch",   icon: "🌐" },
];

const defaultForm: TripRequest = {
  user_name: "",
  destination: "",
  origin: "",
  departure_date: "",
  return_date: "",
  adults: 1,
  children: 0,
  budget_per_person: 1000,
  currency: "USD",
  trip_vibes: [],
  rooms: 1,
  accommodation_type: "comfort",
  pace: "balanced",
  dietary_preferences: "",
  special_requirements: "",
  openai_api_key: "",
};

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
      />
    </div>
  );
}

function Select({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <select
        {...props}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
      >
        {children}
      </select>
    </div>
  );
}

export default function PlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TripRequest>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof TripRequest, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleVibe = (v: string) =>
    set(
      "trip_vibes",
      form.trip_vibes.includes(v)
        ? form.trip_vibes.filter((x) => x !== v)
        : [...form.trip_vibes, v]
    );

  const next = () => setStep((s) => Math.min(s + 1, 7));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    if (!form.openai_api_key.trim()) {
      setError("OpenAI API key is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const trip = await api.createTrip(form);
      router.push(`/trips/${trip.id}`);
    } catch (e: unknown) {
      let msg = "Something went wrong.";
      if (e && typeof e === "object" && "message" in e) {
        const err = e as { message: string; response?: { data?: { detail?: string } } };
        if ("response" in err && err.response?.data?.detail) {
          msg = err.response.data.detail;
        } else if (err.message === "Network Error") {
          msg = "❌ Cannot connect to the backend. Make sure the FastAPI server is running:\n\ncd backend && uvicorn main:app --reload --port 8000";
        } else {
          msg = err.message;
        }
      }
      setError(msg);
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold mb-2">🧳 Plan Your Perfect Trip</h1>
          <p className="text-gray-500">Tell us about your dream destination and we'll craft the perfect itinerary just for you</p>
        </div>

        {/* Step indicators */}
        <div className="mb-8">
          <div className="flex justify-between mb-3 overflow-x-auto gap-2">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                    step === s.id
                      ? "border-transparent text-white"
                      : step > s.id
                      ? "border-transparent text-white opacity-70"
                      : "border-gray-300 text-gray-400 bg-white"
                  }`}
                  style={step >= s.id ? { background: "#E63946" } : {}}
                >
                  {step > s.id ? "✓" : s.icon}
                </div>
                <span
                  className={`text-xs mt-1 text-center leading-tight ${
                    step === s.id ? "font-bold" : "text-gray-400"
                  }`}
                  style={step === s.id ? { color: "#E63946" } : {}}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="step-progress">
            <div className="step-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          {/* ── Step 1: Trip Basics ─────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-1">✈️ Trip Basics</h2>
              <p className="text-gray-500 text-sm mb-4">Where and when are you going?</p>
              <Input label="✨ What's your name?" placeholder="Your name" value={form.user_name} onChange={(e) => set("user_name", e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="📍 Where are you going?" placeholder="e.g. Paris, Bali, Tokyo" value={form.destination} onChange={(e) => set("destination", e.target.value)} required />
                <Input label="✈️ Where are you starting from?" placeholder="e.g. New York City, Delhi" value={form.origin} onChange={(e) => set("origin", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="📅 Departure Date" type="date" value={form.departure_date} onChange={(e) => set("departure_date", e.target.value)} required />
                <Input label="📅 Return Date" type="date" value={form.return_date} onChange={(e) => set("return_date", e.target.value)} required />
              </div>
            </div>
          )}

          {/* ── Step 2: Group Details ───────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-1">👥 Group Details</h2>
              <p className="text-gray-500 text-sm mb-4">Who's coming along?</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">👤 Adults</label>
                  <input type="number" min={1} max={20} value={form.adults}
                    onChange={(e) => set("adults", Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">🧒 Children</label>
                  <input type="number" min={0} max={10} value={form.children}
                    onChange={(e) => set("children", Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
              </div>
              {form.children > 0 && (
                <Input label="Children's ages (comma-separated)" placeholder="e.g. 5, 8, 12"
                  value={form.children_ages || ""} onChange={(e) => set("children_ages", e.target.value)} />
              )}
            </div>
          )}

          {/* ── Step 3: Budget & Style ──────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-1">💵 Budget & Style</h2>
              <p className="text-gray-500 text-sm mb-4">What's your budget per person?</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">💰 Budget per person (total trip)</label>
                  <input type="number" min={100} step={50} value={form.budget_per_person}
                    onChange={(e) => set("budget_per_person", Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <Select label="Currency" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
            </div>
          )}

          {/* ── Step 4: Trip Vibe ───────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-1">❤️ Trip Vibe</h2>
              <p className="text-gray-500 text-sm mb-4">Select all that resonate with your ideal trip</p>
              <div className="flex flex-wrap gap-3">
                {VIBES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleVibe(v)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      form.trip_vibes.includes(v)
                        ? "text-white border-transparent"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                    style={form.trip_vibes.includes(v) ? { background: "#E63946", borderColor: "#E63946" } : {}}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 5: Stay Preferences ────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-1">🏠 Stay Preferences</h2>
              <p className="text-gray-500 text-sm mb-4">Tell us about your ideal accommodation</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">🛏️ Number of Rooms</label>
                  <input type="number" min={1} max={10} value={form.rooms}
                    onChange={(e) => set("rooms", Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <Select label="🏨 Accommodation Type" value={form.accommodation_type}
                  onChange={(e) => set("accommodation_type", e.target.value)}>
                  <option value="backpacker">Backpacker / Hostel</option>
                  <option value="comfort">Comfort (3★)</option>
                  <option value="eco-conscious">Eco-conscious</option>
                  <option value="boutique">Boutique Hotel</option>
                  <option value="luxury">Luxury (5★)</option>
                </Select>
              </div>
            </div>
          )}

          {/* ── Step 6: Pace & Style ────────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-1">⏱️ Pace & Style</h2>
              <p className="text-gray-500 text-sm mb-4">How do you like to travel?</p>
              <div className="space-y-3">
                {[
                  { val: "quite busy", label: "Quite Busy", desc: "Packed days, maximum sights and experiences" },
                  { val: "balanced", label: "Balanced", desc: "A mix of activities and downtime" },
                  { val: "mostly relaxed", label: "Mostly Relaxed", desc: "Slow travel, savoring each moment" },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.pace === opt.val ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input type="radio" name="pace" value={opt.val} checked={form.pace === opt.val}
                      onChange={() => set("pace", opt.val)} className="sr-only" />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        form.pace === opt.val ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {form.pace === opt.val && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#E63946" }} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-gray-500 text-sm">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 7: Personal Touch ──────────────────────────────── */}
          {step === 7 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-1">🌐 Personal Touch</h2>
              <p className="text-gray-500 text-sm mb-4">Final details to make your trip perfect</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  🔑 OpenAI API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={form.openai_api_key}
                  onChange={(e) => set("openai_api_key", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get one at{" "}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                    platform.openai.com/api-keys
                  </a>. Never stored.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">🥗 Dietary Preferences</label>
                <input
                  placeholder="e.g. vegetarian, gluten-free, halal"
                  value={form.dietary_preferences || ""}
                  onChange={(e) => set("dietary_preferences", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">📝 Special Requirements</label>
                <textarea
                  rows={3}
                  placeholder="e.g. wheelchair accessible, travelling with a baby, anniversary celebration..."
                  value={form.special_requirements || ""}
                  onChange={(e) => set("special_requirements", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prev}
            disabled={step === 1}
            className="px-6 py-3 rounded-lg border border-gray-300 font-semibold text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>

          {step < 7 ? (
            <button
              onClick={next}
              className="px-6 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: "#E63946" }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="px-8 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
              style={{ background: "#E63946" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Crafting your trip…
                </>
              ) : (
                "🚀 Generate My Trip Plan"
              )}
            </button>
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-10 max-w-sm text-center shadow-xl">
              <div className="text-5xl mb-4 animate-bounce">✈️</div>
              <h3 className="text-xl font-bold mb-2">Your AI team is at work</h3>
              <p className="text-gray-500 text-sm mb-4">
                First, the RAG knowledge base is fetching verified travel data for your destination from Wikipedia. Then six specialized agents research flights, hotels, dining, and craft your day-by-day itinerary.
              </p>
              <p className="text-xs text-gray-400 mb-6">This takes about 60–90 seconds.</p>
              <div className="flex justify-center gap-3 text-2xl">
                {["🏛️","🏨","🍽️","💰","✈️","🗓️"].map((icon, i) => (
                  <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{icon}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
