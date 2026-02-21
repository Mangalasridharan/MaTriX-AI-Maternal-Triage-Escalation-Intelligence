"""
RAG retrieval using pgvector cosine similarity search.
"""
from __future__ import annotations
import asyncpg
from app.config import settings
from app.rag.embed import embed_text


async def retrieve_guideline_chunks(query: str, top_k: int = 3) -> list[dict]:
    """
    Embed the query and retrieve the top-k most relevant WHO guideline chunks
    from the pgvector-powered `guideline_chunks` table using cosine similarity.
    """
    query_vec = embed_text(query)
    vec_str = "[" + ",".join(str(v) for v in query_vec) + "]"

    dsn = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn=dsn)

    try:
        rows = await conn.fetch(
            """
            SELECT chunk_text, source, 1 - (embedding <=> $1::vector) AS similarity
            FROM guideline_chunks
            ORDER BY embedding <=> $1::vector
            LIMIT $2
            """,
            vec_str,
            top_k,
        )
        return [
            {
                "chunk_text": r["chunk_text"],
                "source": r["source"],
                "similarity": round(float(r["similarity"]), 4),
            }
            for r in rows
        ]
    finally:
        await conn.close()
