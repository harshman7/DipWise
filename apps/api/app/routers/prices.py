from datetime import date

from fastapi import APIRouter, Query

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/{symbol}")
def get_prices(
    symbol: str,
    start: date = Query(...),
    end: date = Query(...),
) -> dict:
    """Return historical daily prices for a symbol."""
    # TODO: query daily_prices table or fetch from provider
    return {"symbol": symbol, "start": str(start), "end": str(end), "prices": []}
