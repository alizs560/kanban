# Stage 1: Build Frontend (Next.js Static Export)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: uv binary provider
FROM ghcr.io/astral-sh/uv:0.5.11 AS uv-bin

# Stage 3: Python runtime environment
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app

# Copy uv binaries from stage 2
COPY --from=uv-bin /uv /uvx /bin/

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install backend dependencies via uv
COPY backend/pyproject.toml /app/backend/
WORKDIR /app/backend
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy backend source code
COPY backend/ /app/backend/

# Copy static frontend build output into backend static directory
COPY --from=frontend-builder /app/frontend/out /app/backend/static

# Expose port
EXPOSE 8000

# Run FastAPI via uvicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
