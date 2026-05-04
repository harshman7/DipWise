from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.watchlist import (
    WatchlistCreate,
    WatchlistItemCreate,
    WatchlistItemResponse,
    WatchlistResponse,
)
from app.services.watchlist_service import (
    add_watchlist_item,
    create_watchlist,
    delete_watchlist,
    list_watchlist_items,
    list_watchlists,
    remove_watchlist_item,
)

router = APIRouter(prefix="/watchlists", tags=["watchlists"])


@router.get("/", response_model=list[WatchlistResponse])
def route_list(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[WatchlistResponse]:
    return list_watchlists(db, current.id)


@router.post("/", response_model=WatchlistResponse, status_code=201)
def route_create(
    body: WatchlistCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> WatchlistResponse:
    return create_watchlist(db, current.id, body)


@router.delete("/{watchlist_id}", status_code=204)
def route_delete(
    watchlist_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> None:
    if not delete_watchlist(db, current.id, watchlist_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )


@router.get("/{watchlist_id}/items", response_model=list[WatchlistItemResponse])
def route_list_items(
    watchlist_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[WatchlistItemResponse]:
    items = list_watchlist_items(db, current.id, watchlist_id)
    if items is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )
    return items


@router.post(
    "/{watchlist_id}/items",
    response_model=WatchlistItemResponse,
    status_code=201,
)
def route_add_item(
    watchlist_id: int,
    body: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> WatchlistItemResponse:
    item = add_watchlist_item(db, current.id, watchlist_id, body)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found",
        )
    return item


@router.delete("/{watchlist_id}/items/{item_id}", status_code=204)
def route_remove_item(
    watchlist_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> None:
    if not remove_watchlist_item(db, current.id, watchlist_id, item_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item or watchlist not found",
        )
