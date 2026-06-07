import logging
from typing import Optional
from .vector_store import get_collection, _safe_collection_name

logger = logging.getLogger(__name__)


def retrieve_context(query: str, destination: str, n_results: int = 5) -> str:
    """Query ChromaDB for relevant documents and return concatenated context."""
    collection_name = _safe_collection_name(destination)
    collection = get_collection(collection_name)
    if collection is None:
        return ""
    try:
        count = collection.count()
        if count == 0:
            return ""
        results = collection.query(
            query_texts=[query],
            n_results=min(n_results, count),
        )
        documents = results.get("documents", [[]])[0]
        return "\n\n".join(documents)
    except Exception as e:
        logger.error(f"Error retrieving context: {e}")
        return ""


def retrieve_for_chat(question: str, destination: str) -> tuple[str, list[str]]:
    """Return (context, source_names) for a chat question."""
    collection_name = _safe_collection_name(destination)
    collection = get_collection(collection_name)
    if collection is None:
        return "", []
    try:
        count = collection.count()
        if count == 0:
            return "", []
        results = collection.query(
            query_texts=[question],
            n_results=min(5, count),
            include=["documents", "metadatas"],
        )
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        context = "\n\n".join(documents)
        sources = list(set(m.get("name", "Unknown") for m in metadatas if m))
        return context, sources
    except Exception as e:
        logger.error(f"Error retrieving chat context: {e}")
        return "", []
