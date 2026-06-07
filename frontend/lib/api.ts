import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TripRequest {
  user_name: string;
  destination: string;
  origin: string;
  departure_date: string;
  return_date: string;
  adults: number;
  children: number;
  children_ages?: string;
  budget_per_person: number;
  currency: string;
  trip_vibes: string[];
  rooms: number;
  accommodation_type: string;
  pace: string;
  dietary_preferences?: string;
  special_requirements?: string;
  openai_api_key: string;
}

export interface Hotel {
  name: string;
  address: string;
  price_total: string;
  amenities: string[];
  website_url: string;
}

export interface Flight {
  airline: string;
  duration: string;
  price_per_person: string;
  stops: number;
  departure_time: string;
  arrival_time: string;
  booking_url: string;
}

export interface DayPlan {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  note: string;
}

export interface Trip {
  id: string;
  user_name: string;
  destination: string;
  origin: string;
  departure_date: string;
  return_date: string;
  duration_days: number;
  adults: number;
  children: number;
  budget_per_person: string;
  currency: string;
  accommodation_type: string;
  trip_vibes: string[];
  pace: string;
  hotels: Hotel[];
  flights: Flight[];
  itinerary: DayPlan[];
  destination_overview: string;
  budget_summary: string;
  created_at: string;
}

export const api = {
  createTrip: (data: TripRequest) =>
    axios.post<Trip>(`${BASE}/api/trips`, data).then((r) => r.data),

  getTrips: () =>
    axios.get<Trip[]>(`${BASE}/api/trips`).then((r) => r.data),

  getTrip: (id: string) =>
    axios.get<Trip>(`${BASE}/api/trips/${id}`).then((r) => r.data),

  deleteTrip: (id: string) =>
    axios.delete(`${BASE}/api/trips/${id}`).then((r) => r.data),
};
