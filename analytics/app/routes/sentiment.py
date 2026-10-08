from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.sentiment_service import sentiment_service
from app.services.sentiment_ml_service import sentiment_ml_service

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

class SentimentPredictRequest(BaseModel):
    text: str = Field(..., description="Review text")
    model: str = Field(..., description="'naive_bayes' or 'svm'")

class SentimentCompareRequest(BaseModel):
    text: str = Field(..., description="Review text")

@router.get("/sentiment/models/evaluation")
def get_model_evaluation():
    data = sentiment_ml_service.get_evaluation()
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])
    return {"success": True, "data": data}

@router.post("/sentiment/predict")
def predict_sentiment(req: SentimentPredictRequest):
    try:
        result = sentiment_ml_service.predict(req.text, req.model)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sentiment/predict/compare")
def compare_sentiment(req: SentimentCompareRequest):
    try:
        result = sentiment_ml_service.compare(req.text)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
