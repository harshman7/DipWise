from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.portfolio import Portfolio, PortfolioPosition, PortfolioTransaction
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioDetailResponse,
    PortfolioResponse,
    PortfolioTransactionCreate,
    PortfolioTransactionResponse,
    PositionResponse,
)
from app.services.price_ingestion_service import upsert_asset


class PortfolioNotFoundError(Exception):
    """Portfolio missing or not owned by the user."""


def list_portfolios(db: Session, user_id: int) -> list[PortfolioResponse]:
    rows = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user_id)
        .order_by(Portfolio.created_at.desc())
        .all()
    )
    return [PortfolioResponse.model_validate(r) for r in rows]


def get_portfolio_detail(
    db: Session, user_id: int, portfolio_id: int
) -> PortfolioDetailResponse | None:
    pf = (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
        .one_or_none()
    )
    if not pf:
        return None
    positions_raw = (
        db.query(PortfolioPosition, Asset.symbol, Asset.name)
        .join(Asset, Asset.id == PortfolioPosition.asset_id)
        .filter(PortfolioPosition.portfolio_id == portfolio_id)
        .all()
    )
    positions = [
        PositionResponse(
            id=pos.id,
            asset_symbol=sym,
            shares=float(pos.shares),
            avg_cost_basis=float(pos.avg_cost_basis),
        )
        for pos, sym, _name in positions_raw
    ]
    return PortfolioDetailResponse(
        id=pf.id,
        name=pf.name,
        description=pf.description,
        created_at=pf.created_at,
        positions=positions,
    )


def create_portfolio(db: Session, user_id: int, body: PortfolioCreate) -> PortfolioResponse:
    pf = Portfolio(
        user_id=user_id,
        name=body.name,
        description=body.description,
    )
    db.add(pf)
    db.commit()
    db.refresh(pf)
    return PortfolioResponse.model_validate(pf)


def _assert_portfolio_owner(
    db: Session, user_id: int, portfolio_id: int
) -> Portfolio | None:
    return (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == user_id)
        .one_or_none()
    )


def add_portfolio_transaction(
    db: Session,
    user_id: int,
    portfolio_id: int,
    body: PortfolioTransactionCreate,
) -> PortfolioTransactionResponse:
    pf = _assert_portfolio_owner(db, user_id, portfolio_id)
    if not pf:
        raise PortfolioNotFoundError()

    asset = upsert_asset(db, body.symbol)
    db.flush()

    shares = float(body.shares)
    price = float(body.price)
    executed = body.executed_at or datetime.now(timezone.utc)

    pos = (
        db.query(PortfolioPosition)
        .filter(
            PortfolioPosition.portfolio_id == portfolio_id,
            PortfolioPosition.asset_id == asset.id,
        )
        .one_or_none()
    )
    cur_shares = float(pos.shares) if pos else 0.0
    cur_avg = float(pos.avg_cost_basis) if pos else 0.0

    if body.tx_type == "buy":
        new_shares = cur_shares + shares
        if new_shares <= 0:
            raise ValueError("Invalid share amount")
        if cur_shares <= 0:
            new_avg = price
        else:
            new_avg = (cur_shares * cur_avg + shares * price) / new_shares
        if pos:
            pos.shares = new_shares
            pos.avg_cost_basis = new_avg
        else:
            db.add(
                PortfolioPosition(
                    portfolio_id=portfolio_id,
                    asset_id=asset.id,
                    shares=new_shares,
                    avg_cost_basis=new_avg,
                )
            )
    else:
        if cur_shares < shares - 1e-9:
            raise ValueError("Cannot sell more shares than held")
        new_shares = cur_shares - shares
        if not pos:
            raise ValueError("No position to sell")
        if new_shares <= 1e-9:
            db.delete(pos)
        else:
            pos.shares = new_shares

    tx = PortfolioTransaction(
        portfolio_id=portfolio_id,
        asset_id=asset.id,
        tx_type=body.tx_type,
        shares=shares,
        price=price,
        executed_at=executed,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return PortfolioTransactionResponse(
        id=tx.id,
        portfolio_id=portfolio_id,
        asset_symbol=asset.symbol,
        tx_type=tx.tx_type,
        shares=float(tx.shares),
        price=float(tx.price),
        executed_at=tx.executed_at,
    )


def list_portfolio_transactions(
    db: Session,
    user_id: int,
    portfolio_id: int,
    *,
    limit: int = 50,
    offset: int = 0,
) -> list[PortfolioTransactionResponse] | None:
    if not _assert_portfolio_owner(db, user_id, portfolio_id):
        return None
    limit = min(max(limit, 1), 200)
    offset = max(offset, 0)
    rows = (
        db.query(PortfolioTransaction, Asset.symbol)
        .join(Asset, Asset.id == PortfolioTransaction.asset_id)
        .filter(PortfolioTransaction.portfolio_id == portfolio_id)
        .order_by(PortfolioTransaction.executed_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        PortfolioTransactionResponse(
            id=tx.id,
            portfolio_id=portfolio_id,
            asset_symbol=sym,
            tx_type=tx.tx_type,
            shares=float(tx.shares),
            price=float(tx.price),
            executed_at=tx.executed_at,
        )
        for tx, sym in rows
    ]
