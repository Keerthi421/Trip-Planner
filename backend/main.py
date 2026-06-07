import uuid
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import TripRequest
from database import init_db, save_trip, get_all_trips, get_trip, delete_trip
from agents import get_travel_plan

app = FastAPI(title="TripCraft AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/trips")
def create_trip(request: TripRequest):
    """Run 6 AI agents and save the resulting trip plan."""
    dep = datetime.strptime(request.departure_date, "%Y-%m-%d")
    ret = datetime.strptime(request.return_date, "%Y-%m-%d")
    duration_days = max(1, (ret - dep).days)

    req_dict = request.model_dump()
    api_key = req_dict.pop("openai_api_key")
    req_dict["duration_days"] = duration_days

    try:
        result = get_travel_plan(req_dict, api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    trip = {
        "id": str(uuid.uuid4()),
        "user_name": request.user_name,
        "destination": request.destination,
        "origin": request.origin,
        "departure_date": request.departure_date,
        "return_date": request.return_date,
        "duration_days": duration_days,
        "adults": request.adults,
        "children": request.children,
        "budget_per_person": f"{request.budget_per_person} {request.currency}",
        "currency": request.currency,
        "accommodation_type": request.accommodation_type,
        "trip_vibes": request.trip_vibes,
        "pace": request.pace,
        "hotels": result["hotels"],
        "flights": result["flights"],
        "itinerary": result["itinerary"],
        "destination_overview": result["destination_overview"],
        "budget_summary": result["budget_summary"],
        "created_at": datetime.utcnow().isoformat(),
    }

    save_trip(trip)
    return trip


@app.get("/api/trips")
def list_trips():
    return get_all_trips()


@app.get("/api/trips/{trip_id}")
def fetch_trip(trip_id: str):
    trip = get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@app.delete("/api/trips/{trip_id}")
def remove_trip(trip_id: str):
    delete_trip(trip_id)
    return {"message": "Deleted"}
