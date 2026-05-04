"""Fetch and score news sentiment for assets.

Placeholder — will integrate a news API (e.g. NewsAPI, Finnhub) and run
basic sentiment analysis.
"""


def fetch_news_sentiment(symbol: str, limit: int = 20) -> list[dict]:
    """Return recent news items with sentiment scores for the given symbol."""
    # TODO: integrate real news provider
    return [
        {
            "headline": f"Markets react to {symbol} earnings report",
            "source": "MockNews",
            "sentiment_score": 0.65,
            "published_at": "2026-01-15T10:30:00Z",
            "url": f"https://example.com/news/{symbol.lower()}-earnings",
        }
    ]
