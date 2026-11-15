from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from .database import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Kanban AI API",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": "Kanban AI",
    }


# Determine static files directory
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

if not (STATIC_DIR / "index.html").exists():
    FRONTEND_OUT = BASE_DIR.parent / "frontend" / "out"
    if (FRONTEND_OUT / "index.html").exists():
        STATIC_DIR = FRONTEND_OUT

if STATIC_DIR.exists() and (STATIC_DIR / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
else:
    @app.get("/")
    async def index_fallback():
        return HTMLResponse("<h1>Kanban AI</h1><p>Static directory not initialized.</p>")
