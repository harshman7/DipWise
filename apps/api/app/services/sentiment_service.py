"""Fetch news headlines for symbols via NewsAPI.org."""

from datetime import datetime, timezone

import httpx

from app.core.config import settings
from app.schemas.news import NewsArticle

NEWS_API_EVERYTHING = "https://newsapi.org/v2/everything"


def fetch_news_articles(symbol: str, limit: int = 20) -> tuple[list[NewsArticle], str | None]:
    """Return articles and optional note if the provider is unavailable."""
    key = (settings.NEWS_API_KEY or "").strip()
    if not key:
        return [], "NEWS_API_KEY is not configured; no live headlines returned."

    params = {
        "q": symbol.upper().strip(),
        "sortBy": "publishedAt",
        "pageSize": min(max(limit, 1), 100),
        "language": "en",
        "apiKey": key,
    }
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(NEWS_API_EVERYTHING, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        return [], "News provider request failed."

    if data.get("status") != "ok":
        return [], data.get("message") or "News provider returned an error."

    out: list[NewsArticle] = []
    for art in data.get("articles", [])[:limit]:
        title = (art.get("title") or "").strip() or "(no title)"
        url = (art.get("url") or "").strip()
        if not url:
            continue
        src = art.get("source") or {}
        source_name = src.get("name") if isinstance(src, dict) else None
        pub = art.get("publishedAt")
        try:
            published = datetime.fromisoformat(
                str(pub).replace("Z", "+00:00")
            )
        except (TypeError, ValueError):
            published = datetime.now(timezone.utc)
        out.append(
            NewsArticle(
                headline=title[:500],
                url=url,
                source=source_name,
                sentiment_score=None,
                published_at=published,
            )
        )
    return out, None
