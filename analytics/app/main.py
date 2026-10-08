import os
import sys
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, preprocessing, sentiment
from app.routes.keywords import router as keyword_router
from app.routes.topics import router as topic_router
from app.routes.clustering import router as clustering_router
from app.routes.network import router as network_router
from app.routes.web_analytics import router as web_analytics_router

app = FastAPI(
    title="Smart Review Analytics Platform - ASTMA Analytics Engine",
    description="Python ASTMA Analytics Engine for Sentiment, Keyword Extraction, Topic Modeling, Clustering & Network Analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup
environment = os.getenv("ENVIRONMENT", "development")
cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:3000")

if environment == "production" and not os.getenv("CORS_ORIGIN"):
    print("FATAL: CORS_ORIGIN environment variable is missing in production.")
    sys.exit(1)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Registrations
app.include_router(health.router, prefix="/api/analytics", tags=["Health"])
app.include_router(preprocessing.router, prefix="/api/analytics", tags=["NLP Preprocessing"])
app.include_router(sentiment.router, prefix="/api/analytics", tags=["Sentiment Analysis"])
app.include_router(keyword_router, prefix="/api/analytics", tags=["Keyword Extraction"])
app.include_router(topic_router, prefix="/api/analytics", tags=["Topic Modeling"])
app.include_router(clustering_router, prefix="/api/analytics", tags=["Clustering"])
app.include_router(network_router, prefix="/api/analytics", tags=["Network Analytics"])
app.include_router(web_analytics_router, prefix="/api/analytics/web", tags=["Web Analytics & Search"])

@app.get("/", tags=["Root"])
def root():
    return {
        "service": "Smart Review Analytics Platform - ASTMA Analytics Engine",
        "status": "online",
        "documentation": "/docs",
        "healthEndpoint": "/api/analytics/health",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
