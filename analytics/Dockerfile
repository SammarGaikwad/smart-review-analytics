# Production Dockerfile for Python FastAPI Analytics Engine
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for C extension builds
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies file
COPY analytics/requirements.txt ./

# Install python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download required NLTK tokenizers & VADER lexicon data
RUN python -c "import nltk; nltk.download('vader_lexicon'); nltk.download('punkt'); nltk.download('stopwords')"

# Copy application files and datasets
COPY analytics/app ./app
COPY datasets ./datasets

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
