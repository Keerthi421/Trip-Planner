from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .database import init_db
from .api import auth, trips, itinerary, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown


app = FastAPI(
    title="AI Travel Planner API",
    description="Intelligent travel planning with RAG and Gemini AI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(itinerary.router)
app.include_router(chat.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/")
def root():
    return {"message": "AI Travel Planner API", "docs": "/docs"}
