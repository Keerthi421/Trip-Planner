from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


class TripCreate(BaseModel):
    destination: str
    country: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    num_days: int = 5
    budget: str = "medium"
    num_travelers: int = 1
    preferences: List[str] = []
    special_requirements: List[str] = []


class TripOut(BaseModel):
    id: int
    title: str
    destination: str
    country: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    num_days: int
    budget: str
    num_travelers: int
    preferences: Optional[List[str]] = []
    special_requirements: Optional[List[str]] = []
    status: str
    itinerary_data: Optional[Dict[str, Any]] = None
    weather_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TripList(BaseModel):
    id: int
    title: str
    destination: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    num_days: int
    budget: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ItineraryRequest(BaseModel):
    trip_id: int
    regenerate: bool = False


class ChatMessage(BaseModel):
    message: str
    trip_id: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []


class DayActivity(BaseModel):
    activity: str
    description: str
    duration: Optional[str] = None
    cost: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    place_name: Optional[str] = None


class DayMeal(BaseModel):
    restaurant: str
    description: str
    cost: Optional[float] = None


class DayAttractions(BaseModel):
    name: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    type: Optional[str] = None
    description: Optional[str] = None


class DayItinerary(BaseModel):
    day_number: int
    morning: Optional[Dict[str, Any]] = None
    lunch: Optional[Dict[str, Any]] = None
    afternoon: Optional[Dict[str, Any]] = None
    evening: Optional[Dict[str, Any]] = None
    dinner: Optional[Dict[str, Any]] = None
    transport_cost: Optional[float] = None
    total_cost: Optional[float] = None
    attractions: Optional[List[Dict[str, Any]]] = []


class FullItinerary(BaseModel):
    trip_id: int
    destination: str
    days: List[DayItinerary]
    total_budget: Optional[float] = None
    weather_summary: Optional[str] = None
    tips: Optional[List[str]] = []
