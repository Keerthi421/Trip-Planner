import axios from 'axios';
import type { AuthToken, User, Trip, TripCreate, TripList, FullItinerary, DayItinerary, ChatResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401 redirect
// Skip auth endpoints so login/register errors show in the form
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (email: string, password: string): Promise<AuthToken> => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  const response = await api.post<AuthToken>('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const register = async (data: {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}): Promise<AuthToken> => {
  const response = await api.post<AuthToken>('/auth/register', data);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

// Trips
export const createTrip = async (data: TripCreate): Promise<Trip> => {
  const response = await api.post<Trip>('/trips/', data);
  return response.data;
};

export const getTrips = async (): Promise<TripList[]> => {
  const response = await api.get<TripList[]>('/trips/');
  return response.data;
};

export const getTrip = async (id: number): Promise<Trip> => {
  const response = await api.get<Trip>(`/trips/${id}`);
  return response.data;
};

export const deleteTrip = async (id: number): Promise<void> => {
  await api.delete(`/trips/${id}`);
};

export const duplicateTrip = async (id: number): Promise<Trip> => {
  const response = await api.post<Trip>(`/trips/${id}/duplicate`);
  return response.data;
};

// Itinerary
export const generateItinerary = async (tripId: number, regenerate = false): Promise<FullItinerary> => {
  const response = await api.post<FullItinerary>('/itinerary/generate', {
    trip_id: tripId,
    regenerate,
  });
  return response.data;
};

export const regenerateDay = async (tripId: number, dayNumber: number): Promise<DayItinerary> => {
  const response = await api.post<DayItinerary>('/itinerary/regenerate-day', null, {
    params: { trip_id: tripId, day_number: dayNumber },
  });
  return response.data;
};

export const exportPDF = async (tripId: number): Promise<string> => {
  const response = await api.get<{ markdown: string }>(`/itinerary/${tripId}/export-pdf`);
  return response.data.markdown;
};

// Chat
export const sendChat = async (message: string, tripId?: number): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/chat/', {
    message,
    trip_id: tripId,
  });
  return response.data;
};

export const getChatHistory = async (tripId: number): Promise<{ history: any[] }> => {
  const response = await api.get(`/chat/history/${tripId}`);
  return response.data;
};

export default api;
