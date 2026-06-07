"""
RAG Knowledge Base
──────────────────
• ChromaDB (persistent) as the vector store
• OpenAI text-embedding-3-small for embeddings
• Wikipedia REST API to auto-fetch destination content
• Pre-seeded with top 100 world tourist destinations
"""

import os
import requests
import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

# ── Top 100 tourist destinations ─────────────────────────────────────────────
TOP_DESTINATIONS = [
    "Paris", "Tokyo", "New York City", "London", "Rome", "Barcelona",
    "Amsterdam", "Dubai", "Sydney", "Singapore", "Bangkok", "Istanbul",
    "Prague", "Vienna", "Venice", "Florence", "Kyoto", "Bali",
    "Maldives", "Santorini", "Lisbon", "Copenhagen", "Stockholm",
    "Berlin", "Munich", "Athens", "Cairo", "Marrakech", "Cape Town",
    "Mumbai", "Delhi", "Jaipur", "Agra", "Beijing", "Shanghai",
    "Hong Kong", "Seoul", "Osaka", "Taipei", "Kuala Lumpur",
    "Ho Chi Minh City", "Hanoi", "Siem Reap", "Chiang Mai", "Phuket",
    "Kathmandu", "Queenstown", "Auckland", "Melbourne", "Brisbane",
    "Rio de Janeiro", "Buenos Aires", "Lima", "Cusco", "Mexico City",
    "Cancun", "Havana", "Toronto", "Vancouver", "San Francisco",
    "Los Angeles", "Las Vegas", "Chicago", "Miami", "New Orleans",
    "Washington DC", "Reykjavik", "Edinburgh", "Dublin", "Brussels",
    "Porto", "Seville", "Milan", "Naples", "Dubrovnik", "Budapest",
    "Krakow", "Tallinn", "Helsinki", "Oslo", "Petra", "Jerusalem",
    "Tel Aviv", "Muscat", "Doha", "Abu Dhabi", "Nairobi", "Zanzibar",
    "Jakarta", "Manila", "Colombo", "Tbilisi", "Yerevan", "Baku",
    "Almaty", "Tashkent", "Samarkand", "Katowice", "Wroclaw", "Gdansk",
]

_collection = None  # cached globally


def get_collection(openai_api_key: str):
    """Return (and cache) the ChromaDB collection with OpenAI embeddings."""
    global _collection
    if _collection is None:
        ef = OpenAIEmbeddingFunction(
            api_key=openai_api_key,
            model_name="text-embedding-3-small",
        )
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        _collection = client.get_or_create_collection(
            name="travel_guides",
            embedding_function=ef,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


# ── Wikipedia helpers ─────────────────────────────────────────────────────────

_HEADERS = {"User-Agent": "CompassAI/1.0 (travel planner)"}


def _wiki_summary(title: str) -> str:
    """Fetch Wikipedia page summary via REST API."""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title.replace(' ', '_')}"
    try:
        r = requests.get(url, headers=_HEADERS, timeout=8)
        if r.status_code == 200:
            return r.json().get("extract", "")
    except Exception:
        pass
    return ""


def _wiki_search_summary(query: str) -> str:
    """Search Wikipedia and return summary of top result."""
    try:
        params = {
            "action": "query", "list": "search",
            "srsearch": query, "format": "json", "srlimit": 1,
        }
        r = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params=params, headers=_HEADERS, timeout=8,
        )
        results = r.json().get("query", {}).get("search", [])
        if results:
            return _wiki_summary(results[0]["title"])
    except Exception:
        pass
    return ""


def fetch_destination_content(destination: str) -> str:
    """Return a rich Wikipedia excerpt about the destination."""
    content = _wiki_summary(destination)
    if len(content) < 100:
        content = _wiki_search_summary(f"{destination} tourism travel attractions")
    if not content:
        return ""

    # Also fetch a 'tourism in X' article if it exists
    extra = _wiki_summary(f"Tourism in {destination}")
    if len(extra) > 100:
        content += f"\n\nTourism in {destination}:\n{extra}"

    return content[:4000]  # cap at 4 000 chars per destination


# ── Collection helpers ────────────────────────────────────────────────────────

def _dest_id(destination: str) -> str:
    return "dest_" + destination.lower().replace(" ", "_").replace(",", "").replace("'", "")


def is_loaded(collection, destination: str) -> bool:
    try:
        return bool(collection.get(ids=[_dest_id(destination)])["ids"])
    except Exception:
        return False


def add_destination(collection, destination: str) -> bool:
    """Fetch from Wikipedia and store in ChromaDB. Returns True on success."""
    if is_loaded(collection, destination):
        return True
    content = fetch_destination_content(destination)
    if not content:
        return False
    try:
        collection.add(
            documents=[content],
            ids=[_dest_id(destination)],
            metadatas=[{"destination": destination, "source": "wikipedia"}],
        )
        print(f"[RAG] Loaded: {destination}")
        return True
    except Exception as e:
        print(f"[RAG] Failed to store {destination}: {e}")
        return False


def query_context(collection, destination: str, query_text: str, n: int = 3) -> str:
    """Retrieve the most relevant travel context for a destination query."""
    total = collection.count()
    if total == 0:
        return ""

    n = min(n, total)

    # Try destination-filtered query first
    try:
        results = collection.query(
            query_texts=[query_text],
            n_results=n,
            where={"destination": destination},
        )
        docs = results.get("documents", [[]])[0]
        if docs:
            return "\n\n---\n\n".join(docs)
    except Exception:
        pass

    # Fallback: unfiltered semantic search
    try:
        results = collection.query(query_texts=[query_text], n_results=n)
        docs = results.get("documents", [[]])[0]
        if docs:
            return "\n\n---\n\n".join(docs)
    except Exception:
        pass

    return ""


# ── Bulk seed (optional, called at startup) ───────────────────────────────────

def seed_top_destinations(collection, limit: int = 20) -> None:
    """Pre-load the first `limit` top destinations that aren't yet in the DB."""
    loaded = 0
    for dest in TOP_DESTINATIONS:
        if loaded >= limit:
            break
        if not is_loaded(collection, dest):
            if add_destination(collection, dest):
                loaded += 1
    if loaded:
        print(f"[RAG] Seeded {loaded} destinations.")
