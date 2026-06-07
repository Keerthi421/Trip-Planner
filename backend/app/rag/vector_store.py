import logging
from typing import Optional
from ..config import settings

logger = logging.getLogger(__name__)

_client = None
_embedding_function = None


def _get_client():
    global _client
    if _client is None:
        try:
            import chromadb
            _client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        except Exception as e:
            logger.error(f"ChromaDB init error: {e}")
            _client = None
    return _client


def _get_embedding_function():
    global _embedding_function
    if _embedding_function is None:
        try:
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
            _embedding_function = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
        except Exception as e:
            logger.error(f"Embedding function init error: {e}")
            _embedding_function = None
    return _embedding_function


def get_collection(name: str):
    """Get or create a ChromaDB collection."""
    client = _get_client()
    if client is None:
        return None
    emb_fn = _get_embedding_function()
    try:
        if emb_fn:
            return client.get_or_create_collection(name=name, embedding_function=emb_fn)
        else:
            return client.get_or_create_collection(name=name)
    except Exception as e:
        logger.error(f"Error getting collection {name}: {e}")
        return None


def _safe_collection_name(destination: str) -> str:
    """Convert destination to valid collection name."""
    import re
    name = re.sub(r'[^a-zA-Z0-9_-]', '_', destination.lower())
    name = re.sub(r'_+', '_', name).strip('_')
    if len(name) < 3:
        name = name + "_dest"
    return name[:63]


def collection_exists(destination: str) -> bool:
    """Check if a collection already exists for this destination."""
    client = _get_client()
    if client is None:
        return False
    try:
        collection_name = _safe_collection_name(destination)
        existing = [c.name for c in client.list_collections()]
        return collection_name in existing
    except Exception as e:
        logger.error(f"Error checking collection: {e}")
        return False


def add_destination_data(destination: str, data: dict):
    """Add Wikipedia info, Wikivoyage tips, and attraction descriptions to ChromaDB."""
    collection_name = _safe_collection_name(destination)
    collection = get_collection(collection_name)
    if collection is None:
        logger.warning("ChromaDB not available, skipping vector store")
        return

    documents = []
    metadatas = []
    ids = []

    # Add Wikipedia info
    wiki_text = data.get("wikipedia", "")
    if wiki_text:
        chunks = _chunk_text(wiki_text, chunk_size=500)
        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            metadatas.append({"destination": destination, "type": "wikipedia", "name": "Wikipedia"})
            ids.append(f"wiki_{destination}_{i}")

    # Add Wikivoyage tips
    wikivoyage_text = data.get("wikivoyage", "")
    if wikivoyage_text:
        chunks = _chunk_text(wikivoyage_text, chunk_size=500)
        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            metadatas.append({"destination": destination, "type": "wikivoyage", "name": "Wikivoyage"})
            ids.append(f"wikivoyage_{destination}_{i}")

    # Add attraction descriptions
    for i, attraction in enumerate(data.get("attractions", [])):
        name = attraction.get("name", "Unknown")
        desc = attraction.get("description", "")
        attraction_type = attraction.get("type", "attraction")
        text = f"{name}: {desc}" if desc else name
        documents.append(text)
        metadatas.append({"destination": destination, "type": attraction_type, "name": name})
        ids.append(f"attraction_{destination}_{i}")

    if documents:
        try:
            # Remove existing docs to avoid duplicates
            try:
                existing_ids = collection.get()["ids"]
                if existing_ids:
                    collection.delete(ids=existing_ids)
            except Exception:
                pass
            collection.add(documents=documents, metadatas=metadatas, ids=ids)
            logger.info(f"Added {len(documents)} documents for {destination}")
        except Exception as e:
            logger.error(f"Error adding documents to ChromaDB: {e}")


def _chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    """Split text into chunks."""
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    for word in words:
        current_chunk.append(word)
        current_size += len(word) + 1
        if current_size >= chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_size = 0
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks
