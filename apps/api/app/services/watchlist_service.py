from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.portfolio import Watchlist, WatchlistItem
from app.schemas.watchlist import (
    WatchlistCreate,
    WatchlistItemCreate,
    WatchlistItemResponse,
    WatchlistResponse,
)
from app.services.price_ingestion_service import upsert_asset


def list_watchlists(db: Session, user_id: int) -> list[WatchlistResponse]:
    rows = (
        db.query(Watchlist)
        .filter(Watchlist.user_id == user_id)
        .order_by(Watchlist.created_at.desc())
        .all()
    )
    return [WatchlistResponse.model_validate(r) for r in rows]


def create_watchlist(db: Session, user_id: int, body: WatchlistCreate) -> WatchlistResponse:
    wl = Watchlist(user_id=user_id, name=body.name)
    db.add(wl)
    db.commit()
    db.refresh(wl)
    return WatchlistResponse.model_validate(wl)


def _get_watchlist(db: Session, user_id: int, watchlist_id: int) -> Watchlist | None:
    return (
        db.query(Watchlist)
        .filter(Watchlist.id == watchlist_id, Watchlist.user_id == user_id)
        .one_or_none()
    )


def list_watchlist_items(
    db: Session, user_id: int, watchlist_id: int
) -> list[WatchlistItemResponse] | None:
    if not _get_watchlist(db, user_id, watchlist_id):
        return None
    rows = (
        db.query(WatchlistItem, Asset.symbol, Asset.name)
        .join(Asset, Asset.id == WatchlistItem.asset_id)
        .filter(WatchlistItem.watchlist_id == watchlist_id)
        .all()
    )
    return [
        WatchlistItemResponse(
            id=item.id,
            asset_id=item.asset_id,
            symbol=sym,
            name=n,
        )
        for item, sym, n in rows
    ]


def add_watchlist_item(
    db: Session, user_id: int, watchlist_id: int, body: WatchlistItemCreate
) -> WatchlistItemResponse | None:
    wl = _get_watchlist(db, user_id, watchlist_id)
    if not wl:
        return None
    asset = upsert_asset(db, body.symbol)
    db.flush()
    existing = (
        db.query(WatchlistItem)
        .filter(
            WatchlistItem.watchlist_id == watchlist_id,
            WatchlistItem.asset_id == asset.id,
        )
        .one_or_none()
    )
    if existing:
        db.refresh(asset)
        return WatchlistItemResponse(
            id=existing.id,
            asset_id=asset.id,
            symbol=asset.symbol,
            name=asset.name,
        )
    item = WatchlistItem(watchlist_id=watchlist_id, asset_id=asset.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    db.refresh(asset)
    return WatchlistItemResponse(
        id=item.id,
        asset_id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
    )


def remove_watchlist_item(
    db: Session, user_id: int, watchlist_id: int, item_id: int
) -> bool:
    if not _get_watchlist(db, user_id, watchlist_id):
        return False
    item = (
        db.query(WatchlistItem)
        .filter(
            WatchlistItem.id == item_id,
            WatchlistItem.watchlist_id == watchlist_id,
        )
        .one_or_none()
    )
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def delete_watchlist(db: Session, user_id: int, watchlist_id: int) -> bool:
    wl = _get_watchlist(db, user_id, watchlist_id)
    if not wl:
        return False
    db.delete(wl)
    db.commit()
    return True
