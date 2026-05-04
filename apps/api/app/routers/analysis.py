from fastapi import APIRouter

from app.schemas.backtest import DipAnalysisRequest, DipAnalysisResponse
from app.services.backtest_service import simulate_buy_the_dip

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/dips", response_model=DipAnalysisResponse)
def analyze_dips(body: DipAnalysisRequest) -> DipAnalysisResponse:
    """Detect historical dips and backtest a buy-the-dip strategy."""
    return simulate_buy_the_dip(body)
