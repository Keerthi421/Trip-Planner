from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class BudgetLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    luxury = "luxury"


class TripStatus(str, enum.Enum):
    planning = "planning"
    generated = "generated"
    saved = "saved"


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="My Trip")
    destination = Column(String, nullable=False)
    country = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    num_days = Column(Integer, default=5)
    budget = Column(String, default="medium")
    num_travelers = Column(Integer, default=1)
    preferences = Column(JSON, default=list)
    special_requirements = Column(JSON, default=list)
    status = Column(String, default="planning")
    itinerary_data = Column(JSON, nullable=True)
    weather_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="trips")
    trip_days = relationship("TripDay", back_populates="trip", cascade="all, delete-orphan")


class TripDay(Base):
    __tablename__ = "trip_days"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    day_number = Column(Integer, nullable=False)

    morning_activity = Column(String, nullable=True)
    morning_description = Column(String, nullable=True)
    morning_duration = Column(String, nullable=True)
    morning_cost = Column(Float, nullable=True)

    lunch_restaurant = Column(String, nullable=True)
    lunch_description = Column(String, nullable=True)
    lunch_cost = Column(Float, nullable=True)

    afternoon_activity = Column(String, nullable=True)
    afternoon_description = Column(String, nullable=True)
    afternoon_duration = Column(String, nullable=True)
    afternoon_cost = Column(Float, nullable=True)

    evening_activity = Column(String, nullable=True)
    evening_description = Column(String, nullable=True)

    dinner_restaurant = Column(String, nullable=True)
    dinner_description = Column(String, nullable=True)
    dinner_cost = Column(Float, nullable=True)

    transport_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)

    attractions = Column(JSON, default=list)

    trip = relationship("Trip", back_populates="trip_days")
