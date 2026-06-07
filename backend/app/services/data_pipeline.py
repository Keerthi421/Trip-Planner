import asyncio
import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def fetch_city_coordinates(city: str) -> tuple[float, float]:
    """Use Nominatim (OpenStreetMap geocoding) - free, no key needed."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": city, "format": "json", "limit": 1},
                headers={"User-Agent": "AI-Travel-Planner/1.0"},
            )
            data = response.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        logger.error(f"Error fetching coordinates for {city}: {e}")
    # Default coordinates (Paris)
    return 48.8566, 2.3522


async def fetch_weather(city: str, api_key: Optional[str] = None) -> dict:
    """Fetch weather forecast from OpenWeather API."""
    if not api_key:
        return _mock_weather(city)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "q": city,
                    "appid": api_key,
                    "units": "metric",
                    "cnt": 40,
                },
            )
            if response.status_code != 200:
                return _mock_weather(city)
            raw = response.json()
            forecast = []
            seen_dates = set()
            for item in raw.get("list", []):
                date = item["dt_txt"].split(" ")[0]
                if date not in seen_dates:
                    seen_dates.add(date)
                    forecast.append({
                        "date": date,
                        "temp_min": round(item["main"]["temp_min"], 1),
                        "temp_max": round(item["main"]["temp_max"], 1),
                        "description": item["weather"][0]["description"].title(),
                        "icon": item["weather"][0]["icon"],
                    })
                    if len(forecast) >= 7:
                        break
            return {"forecast": forecast, "city": city}
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return _mock_weather(city)


def _mock_weather(city: str) -> dict:
    import random
    descriptions = ["Partly Cloudy", "Sunny", "Clear Sky", "Light Rain", "Scattered Clouds"]
    forecast = []
    from datetime import datetime, timedelta
    for i in range(7):
        date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        forecast.append({
            "date": date,
            "temp_min": random.randint(15, 22),
            "temp_max": random.randint(23, 32),
            "description": random.choice(descriptions),
            "icon": "01d",
        })
    return {"forecast": forecast, "city": city}


async def fetch_wikipedia_info(city: str) -> str:
    """Fetch Wikipedia summary for the city."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{city.replace(' ', '_')}",
                headers={"User-Agent": "AI-Travel-Planner/1.0"},
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("extract", "")
    except Exception as e:
        logger.error(f"Wikipedia fetch error: {e}")
    return f"{city} is a wonderful travel destination with rich culture, history, and attractions."


async def fetch_wikivoyage_tips(city: str) -> str:
    """Fetch Wikivoyage travel tips via Wikipedia API."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://en.wikivoyage.org/w/api.php",
                params={
                    "action": "query",
                    "prop": "extracts",
                    "exintro": True,
                    "titles": city,
                    "format": "json",
                    "exsentences": 10,
                },
                headers={"User-Agent": "AI-Travel-Planner/1.0"},
            )
            if response.status_code == 200:
                data = response.json()
                pages = data.get("query", {}).get("pages", {})
                for page in pages.values():
                    extract = page.get("extract", "")
                    if extract:
                        # Strip basic HTML
                        import re
                        clean = re.sub(r"<[^>]+>", " ", extract)
                        clean = re.sub(r"\s+", " ", clean).strip()
                        return clean[:2000]
    except Exception as e:
        logger.error(f"Wikivoyage fetch error: {e}")
    return f"Travel tips for {city}: Visit local markets, try authentic cuisine, and explore neighborhoods beyond tourist areas."


async def fetch_osm_attractions(city: str, lat: float, lng: float) -> list[dict]:
    """Call Overpass API for tourist attractions near coordinates."""
    try:
        overpass_url = "https://overpass-api.de/api/interpreter"
        radius = 10000  # 10km
        query = f"""
[out:json][timeout:25];
(
  node["tourism"="attraction"](around:{radius},{lat},{lng});
  node["tourism"="museum"](around:{radius},{lat},{lng});
  node["tourism"="viewpoint"](around:{radius},{lat},{lng});
  node["historic"="monument"](around:{radius},{lat},{lng});
  node["amenity"="restaurant"]["cuisine"](around:{radius},{lat},{lng});
);
out body 30;
"""
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(overpass_url, data={"data": query})
            if response.status_code != 200:
                return _mock_attractions(city, lat, lng)
            data = response.json()
            attractions = []
            for element in data.get("elements", [])[:20]:
                tags = element.get("tags", {})
                name = tags.get("name") or tags.get("name:en")
                if not name:
                    continue
                tourism_type = tags.get("tourism") or tags.get("historic") or tags.get("amenity", "attraction")
                attractions.append({
                    "name": name,
                    "lat": element.get("lat", lat),
                    "lng": element.get("lon", lng),
                    "type": tourism_type,
                    "description": tags.get("description", f"{tourism_type.title()} in {city}"),
                })
            return attractions if attractions else _mock_attractions(city, lat, lng)
    except Exception as e:
        logger.error(f"OSM fetch error: {e}")
        return _mock_attractions(city, lat, lng)


def _mock_attractions(city: str, lat: float, lng: float) -> list[dict]:
    import random
    types = ["museum", "viewpoint", "attraction", "monument", "restaurant"]
    names = [
        f"{city} National Museum", f"Old Town {city}", f"{city} Cathedral",
        f"Central Park {city}", f"{city} Market Square", f"Historic District",
        f"{city} Art Gallery", f"Riverside Walk", f"City Tower", f"Local Food Hall",
    ]
    attractions = []
    for i, name in enumerate(names[:8]):
        attractions.append({
            "name": name,
            "lat": lat + (random.random() - 0.5) * 0.05,
            "lng": lng + (random.random() - 0.5) * 0.05,
            "type": types[i % len(types)],
            "description": f"A must-visit {types[i % len(types)]} in {city}.",
        })
    return attractions


async def collect_all_data(city: str, country: str, api_keys: dict) -> dict:
    """Run all fetches in parallel and return combined data dict."""
    lat, lng = await fetch_city_coordinates(f"{city}, {country}" if country else city)

    wiki_task = fetch_wikipedia_info(city)
    wikivoyage_task = fetch_wikivoyage_tips(city)
    weather_task = fetch_weather(city, api_keys.get("openweather"))
    osm_task = fetch_osm_attractions(city, lat, lng)

    wiki_info, wikivoyage_tips, weather, attractions = await asyncio.gather(
        wiki_task, wikivoyage_task, weather_task, osm_task,
        return_exceptions=True,
    )

    if isinstance(wiki_info, Exception):
        wiki_info = f"{city} is a great travel destination."
    if isinstance(wikivoyage_tips, Exception):
        wikivoyage_tips = f"Explore the best of {city}."
    if isinstance(weather, Exception):
        weather = _mock_weather(city)
    if isinstance(attractions, Exception):
        attractions = _mock_attractions(city, lat, lng)

    return {
        "city": city,
        "country": country,
        "coordinates": {"lat": lat, "lng": lng},
        "wikipedia": wiki_info,
        "wikivoyage": wikivoyage_tips,
        "weather": weather,
        "attractions": attractions,
    }
