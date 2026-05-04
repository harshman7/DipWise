from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.schemas.backtest import DipAnalysisRequest
from app.services.backtest_service import simulate_buy_the_dip
from app.services.report_service import generate_csv

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/dips/csv")
def export_dips_csv(body: DipAnalysisRequest) -> StreamingResponse:
    """Run dip analysis and return results as a CSV download."""
    analysis = simulate_buy_the_dip(body)
    csv_bytes = generate_csv(analysis)
    return StreamingResponse(
        iter([csv_bytes]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={analysis.symbol}_dips.csv"},
    )


@router.post("/dips/pdf")
def export_dips_pdf(body: DipAnalysisRequest) -> dict:
    """Placeholder for PDF export."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="PDF export not yet implemented")
