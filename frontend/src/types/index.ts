export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  created_at: string;
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  num_days: number;
  budget: 'low' | 'medium' | 'luxury';
  num_travelers: number;
  preferences: string[];
  special_requirements: string[];
  status: 'planning' | 'generated' | 'saved';
  itinerary_data?: FullItinerary;
  weather_data?: WeatherData;
  created_at: string;
}

export interface TripCreate {
  destination: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  num_days: number;
  budget: 'low' | 'medium' | 'luxury';
  num_travelers: number;
  preferences: string[];
  special_requirements: string[];
}

export interface TripList {
  id: number;
  title: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  num_days: number;
  budget: string;
  status: string;
  created_at: string;
}

export interface DayActivity {
  activity: string;
  description: string;
  duration?: string;
  cost?: number;
  lat?: number;
  lng?: number;
  place_name?: string;
}

export interface DayMeal {
  restaurant: string;
  description: string;
  cost?: number;
  lat?: number;
  lng?: number;
}

export interface Attraction {
  name: string;
  lat?: number;
  lng?: number;
  type?: string;
  description?: string;
  rating?: number;
}

export interface DayItinerary {
  day_number: number;
  morning?: DayActivity;
  lunch?: DayMeal;
  afternoon?: DayActivity;
  evening?: DayActivity;
  dinner?: DayMeal;
  transport_cost?: number;
  total_cost?: number;
  attractions?: Attraction[];
}

export interface FullItinerary {
  trip_id?: number;
  destination: string;
  days: DayItinerary[];
  total_budget?: number;
  weather_summary?: string;
  tips?: string[];
}

export interface WeatherDay {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

export interface WeatherData {
  forecast: WeatherDay[];
  city: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export interface ChatResponse {
  response: string;
  sources: string[];
}
