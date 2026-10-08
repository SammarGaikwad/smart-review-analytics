import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.sentiment_ml_service import sentiment_ml_service

def test_models_trained():
    assert sentiment_ml_service.models_trained is True
    assert sentiment_ml_service.train_size > 0
    assert sentiment_ml_service.test_size > 0
    assert len(sentiment_ml_service.classes) >= 2

def test_predict_naive_bayes():
    res = sentiment_ml_service.predict("The product is great", "naive_bayes")
    assert "prediction" in res
    assert "probabilities" in res
    assert res["model"] == "naive_bayes"

def test_predict_svm():
    res = sentiment_ml_service.predict("The product is terrible", "svm")
    assert "prediction" in res
    assert "decision_scores" in res
    assert res["model"] == "svm"

def test_empty_text():
    try:
        sentiment_ml_service.predict("", "svm")
        assert False, "Should raise ValueError"
    except ValueError:
        pass

def test_invalid_model():
    try:
        sentiment_ml_service.predict("Good", "invalid_model")
        assert False, "Should raise ValueError"
    except ValueError:
        pass

def test_evaluation_metrics():
    eval_data = sentiment_ml_service.get_evaluation()
    assert "naive_bayes" in eval_data
    assert "svm" in eval_data
    
    nb = eval_data["naive_bayes"]
    assert "accuracy" in nb
    assert "precision" in nb
    assert "recall" in nb
    assert "f1" in nb
    assert "confusion_matrix" in nb
    
    svm = eval_data["svm"]
    assert "accuracy" in svm
    assert "precision" in svm
    
def test_compare_models():
    res = sentiment_ml_service.compare("Amazing product")
    assert "lexicon" in res
    assert "naiveBayes" in res
    assert "svm" in res
    assert "prediction" in res["lexicon"]
    assert "prediction" in res["naiveBayes"]
    assert "prediction" in res["svm"]

if __name__ == "__main__":
    test_models_trained()
    test_predict_naive_bayes()
    test_predict_svm()
    test_empty_text()
    test_invalid_model()
    test_evaluation_metrics()
    test_compare_models()
    print("All ML sentiment tests passed.")
