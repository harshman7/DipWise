from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import alerts, analysis, assets, portfolios, prices, reports


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

    application.include_router(assets.router)
    application.include_router(prices.router)
    application.include_router(analysis.router)
    application.include_router(portfolios.router)
    application.include_router(alerts.router)
    application.include_router(reports.router)

    @application.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "dipwise-api"}

    return application


app = create_app()
