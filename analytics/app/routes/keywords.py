from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.keyword_service import keyword_service


router = APIRouter()


class KeywordRequest(BaseModel):
    text: str
    top_k: int = Field(default=10, ge=1, le=50)


@router.post("/keywords")
def extract_keywords(request: KeywordRequest):
    keywords = keyword_service.extract_keywords(
        text=request.text,
        top_k=request.top_k
    )

    return {
        "success": True,
        "data": {
            "text": request.text,
            "keywords": keywords
        }
    }