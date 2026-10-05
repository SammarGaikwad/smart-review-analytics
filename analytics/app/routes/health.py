from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "analytics-api",
        "subjectMapping": [
            "ASTMA Analytics Tier",
            "IPTM DevOps Baseline"
        ],
        "version": "1.0.0"
    }
