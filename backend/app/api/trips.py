from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.trip import Trip
from ..models.user import User
from ..schemas.trip import TripCreate, TripOut, TripList
from ..api.deps import get_current_user

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.post("/", response_model=TripOut)
def create_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title = f"{trip_data.destination} Trip"
    if trip_data.start_date:
        title += f" - {trip_data.start_date}"

    db_trip = Trip(
        user_id=current_user.id,
        title=title,
        destination=trip_data.destination,
        country=trip_data.country,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        num_days=trip_data.num_days,
        budget=trip_data.budget,
        num_travelers=trip_data.num_travelers,
        preferences=trip_data.preferences,
        special_requirements=trip_data.special_requirements,
        status="planning",
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[TripList])
def list_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).all()
    return trips


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.put("/{trip_id}", response_model=TripOut)
def update_trip(
    trip_id: int,
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for field, value in trip_data.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    trip.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}")
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}


@router.post("/{trip_id}/duplicate", response_model=TripOut)
def duplicate_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    original = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Trip not found")
    new_trip = Trip(
        user_id=current_user.id,
        title=f"Copy of {original.title}",
        destination=original.destination,
        country=original.country,
        start_date=original.start_date,
        end_date=original.end_date,
        num_days=original.num_days,
        budget=original.budget,
        num_travelers=original.num_travelers,
        preferences=original.preferences,
        special_requirements=original.special_requirements,
        status="planning",
        itinerary_data=original.itinerary_data,
        weather_data=original.weather_data,
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip
