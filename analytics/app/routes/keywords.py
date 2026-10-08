import json
import os
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.keyword_service import keyword_service

router = APIRouter()

class KeywordRequest(BaseModel):
    text: str
    top_k: int = Field(default=10, ge=1, le=50)

class CompareKeywordRequest(BaseModel):
    text: str
    referenceKeywords: Optional[List[str]] = None
    top_k: int = Field(default=10, ge=1, le=50)

@router.post("/keywords")
def extract_keywords(request: KeywordRequest):
    result = keyword_service.extract_tfidf(
        text=request.text,
        top_k=request.top_k
    )

    return {
        "success": True,
        "data": {
            "text": request.text,
            "keywords": result["keywords"]
        }
    }

@router.post("/keywords/compare")
def compare_keywords(request: CompareKeywordRequest):
    methods_res = keyword_service.compare(
        text=request.text,
        reference=request.referenceKeywords or [],
        top_k=request.top_k
    )
    
    return {
        "success": True,
        "data": {
            "text": request.text,
            "methods": methods_res
        }
    }

@router.post("/keywords/benchmark")
def benchmark_keywords():
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "keyword_benchmark.json")
    
    try:
        with open(dataset_path, "r", encoding="utf-8") as f:
            dataset = json.load(f)
    except Exception as e:
        return {"success": False, "error": f"Failed to load benchmark dataset: {str(e)}"}
        
    doc_count = len(dataset)
    if doc_count == 0:
        return {"success": False, "error": "Benchmark dataset is empty."}
        
    metrics = {
        "tfidf": {"p": 0, "r": 0, "f1": 0, "t": 0},
        "rake": {"p": 0, "r": 0, "f1": 0, "t": 0},
        "textrank": {"p": 0, "r": 0, "f1": 0, "t": 0}
    }
    
    results_by_doc = []
    
    for doc in dataset:
        text = doc["text"]
        ref = doc.get("referenceKeywords", [])
        
        comp = keyword_service.compare(text, ref, top_k=10)
        
        for m in ["tfidf", "rake", "textrank"]:
            metrics[m]["p"] += comp[m]["precision"] or 0
            metrics[m]["r"] += comp[m]["recall"] or 0
            metrics[m]["f1"] += comp[m]["f1"] or 0
            metrics[m]["t"] += comp[m]["executionTimeMs"] or 0
            
        results_by_doc.append({
            "id": doc["id"],
            "text": text,
            "referenceKeywords": ref,
            "methods": comp
        })
        
    # averages
    summary = {}
    for m in ["tfidf", "rake", "textrank"]:
        summary[m] = {
            "precision": round(metrics[m]["p"] / doc_count, 4),
            "recall": round(metrics[m]["r"] / doc_count, 4),
            "f1": round(metrics[m]["f1"] / doc_count, 4),
            "averageExecutionTimeMs": round(metrics[m]["t"] / doc_count, 2)
        }
        
    return {
        "success": True,
        "data": {
            "documentCount": doc_count,
            "summary": summary,
            "documents": results_by_doc
        }
    }