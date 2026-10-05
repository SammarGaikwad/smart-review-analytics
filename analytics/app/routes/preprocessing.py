from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.preprocessing.text_preprocessor import preprocessor

router = APIRouter()

class PreprocessRequest(BaseModel):
    text: str = Field(..., description="Raw text to preprocess", example="Outstanding room cleanliness and 5-star service!")
    lowercase: Optional[bool] = True
    remove_punctuation: Optional[bool] = True
    remove_numbers: Optional[bool] = True
    remove_stopwords: Optional[bool] = True
    lemmatize: Optional[bool] = True
    stem: Optional[bool] = False

@router.post("/preprocess")
def preprocess_text(req: PreprocessRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty")

    result = preprocessor.preprocess(
        text=req.text,
        lowercase=req.lowercase,
        remove_punctuation=req.remove_punctuation,
        remove_numbers=req.remove_numbers,
        remove_stopwords=req.remove_stopwords,
        lemmatize=req.lemmatize,
        stem=req.stem
    )

    return {
        "success": True,
        "data": result
    }
