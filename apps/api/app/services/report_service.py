"""Generate CSV and PDF reports for backtests and portfolios."""

import io

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.schemas.backtest import DipAnalysisResponse


def generate_csv(analysis: DipAnalysisResponse) -> bytes:
    meta_lines = [
        f"# DipWise export",
        f"# symbol,{analysis.symbol}",
        f"# start_date,{analysis.start_date.isoformat()}",
        f"# end_date,{analysis.end_date.isoformat()}",
        f"# dip_threshold,{analysis.dip_threshold}",
        f"# total_dips_detected,{analysis.total_dips_detected}",
        f"# strategy_return_pct,{analysis.strategy_return_pct}",
        f"# dca_return_pct,{analysis.dca_return_pct}",
        "#",
    ]
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
    buf.write(("\n".join(meta_lines) + "\n").encode("utf-8"))
    df.to_csv(buf, index=False)
    return buf.getvalue()


def generate_pdf(analysis: DipAnalysisResponse) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()
    story: list = []

    story.append(Paragraph("DipWise — Dip analysis report", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(
        Paragraph(
            f"<b>Symbol:</b> {analysis.symbol} &nbsp; "
            f"<b>Range:</b> {analysis.start_date} to {analysis.end_date}",
            styles["Normal"],
        )
    )
    story.append(
        Paragraph(
            f"<b>Dip threshold:</b> {analysis.dip_threshold:.2%} &nbsp; "
            f"<b>Dips detected:</b> {analysis.total_dips_detected}",
            styles["Normal"],
        )
    )
    story.append(
        Paragraph(
            f"<b>Strategy return:</b> {analysis.strategy_return_pct:.2f}% &nbsp; "
            f"<b>DCA return:</b> {analysis.dca_return_pct:.2f}% &nbsp; "
            f"<b>Invested:</b> ${analysis.total_invested:.2f}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 16))

    if analysis.holding_period_summaries:
        hp_data = [
            ["Period (days)", "Avg %", "Median %", "Win %", "Best %", "Worst %"],
        ]
        for s in analysis.holding_period_summaries:
            hp_data.append(
                [
                    str(s.period_days),
                    f"{s.avg_return_pct:.2f}",
                    f"{s.median_return_pct:.2f}",
                    f"{s.win_rate_pct:.2f}",
                    f"{s.best_return_pct:.2f}",
                    f"{s.worst_return_pct:.2f}",
                ]
            )
        t_hp = Table(hp_data, repeatRows=1)
        t_hp.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1d6ef1")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ]
            )
        )
        story.append(Paragraph("<b>Holding period summaries</b>", styles["Heading2"]))
        story.append(Spacer(1, 6))
        story.append(t_hp)
        story.append(Spacer(1, 16))

    story.append(Paragraph("<b>Dip events</b>", styles["Heading2"]))
    story.append(Spacer(1, 6))

    if not analysis.dip_events:
        story.append(Paragraph("No dip events in range.", styles["Normal"]))
    else:
        keys = list(analysis.dip_events[0].returns.keys())
        header = ["Date", "Price", "Roll high", "DD %"] + [f"Ret {k}" for k in keys]
        ev_data = [header]
        for e in analysis.dip_events:
            row = [
                e.date.isoformat(),
                f"{e.price:.4f}",
                f"{e.rolling_high:.4f}",
                f"{e.drawdown_pct * 100:.2f}%",
            ]
            for k in keys:
                row.append(f"{e.returns.get(k, float('nan')):.4f}")
            ev_data.append(row)
        t_ev = Table(ev_data, repeatRows=1)
        t_ev.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#334155")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
                ]
            )
        )
        story.append(t_ev)

    doc.build(story)
    return buf.getvalue()
