from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.web_analytics_service import web_analytics_service

router = APIRouter()

class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")

@router.get("/clickstream")
def get_clickstream():
    return {"success": True, "data": web_analytics_service.get_clickstream_analytics()}

@router.get("/ab-test")
def get_ab_test():
    return {"success": True, "data": web_analytics_service.get_ab_test_results()}

@router.get("/survey")
def get_survey():
    return {"success": True, "data": web_analytics_service.get_survey_analytics()}

@router.post("/crawl")
def crawl():
    return {"success": True, "data": web_analytics_service.crawl_pages()}

@router.get("/index")
def get_index():
    return {"success": True, "data": web_analytics_service.get_index()}

@router.get("/ranking")
def get_ranking():
    return {"success": True, "data": web_analytics_service.get_pagerank()}

@router.post("/search")
def search(req: SearchRequest):
    return {"success": True, "data": web_analytics_service.search(req.query)}

@router.get("/seo")
def get_seo():
    return {"success": True, "data": web_analytics_service.get_seo_analysis()}
