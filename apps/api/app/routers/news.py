from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.news import NewsListResponse
from app.services.sentiment_service import fetch_news_articles

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/{symbol}", response_model=NewsListResponse)
def news_for_symbol(
    symbol: str,
    current: User = Depends(get_current_user),
) -> NewsListResponse:
    articles, note = fetch_news_articles(symbol, limit=20)
    return NewsListResponse(
        symbol=symbol.upper().strip(),
        articles=articles,
        provider_note=note,
    )
