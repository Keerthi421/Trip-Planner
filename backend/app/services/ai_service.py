import json
import logging
import re
from typing import Optional
from ..config import settings

logger = logging.getLogger(__name__)


def get_llm():
    """Get ChatGoogleGenerativeAI instance."""
    if not settings.GOOGLE_GEMINI_API_KEY:
        return None
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-pro",
            google_api_key=settings.GOOGLE_GEMINI_API_KEY,
            temperature=0.7,
        )
    except Exception as e:
        logger.error(f"Error initializing Gemini LLM: {e}")
        return None


def _build_itinerary_prompt(trip_data: dict, rag_context: str, weather: dict, attractions: list) -> str:
    weather_text = ""
    if weather and "forecast" in weather:
        weather_text = "Weather Forecast:\n"
        for day in weather["forecast"][:7]:
            weather_text += f"  - {day['date']}: {day['description']}, {day['temp_min']}°C - {day['temp_max']}°C\n"

    attraction_text = ""
    if attractions:
        attraction_text = "Available Attractions:\n"
        for a in attractions[:15]:
            attraction_text += f"  - {a['name']} ({a['type']}): {a.get('description', '')}\n"

    prefs = ", ".join(trip_data.get("preferences", [])) or "general sightseeing"
    reqs = ", ".join(trip_data.get("special_requirements", [])) or "none"

    prompt = f"""You are an expert travel planner AI. Create a detailed {trip_data['num_days']}-day itinerary for:

Destination: {trip_data['destination']}, {trip_data.get('country', '')}
Travel Dates: {trip_data.get('start_date', 'flexible')} to {trip_data.get('end_date', 'flexible')}
Budget Level: {trip_data.get('budget', 'medium')} (low=budget traveler, medium=comfortable, luxury=high-end)
Number of Travelers: {trip_data.get('num_travelers', 1)}
Preferences: {prefs}
Special Requirements: {reqs}

{weather_text}

{attraction_text}

Local Knowledge:
{rag_context[:3000] if rag_context else 'No additional context available.'}

Create a realistic, detailed itinerary. Return ONLY valid JSON with this exact structure:
{{
  "days": [
    {{
      "day_number": 1,
      "morning": {{
        "activity": "Activity name",
        "description": "Detailed description of the activity",
        "duration": "2-3 hours",
        "cost": 15.0,
        "lat": 48.8566,
        "lng": 2.3522,
        "place_name": "Specific place name"
      }},
      "lunch": {{
        "restaurant": "Restaurant name",
        "description": "Description of the meal and restaurant",
        "cost": 20.0,
        "lat": 48.8570,
        "lng": 2.3530
      }},
      "afternoon": {{
        "activity": "Activity name",
        "description": "Detailed description",
        "duration": "2-3 hours",
        "cost": 10.0,
        "lat": 48.8580,
        "lng": 2.3540,
        "place_name": "Specific place name"
      }},
      "evening": {{
        "activity": "Evening activity",
        "description": "Description of the evening activity",
        "duration": "1-2 hours",
        "cost": 0.0,
        "lat": 48.8560,
        "lng": 2.3510
      }},
      "dinner": {{
        "restaurant": "Restaurant name",
        "description": "Description of dinner experience",
        "cost": 35.0,
        "lat": 48.8555,
        "lng": 2.3505
      }},
      "transport_cost": 10.0,
      "total_cost": 90.0,
      "attractions": [
        {{"name": "Place name", "lat": 48.8566, "lng": 2.3522, "type": "museum", "description": "Brief description"}}
      ]
    }}
  ],
  "total_budget": 450.0,
  "weather_summary": "Brief weather summary for the trip",
  "tips": [
    "Practical travel tip 1",
    "Local custom or etiquette tip",
    "Money-saving tip",
    "Safety tip",
    "Best time to visit attractions"
  ]
}}

Generate exactly {trip_data['num_days']} days. Be specific with real place names, realistic costs in USD, and actual coordinates for {trip_data['destination']}. Make it feel like advice from a local expert."""
    return prompt


def generate_itinerary(trip_data: dict, rag_context: str, weather: dict, attractions: list) -> dict:
    """Generate a full trip itinerary using Gemini or mock data."""
    llm = get_llm()
    if llm is None:
        logger.warning("No LLM available, returning mock itinerary")
        return _mock_itinerary(trip_data, weather, attractions)

    prompt = _build_itinerary_prompt(trip_data, rag_context, weather, attractions)
    try:
        from langchain_core.messages import HumanMessage
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            itinerary = json.loads(json_match.group())
            itinerary["trip_id"] = trip_data.get("id")
            itinerary["destination"] = trip_data["destination"]
            return itinerary
        else:
            logger.error("Could not extract JSON from Gemini response")
            return _mock_itinerary(trip_data, weather, attractions)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        return _mock_itinerary(trip_data, weather, attractions)
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return _mock_itinerary(trip_data, weather, attractions)


def _mock_itinerary(trip_data: dict, weather: dict, attractions: list) -> dict:
    """Generate a realistic mock itinerary when AI is unavailable."""
    destination = trip_data.get("destination", "Paris")
    num_days = trip_data.get("num_days", 5)
    budget = trip_data.get("budget", "medium")

    cost_mult = {"low": 0.6, "medium": 1.0, "luxury": 2.5}.get(budget, 1.0)

    # Use provided attractions or generate mock ones
    places = attractions[:10] if attractions else []
    if len(places) < 10:
        places += [
            {"name": f"{destination} Landmark {i}", "lat": 48.8566, "lng": 2.3522, "type": "attraction", "description": "A famous landmark"}
            for i in range(10 - len(places))
        ]

    days = []
    activity_templates = [
        ("Morning City Walk", "Explore the charming streets and soak in local atmosphere"),
        ("Museum Visit", "Discover the rich history and culture of the region"),
        ("Market Exploration", "Browse local markets for fresh produce and souvenirs"),
        ("Historic District Tour", "Walk through centuries of history in the old town"),
        ("Nature & Parks", "Relax in beautiful gardens and green spaces"),
    ]

    for day_num in range(1, num_days + 1):
        template = activity_templates[(day_num - 1) % len(activity_templates)]
        morning_place = places[day_num % len(places)] if places else {}
        afternoon_place = places[(day_num + 2) % len(places)] if places else {}

        day = {
            "day_number": day_num,
            "morning": {
                "activity": morning_place.get("name", template[0]),
                "description": morning_place.get("description", template[1]),
                "duration": "2-3 hours",
                "cost": round(15 * cost_mult, 2),
                "lat": morning_place.get("lat", 48.8566),
                "lng": morning_place.get("lng", 2.3522),
                "place_name": morning_place.get("name", template[0]),
            },
            "lunch": {
                "restaurant": f"Local Restaurant {day_num}",
                "description": f"Enjoy authentic {destination} cuisine at a highly-rated local spot",
                "cost": round(22 * cost_mult, 2),
                "lat": morning_place.get("lat", 48.8566),
                "lng": morning_place.get("lng", 2.3522),
            },
            "afternoon": {
                "activity": afternoon_place.get("name", f"Afternoon in {destination}"),
                "description": afternoon_place.get("description", "Explore more of the city at your own pace"),
                "duration": "2-3 hours",
                "cost": round(12 * cost_mult, 2),
                "lat": afternoon_place.get("lat", 48.8570),
                "lng": afternoon_place.get("lng", 2.3530),
                "place_name": afternoon_place.get("name", f"Afternoon in {destination}"),
            },
            "evening": {
                "activity": "Sunset Viewpoint",
                "description": f"Catch the beautiful sunset over {destination} from a scenic viewpoint",
                "duration": "1 hour",
                "cost": 0.0,
                "lat": morning_place.get("lat", 48.8560),
                "lng": morning_place.get("lng", 2.3510),
            },
            "dinner": {
                "restaurant": f"Dinner Spot {day_num}",
                "description": f"End the day with a delightful dinner featuring local specialties of {destination}",
                "cost": round(38 * cost_mult, 2),
                "lat": morning_place.get("lat", 48.8555),
                "lng": morning_place.get("lng", 2.3505),
            },
            "transport_cost": round(10 * cost_mult, 2),
            "total_cost": round(97 * cost_mult, 2),
            "attractions": [morning_place, afternoon_place] if morning_place and afternoon_place else [],
        }
        days.append(day)

    weather_forecast = weather.get("forecast", [])
    weather_summary = "Pleasant weather expected during your trip."
    if weather_forecast:
        avg_max = sum(d.get("temp_max", 25) for d in weather_forecast[:num_days]) / min(len(weather_forecast), num_days)
        weather_summary = f"Average highs of {avg_max:.0f}°C expected. {weather_forecast[0].get('description', 'Mixed conditions')} on arrival day."

    return {
        "trip_id": trip_data.get("id"),
        "destination": destination,
        "days": days,
        "total_budget": round(97 * cost_mult * num_days, 2),
        "weather_summary": weather_summary,
        "tips": [
            f"Book accommodations in advance, especially in popular areas of {destination}",
            "Use public transport for cost savings and to experience local life",
            "Visit major attractions early morning to avoid crowds",
            "Try street food and local markets for authentic and affordable meals",
            "Always carry a small amount of local currency for small vendors",
            "Learn a few basic phrases in the local language — locals appreciate the effort",
            "Download offline maps before you go to avoid data charges",
        ],
    }


def answer_travel_question(question: str, context: str, destination: str) -> str:
    """Answer a travel question using Gemini with RAG context."""
    llm = get_llm()
    if llm is None:
        return _mock_travel_answer(question, destination)

    prompt = f"""You are a knowledgeable travel assistant specializing in {destination}.

Based on the following information about {destination}:
{context[:3000]}

Answer this question helpfully and concisely:
{question}

Provide practical, actionable advice. If the context doesn't fully answer the question, use your general travel knowledge."""

    try:
        from langchain_core.messages import HumanMessage
        response = llm.invoke([HumanMessage(content=prompt)])
        return response.content
    except Exception as e:
        logger.error(f"Gemini chat error: {e}")
        return _mock_travel_answer(question, destination)


def _mock_travel_answer(question: str, destination: str) -> str:
    return (
        f"Great question about {destination}! Based on general travel knowledge, "
        f"I'd recommend researching local tourism boards and recent traveler reviews for the most up-to-date information. "
        f"Popular resources include TripAdvisor, Lonely Planet, and local tourism websites. "
        f"For specific questions about {destination}, consider joining local travel Facebook groups or Reddit communities "
        f"where recent visitors share first-hand experiences."
    )
