from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.topic_service import topic_service


router = APIRouter()


class TopicRequest(BaseModel):
    text: str
    top_k: int = Field(default=5, ge=1, le=6)


@router.post("/topics")
def analyze_topics(request: TopicRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text field cannot be empty"
        )

    topics = topic_service.predict_topics(
        text=request.text,
        top_k=request.top_k
    )

    return {
        "success": True,
        "data": {
            "text": request.text,
            "topics": topics
        }
    }
