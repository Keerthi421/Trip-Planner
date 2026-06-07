from pydantic import BaseModel
from typing import List, Optional


class TripRequest(BaseModel):
    # Step 1 – Trip Basics
    user_name: str
    destination: str
    origin: str
    departure_date: str        # YYYY-MM-DD
    return_date: str           # YYYY-MM-DD

    # Step 2 – Group Details
    adults: int = 1
    children: int = 0
    children_ages: Optional[str] = None

    # Step 3 – Budget & Style
    budget_per_person: float
    currency: str = "USD"

    # Step 4 – Trip Vibe
    trip_vibes: List[str] = []

    # Step 5 – Stay Preferences
    rooms: int = 1
    accommodation_type: str = "comfort"

    # Step 6 – Pace & Style
    pace: str = "balanced"

    # Step 7 – Personal Touch
    dietary_preferences: Optional[str] = None
    special_requirements: Optional[str] = None

    # API key – sent with every request, never stored
    openai_api_key: str


# ── Response shapes ──────────────────────────────────────────────────────────

class Hotel(BaseModel):
    name: str
    address: str
    price_total: str
    amenities: List[str] = []
    website_url: str = ""


class Flight(BaseModel):
    airline: str
    duration: str
    price_per_person: str
    stops: int = 0
    departure_time: str = "Not specified"
    arrival_time: str = "Not specified"
    booking_url: str = ""


class DayPlan(BaseModel):
    day: int
    morning: str
    afternoon: str
    evening: str
    note: str = ""


class TripPlan(BaseModel):
    id: str
    user_name: str
    destination: str
    origin: str
    departure_date: str
    return_date: str
    duration_days: int
    adults: int
    children: int
    budget_per_person: str
    currency: str
    accommodation_type: str
    trip_vibes: List[str]
    pace: str
    hotels: List[Hotel]
    flights: List[Flight]
    itinerary: List[DayPlan]
    destination_overview: str
    budget_summary: str
    created_at: str
