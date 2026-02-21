"""
Embedding generation using sentence-transformers.
Model: all-MiniLM-L6-v2 (384-dimensional, fast, accurate)
"""
from __future__ import annotations
from sentence_transformers import SentenceTransformer
from app.config import settings

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed_text(text: str) -> list[float]:
    """Generate a single embedding vector for the given text."""
    model = _get_model()
    return model.encode(text, normalize_embeddings=True).tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Generate embedding vectors for a list of texts."""
    model = _get_model()
    return model.encode(texts, normalize_embeddings=True).tolist()
