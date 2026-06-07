import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.trip import Trip
from ..models.user import User
from ..schemas.trip import ItineraryRequest, FullItinerary, DayItinerary
from ..api.deps import get_current_user
from ..services.data_pipeline import collect_all_data
from ..services.ai_service import generate_itinerary
from ..rag.vector_store import add_destination_data, collection_exists
from ..rag.retriever import retrieve_context
from ..config import settings
from datetime import datetime

router = APIRouter(prefix="/api/itinerary", tags=["itinerary"])
logger = logging.getLogger(__name__)

# In-memory store for long operations
_generation_status = {}


@router.post("/generate")
async def generate_itinerary_endpoint(
    request: ItineraryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Main endpoint to generate a full trip itinerary."""
    trip = db.query(Trip).filter(Trip.id == request.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.status == "generated" and not request.regenerate:
        # Return cached itinerary
        if trip.itinerary_data:
            return trip.itinerary_data

    try:
        # Step 1: Collect all external data
        api_keys = {
            "openweather": settings.OPENWEATHER_API_KEY,
            "google_places": settings.GOOGLE_PLACES_API_KEY,
        }
        all_data = await collect_all_data(trip.destination, trip.country or "", api_keys)

        # Step 2: Store data in RAG vector store
        try:
            if not collection_exists(trip.destination) or request.regenerate:
                add_destination_data(trip.destination, all_data)
        except Exception as e:
            logger.warning(f"RAG indexing failed (non-fatal): {e}")

        # Step 3: Retrieve RAG context
        try:
            rag_context = retrieve_context(
                f"travel guide {trip.destination} attractions restaurants tips",
                trip.destination,
                n_results=8,
            )
        except Exception as e:
            logger.warning(f"RAG retrieval failed (non-fatal): {e}")
            rag_context = all_data.get("wikipedia", "") + "\n" + all_data.get("wikivoyage", "")

        # Step 4: Generate itinerary with AI
        trip_data = {
            "id": trip.id,
            "destination": trip.destination,
            "country": trip.country,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "num_days": trip.num_days,
            "budget": trip.budget,
            "num_travelers": trip.num_travelers,
            "preferences": trip.preferences or [],
            "special_requirements": trip.special_requirements or [],
        }

        itinerary = generate_itinerary(
            trip_data=trip_data,
            rag_context=rag_context,
            weather=all_data.get("weather", {}),
            attractions=all_data.get("attractions", []),
        )

        # Step 5: Save result to trip
        trip.itinerary_data = itinerary
        trip.weather_data = all_data.get("weather", {})
        trip.status = "generated"
        trip.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(trip)

        return itinerary

    except Exception as e:
        logger.error(f"Itinerary generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")


@router.post("/regenerate-day")
async def regenerate_day(
    trip_id: int,
    day_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate a single day of the itinerary."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not trip.itinerary_data:
        raise HTTPException(status_code=400, detail="No itinerary generated yet")

    try:
        # Get existing itinerary
        itinerary = trip.itinerary_data
        days = itinerary.get("days", [])

        # Find and regenerate the specific day
        api_keys = {"openweather": settings.OPENWEATHER_API_KEY}
        all_data = await collect_all_data(trip.destination, trip.country or "", api_keys)

        trip_data = {
            "id": trip.id,
            "destination": trip.destination,
            "country": trip.country,
            "num_days": 1,
            "budget": trip.budget,
            "num_travelers": trip.num_travelers,
            "preferences": trip.preferences or [],
            "special_requirements": trip.special_requirements or [],
        }

        rag_context = retrieve_context(
            f"day {day_number} activities {trip.destination}",
            trip.destination,
        )

        new_itinerary = generate_itinerary(
            trip_data=trip_data,
            rag_context=rag_context,
            weather=all_data.get("weather", {}),
            attractions=all_data.get("attractions", []),
        )

        new_days = new_itinerary.get("days", [{}])
        if new_days:
            new_day = new_days[0]
            new_day["day_number"] = day_number
            # Replace the day
            updated_days = [new_day if d.get("day_number") == day_number else d for d in days]
            itinerary["days"] = updated_days
            trip.itinerary_data = itinerary
            trip.updated_at = datetime.utcnow()
            db.commit()
            return new_day

    except Exception as e:
        logger.error(f"Day regeneration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{trip_id}/export-pdf")
def export_itinerary(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export itinerary as markdown for PDF generation."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not trip.itinerary_data:
        raise HTTPException(status_code=400, detail="No itinerary to export")

    itinerary = trip.itinerary_data
    md = f"# {trip.title}\n\n"
    md += f"**Destination:** {trip.destination}"
    if trip.country:
        md += f", {trip.country}"
    md += f"\n**Dates:** {trip.start_date} to {trip.end_date}\n"
    md += f"**Duration:** {trip.num_days} days\n"
    md += f"**Budget Level:** {trip.budget.title()}\n"
    md += f"**Travelers:** {trip.num_travelers}\n\n"

    if itinerary.get("weather_summary"):
        md += f"## Weather\n{itinerary['weather_summary']}\n\n"

    md += "## Itinerary\n\n"
    for day in itinerary.get("days", []):
        md += f"### Day {day['day_number']}\n\n"
        if day.get("morning"):
            m = day["morning"]
            md += f"**Morning:** {m.get('activity', '')}\n"
            md += f"{m.get('description', '')}\n"
            if m.get("duration"):
                md += f"Duration: {m['duration']} | "
            if m.get("cost"):
                md += f"Cost: ${m['cost']}\n"
            md += "\n"
        if day.get("lunch"):
            l = day["lunch"]
            md += f"**Lunch:** {l.get('restaurant', '')}\n"
            md += f"{l.get('description', '')}"
            if l.get("cost"):
                md += f" | Cost: ${l['cost']}"
            md += "\n\n"
        if day.get("afternoon"):
            a = day["afternoon"]
            md += f"**Afternoon:** {a.get('activity', '')}\n"
            md += f"{a.get('description', '')}\n\n"
        if day.get("evening"):
            e = day["evening"]
            md += f"**Evening:** {e.get('activity', '')}\n"
            md += f"{e.get('description', '')}\n\n"
        if day.get("dinner"):
            d = day["dinner"]
            md += f"**Dinner:** {d.get('restaurant', '')}\n"
            md += f"{d.get('description', '')}"
            if d.get("cost"):
                md += f" | Cost: ${d['cost']}"
            md += "\n\n"
        if day.get("total_cost"):
            md += f"**Daily Total:** ${day['total_cost']}\n\n"
        md += "---\n\n"

    if itinerary.get("total_budget"):
        md += f"## Total Estimated Budget: ${itinerary['total_budget']}\n\n"

    if itinerary.get("tips"):
        md += "## Travel Tips\n"
        for tip in itinerary["tips"]:
            md += f"- {tip}\n"

    return {"markdown": md, "destination": trip.destination, "title": trip.title}
