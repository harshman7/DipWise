from datetime import datetime

from pydantic import BaseModel, Field


class NewsArticle(BaseModel):
    headline: str = Field(..., max_length=500)
    url: str
    source: str | None = None
    sentiment_score: float | None = Field(default=None, ge=-1, le=1)
    published_at: datetime


class NewsListResponse(BaseModel):
    symbol: str
    articles: list[NewsArticle]
    provider_note: str | None = None
