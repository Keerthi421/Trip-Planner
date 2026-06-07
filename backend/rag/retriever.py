"""
RAG Retriever
─────────────
Public interface used by agents.py.
"""

from .knowledge_base import get_collection, add_destination, query_context


def get_destination_context(destination: str, openai_api_key: str) -> str:
    """
    Return rich travel knowledge-base context for `destination`.
    Fetches from Wikipedia and stores in ChromaDB on first use.
    """
    try:
        collection = get_collection(openai_api_key)
        add_destination(collection, destination)           # no-op if already loaded
        context = query_context(
            collection,
            destination,
            query_text=f"travel guide tourist attractions tips culture food {destination}",
            n=2,
        )
        return context
    except Exception as e:
        print(f"[RAG] Retrieval error for '{destination}': {e}")
        return ""
