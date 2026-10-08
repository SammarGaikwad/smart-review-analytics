import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.keyword_service import keyword_service

def test_tfidf_extraction():
    text = "Machine learning is fascinating. Machine learning models are cool."
    res = keyword_service.extract_tfidf(text, top_k=5)
    assert "candidates" in res
    assert "keywords" in res
    assert "executionTimeMs" in res
    words = [k["word"] for k in res["keywords"]]
    assert "machine" in words or "learning" in words

def test_rake_extraction():
    text = "Machine learning is fascinating. Machine learning models are cool."
    res = keyword_service.extract_rake(text, top_k=5)
    assert "candidates" in res
    assert "keywords" in res
    assert len(res["candidates"]) > 0
    words = [k["word"] for k in res["keywords"]]
    assert "machine learning" in words or "machine learning models" in words or "cool" in words

def test_textrank_extraction():
    text = "Machine learning is fascinating. Machine learning models are cool."
    res = keyword_service.extract_textrank(text, top_k=5)
    assert "candidates" in res
    assert "keywords" in res
    assert len(res["candidates"]) > 0
    words = [k["word"] for k in res["keywords"]]
    assert "learning" in words or "machine" in words

def test_evaluate_metrics():
    extracted = [
        {"word": "apple", "score": 1.0},
        {"word": "banana", "score": 0.8},
        {"word": "car", "score": 0.5}
    ]
    reference = ["apple", "banana", "orange"]
    p, r, f1 = keyword_service.evaluate_metrics(extracted, reference)
    assert p == 0.6667
    assert r == 0.6667
    assert f1 == 0.6667

def test_empty_document():
    res = keyword_service.compare("", ["test"], 5)
    assert len(res["tfidf"]["keywords"]) == 0
    assert len(res["rake"]["keywords"]) == 0
    assert len(res["textrank"]["keywords"]) == 0
    assert res["tfidf"]["precision"] == 0.0

def test_empty_reference():
    res = keyword_service.compare("This is a test document.", [], 5)
    assert res["tfidf"]["precision"] is None
    assert res["rake"]["recall"] is None

if __name__ == "__main__":
    test_tfidf_extraction()
    test_rake_extraction()
    test_textrank_extraction()
    test_evaluate_metrics()
    test_empty_document()
    test_empty_reference()
    print("All keyword tests passed.")
