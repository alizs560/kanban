# Stage 1: uv binary provider
FROM ghcr.io/astral-sh/uv:0.5.11 AS uv-bin

# Stage 2: Python runtime environment
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app

# Copy uv binaries from stage 1
COPY --from=uv-bin /uv /uvx /bin/

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install dependencies via uv
COPY backend/pyproject.toml /app/backend/
WORKDIR /app/backend
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy backend source code and static assets
COPY backend/ /app/backend/

# Expose port
EXPOSE 8000

# Run FastAPI via uvicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
