# 1. Use a lightweight, stable official Python base image
FROM python:3.12-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# 3. Install system dependencies (libgomp1 is REQUIRED for XGBoost OpenMP on Linux)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 4. Set container working directory
WORKDIR /app

# 5. Copy requirements first to leverage Docker layer caching
COPY backend/requirements.txt /app/backend/requirements.txt

# 6. Upgrade pip and install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# 7. Copy backend application source code, models, and data
COPY backend/ /app/backend/

# 8. Expose application port
EXPOSE 8000

# 9. Start Uvicorn server (supports dynamic $PORT on Cloud Run, Railway, and Render)
CMD ["sh", "-c", "exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
