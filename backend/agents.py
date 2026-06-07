"""
Six specialized AI agents powered by Agno + OpenAI GPT-4o.
Uses JSON-mode prompting + RAG knowledge base for rich destination context.
"""

import os
import json
import re
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from rag.retriever import get_destination_context


def _parse_json(text: str) -> dict | list | None:
    """Extract JSON from agent response text."""
    if not text:
        return None
    # Direct parse
    try:
        return json.loads(text)
    except Exception:
        pass
    # JSON code block
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    # First {...} block
    match = re.search(r"\{[\s\S]+\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return None


def _run(agent: Agent, prompt: str) -> dict | list:
    resp = agent.run(prompt)
    content = resp.content if hasattr(resp, "content") else str(resp)
    if isinstance(content, str):
        result = _parse_json(content)
        return result if result is not None else {}
    return content if content else {}


def get_travel_plan(request_data: dict, openai_api_key: str) -> dict:
    os.environ["OPENAI_API_KEY"] = openai_api_key

    model      = OpenAIChat(id="gpt-4o")
    tools      = [DuckDuckGoTools()]

    destination      = request_data["destination"]
    origin           = request_data["origin"]
    departure_date   = request_data["departure_date"]
    return_date      = request_data["return_date"]
    duration_days    = request_data["duration_days"]
    adults           = request_data["adults"]
    children         = request_data.get("children", 0)
    budget           = request_data["budget_per_person"]
    currency         = request_data["currency"]
    accommodation    = request_data["accommodation_type"]
    rooms            = request_data.get("rooms", 1)
    vibes            = ", ".join(request_data.get("trip_vibes", [])) or "general"
    pace             = request_data["pace"]
    dietary          = request_data.get("dietary_preferences") or "none"
    special          = request_data.get("special_requirements") or "none"
    travelers        = f"{adults} adult(s)" + (f" and {children} child(ren)" if children else "")

    JSON_ONLY = "Respond ONLY with valid JSON. No explanations, no markdown, no extra text."

    # ── RAG: fetch destination knowledge base context ─────────────────────────
    print(f"[RAG] Fetching context for: {destination}")
    rag_context = get_destination_context(destination, openai_api_key)
    rag_instruction = (
        f"Use this verified knowledge base context about {destination} to enrich your response:\n\n"
        f"{rag_context[:2500]}"
    ) if rag_context else ""

    # ── Agent 1: Destination Explorer ────────────────────────────────────────
    dest_agent = Agent(
        name="Destination Explorer",
        model=model,
        tools=tools,
        instructions=[
            JSON_ONLY,
            'Return this exact shape: {"overview":"...","top_attractions":["..."],"local_tips":["..."],"best_time":"...","visa_info":"...","safety_info":"..."}',
            rag_instruction,
        ],
    )
    dest = _run(dest_agent,
        f"Research {destination} for a trip from {origin}. "
        f"Dates: {departure_date} to {return_date}. Vibes: {vibes}. Travelers: {travelers}."
    )

    # ── Agent 2: Hotel Search ─────────────────────────────────────────────────
    hotel_agent = Agent(
        name="Hotel Search Agent",
        model=model,
        tools=tools,
        instructions=[
            JSON_ONLY,
            'Return: {"hotels":[{"name":"...","address":"...","price_total":"...","amenities":["..."],"website_url":"..."}]}',
            "Return 1-2 hotels only.",
        ],
    )
    hotels_data = _run(hotel_agent,
        f"Find hotels in {destination} for {travelers}, {duration_days} nights "
        f"({departure_date}–{return_date}). Budget: {budget} {currency}/person. "
        f"Type: {accommodation}. Rooms: {rooms}."
    )

    # ── Agent 3: Flight Search ────────────────────────────────────────────────
    flight_agent = Agent(
        name="Flight Search Agent",
        model=model,
        tools=tools,
        instructions=[
            JSON_ONLY,
            'Return: {"flights":[{"airline":"...","duration":"...","price_per_person":"...","stops":0,"departure_time":"...","arrival_time":"...","booking_url":"..."}]}',
            "Return 1-2 flights only.",
        ],
    )
    flights_data = _run(flight_agent,
        f"Find flights from {origin} to {destination}. "
        f"Out: {departure_date}, Return: {return_date}. Travelers: {travelers}. "
        f"Budget: {budget} {currency}/person."
    )

    # ── Agent 4: Dining ───────────────────────────────────────────────────────
    dining_agent = Agent(
        name="Dining Agent",
        model=model,
        tools=tools,
        instructions=[
            JSON_ONLY,
            'Return: {"restaurants":["..."],"must_try_dishes":["..."],"dining_tips":"..."}',
        ],
    )
    dining = _run(dining_agent,
        f"Dining recommendations in {destination}. Vibes: {vibes}. Dietary: {dietary}."
    )

    # ── Agent 5: Budget ───────────────────────────────────────────────────────
    budget_agent = Agent(
        name="Budget Agent",
        model=model,
        tools=tools,
        instructions=[
            JSON_ONLY,
            'Return: {"flights_estimate":"...","accommodation_estimate":"...","food_per_day":"...","activities_per_day":"...","total_per_person":"...","money_saving_tips":["..."]}',
        ],
    )
    budget_info = _run(budget_agent,
        f"Budget breakdown: {origin}→{destination}, {duration_days} days. "
        f"Travelers: {travelers}. Budget: {budget} {currency}/person. Accommodation: {accommodation}."
    )

    # ── Agent 6: Itinerary ────────────────────────────────────────────────────
    attractions = ", ".join((dest.get("top_attractions") or [])[:5]) or "local attractions"
    restaurants = ", ".join((dining.get("restaurants") or [])[:3]) or "local restaurants"
    dishes      = ", ".join((dining.get("must_try_dishes") or [])[:3]) or "local cuisine"

    itinerary_agent = Agent(
        name="Itinerary Specialist",
        model=model,
        tools=tools,
        instructions=[
            JSON_ONLY,
            f'Return: {{"days":[{{"day":1,"morning":"...","afternoon":"...","evening":"...","note":"..."}}]}} with exactly {duration_days} day objects.',
            "Each morning/afternoon/evening should be 1-2 specific sentences.",
            rag_instruction,
        ],
    )
    itinerary_data = _run(itinerary_agent,
        f"Create a {duration_days}-day itinerary for {destination}. "
        f"Dates: {departure_date} to {return_date}. "
        f"Attractions: {attractions}. Restaurants: {restaurants}. Dishes: {dishes}. "
        f"Vibes: {vibes}. Pace: {pace}. Dietary: {dietary}. Special: {special}."
    )

    # ── Assemble ──────────────────────────────────────────────────────────────
    budget_summary = (
        f"Flights: {budget_info.get('flights_estimate','N/A')} · "
        f"Hotel: {budget_info.get('accommodation_estimate','N/A')} · "
        f"Food/day: {budget_info.get('food_per_day','N/A')} · "
        f"Activities/day: {budget_info.get('activities_per_day','N/A')} · "
        f"Total/person: {budget_info.get('total_per_person','N/A')}"
    )

    return {
        "destination_overview": dest.get("overview", ""),
        "hotels":    hotels_data.get("hotels", []),
        "flights":   flights_data.get("flights", []),
        "itinerary": itinerary_data.get("days", []),
        "budget_summary": budget_summary,
    }
