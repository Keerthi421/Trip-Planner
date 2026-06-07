import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models.trip import Trip
from ..models.user import User
from ..schemas.trip import ChatMessage, ChatResponse
from ..api.deps import get_current_user
from ..services.ai_service import answer_travel_question
from ..rag.retriever import retrieve_for_chat

router = APIRouter(prefix="/api/chat", tags=["chat"])
logger = logging.getLogger(__name__)

# In-memory chat history storage (keyed by user_id:trip_id)
_chat_history: dict[str, list[dict]] = {}


def _get_history_key(user_id: int, trip_id: Optional[int]) -> str:
    return f"{user_id}:{trip_id or 'general'}"


@router.post("/", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Chat endpoint with RAG context."""
    destination = "general travel"
    trip_context = ""

    # Get trip context if trip_id provided
    if message.trip_id:
        trip = db.query(Trip).filter(
            Trip.id == message.trip_id,
            Trip.user_id == current_user.id
        ).first()
        if trip:
            destination = trip.destination
            if trip.itinerary_data:
                # Provide brief itinerary context
                itinerary = trip.itinerary_data
                trip_context = (
                    f"Trip to {trip.destination} for {trip.num_days} days. "
                    f"Budget: {trip.budget}. Travelers: {trip.num_travelers}. "
                    f"Total budget estimate: ${itinerary.get('total_budget', 'N/A')}."
                )

    # Get RAG context
    context, sources = retrieve_for_chat(message.message, destination)

    full_context = trip_context
    if context:
        full_context += "\n\nKnowledge Base:\n" + context

    # Get AI response
    response_text = answer_travel_question(
        question=message.message,
        context=full_context,
        destination=destination,
    )

    # Store in history
    history_key = _get_history_key(current_user.id, message.trip_id)
    if history_key not in _chat_history:
        _chat_history[history_key] = []
    _chat_history[history_key].append({
        "role": "user",
        "content": message.message,
    })
    _chat_history[history_key].append({
        "role": "assistant",
        "content": response_text,
        "sources": sources,
    })
    # Keep last 50 messages
    if len(_chat_history[history_key]) > 50:
        _chat_history[history_key] = _chat_history[history_key][-50:]

    return ChatResponse(response=response_text, sources=sources)


@router.get("/history/{trip_id}")
def get_chat_history(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    """Get chat history for a trip."""
    history_key = _get_history_key(current_user.id, trip_id)
    return {"history": _chat_history.get(history_key, [])}


@router.delete("/history/{trip_id}")
def clear_chat_history(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    """Clear chat history for a trip."""
    history_key = _get_history_key(current_user.id, trip_id)
    _chat_history.pop(history_key, None)
    return {"message": "Chat history cleared"}
