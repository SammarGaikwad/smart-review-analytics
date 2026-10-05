from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.sentiment_service import sentiment_service

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str = Field(..., description="Review text to analyze for sentiment", example="The hotel room was clean and the staff were very helpful.")

@router.post("/sentiment")
def analyze_sentiment(req: SentimentRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty")

    result = sentiment_service.analyze_sentiment(req.text)

    return {
        "success": True,
        "data": result
    }
