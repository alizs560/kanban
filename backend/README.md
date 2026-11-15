# Kanban Backend

FastAPI backend application for the LOOM project management system.

## Overview

The backend is built with Python 3.11+ and FastAPI, managed using `uv`. It serves the pre-built static Next.js frontend files directly from the root path `/` and exposes REST API endpoints under `/api`.

## Endpoints

- `GET /`: Serves the static Next.js application (`backend/static/index.html`)
- `GET /api/health`: Health check endpoint returning `{ "status": "ok" }`
- `GET /api/docs`: Interactive OpenAPI documentation (Swagger UI)

## Database milestone

- SQLite database modeling with multi-user schema support is documented in `docs/schema.json` and `docs/DATABASE.md`.
- SQLite initialization and default user seeding (`user` / `password`) are implemented in `app/database.py`.
- Authentication endpoints (`POST /api/auth/login` and `GET /api/auth/me`) with Bearer sessions
- Full Board CRUD endpoints (`/api/board`)
- OpenRouter integration with `openai/gpt-oss-120b` for the sidebar AI assistant

## Requirements

- Python 3.11+
- `uv` package manager

## Running Locally

From the `backend/` directory:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access the application at `http://localhost:8000` and API docs at `http://localhost:8000/api/docs`.

Run backend tests with:

```bash
uv run --group dev python -m unittest discover -s tests -v
```

## Running in Docker

From the project root:

- Windows: `.\scripts\start.ps1`
- Linux/macOS: `./scripts/start.sh`
