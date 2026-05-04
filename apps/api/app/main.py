from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.routers import (
    alerts,
    analysis,
    assets,
    auth,
    news,
    portfolios,
    prices,
    reports,
    saved_backtests,
    watchlists,
)


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(auth.router)
    application.include_router(assets.router)
    application.include_router(prices.router)
    application.include_router(analysis.router)
    application.include_router(news.router)
    application.include_router(portfolios.router)
    application.include_router(alerts.router)
    application.include_router(watchlists.router)
    application.include_router(saved_backtests.router)
    application.include_router(reports.router)

    @application.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "dipwise-api"}

    def custom_openapi() -> dict:
        if application.openapi_schema:
            return application.openapi_schema
        openapi_schema = get_openapi(
            title=application.title,
            version="1.0.0",
            routes=application.routes,
        )
        openapi_schema.setdefault("components", {}).setdefault(
            "securitySchemes", {}
        )["HTTPBearer"] = {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT from POST /auth/login",
        }
        application.openapi_schema = openapi_schema
        return application.openapi_schema

    application.openapi = custom_openapi

    return application


app = create_app()
