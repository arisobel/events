"""
Event Operations Platform - Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.modules.auth import router as auth_router
from app.modules.hotel import router as hotel_router
from app.modules.events import router as events_router
from app.modules.guests import router as guests_router
from app.modules.rooms import router as rooms_router
from app.modules.tasks import router as tasks_router


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Platform for managing complex hospitality events with hotel infrastructure, guests, tasks, and operations.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint with API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": settings.APP_VERSION
    }


# Include routers
app.include_router(auth_router.router)
app.include_router(hotel_router.router)
app.include_router(events_router.router)
app.include_router(guests_router.router)
app.include_router(rooms_router.router)
app.include_router(tasks_router.router)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Execute on application startup."""
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"Docs available at: /docs")
    print(f"Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'configured'}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown."""
    print(f"Shutting down {settings.APP_NAME}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )