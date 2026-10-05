from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.clustering_service import clustering_service


router = APIRouter()


class ReviewItem(BaseModel):
    id: str
    text: str


class ClusteringRequest(BaseModel):
    reviews: List[ReviewItem]
    k: int = Field(default=4, ge=1, le=50)


@router.post("/clustering")
def perform_clustering(request: ClusteringRequest):
    if not request.reviews or len(request.reviews) == 0:
        raise HTTPException(
            status_code=400,
            detail="Reviews array cannot be empty"
        )

    # Validate that every review text is non-empty
    valid_items = [r for r in request.reviews if r.text and r.text.strip()]
    if not valid_items:
        raise HTTPException(
            status_code=400,
            detail="Reviews list contains no valid text"
        )

    result = clustering_service.perform_clustering(
        reviews=[r.model_dump() for r in request.reviews],
        k=request.k
    )

    return {
        "success": True,
        "data": result
    }
