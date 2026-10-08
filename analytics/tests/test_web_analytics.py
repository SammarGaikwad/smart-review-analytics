import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.web_analytics_service import web_analytics_service

def test_clickstream_analytics():
    res = web_analytics_service.get_clickstream_analytics()
    assert "total_sessions" in res
    assert "page_views" in res
    assert res["total_sessions"] > 0
    assert res["avg_session_duration"] >= 0

def test_ab_test_results():
    res = web_analytics_service.get_ab_test_results()
    assert "variantA" in res
    assert "variantB" in res
    assert "lift" in res
    assert "winner" in res

def test_survey_analytics():
    res = web_analytics_service.get_survey_analytics()
    assert "total_responses" in res
    assert "average_score" in res
    assert "distribution" in res

def test_crawler():
    res = web_analytics_service.crawl_pages()
    assert "pages_crawled" in res
    assert "pages" in res
    assert res["pages_crawled"] > 0
    
def test_index():
    res = web_analytics_service.get_index()
    assert "index" in res
    assert len(res["index"]) > 0

def test_pagerank():
    res = web_analytics_service.get_pagerank()
    assert "pagerank" in res
    assert len(res["pagerank"]) > 0
    assert "rank" in res["pagerank"][0]

def test_search():
    res = web_analytics_service.search("hotel")
    assert "results" in res
    assert len(res["results"]) > 0
    assert "final_score" in res["results"][0]

def test_seo():
    res = web_analytics_service.get_seo_analysis()
    assert "seo_analysis" in res
    assert len(res["seo_analysis"]) > 0
    assert "seo_score" in res["seo_analysis"][0]

if __name__ == "__main__":
    test_clickstream_analytics()
    test_ab_test_results()
    test_survey_analytics()
    test_crawler()
    test_index()
    test_pagerank()
    test_search()
    test_seo()
    print("All Web Analytics tests passed.")
