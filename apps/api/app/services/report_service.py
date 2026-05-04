"""Generate CSV and PDF reports for backtests and portfolios.

Placeholder — CSV uses pandas; PDF will use reportlab or weasyprint later.
"""

import io

import pandas as pd

from app.schemas.backtest import DipAnalysisResponse


def generate_csv(analysis: DipAnalysisResponse) -> bytes:
    rows = [
        {
            "date": e.date.isoformat(),
            "price": e.price,
            "rolling_high": e.rolling_high,
            "drawdown_pct": e.drawdown_pct,
            **e.returns,
        }
        for e in analysis.dip_events
    ]
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    return buf.getvalue()


def generate_pdf(analysis: DipAnalysisResponse) -> bytes:
    """Stub — returns placeholder bytes until a PDF library is integrated."""
    # TODO: integrate reportlab or weasyprint
    return b"%PDF-1.4 placeholder"
