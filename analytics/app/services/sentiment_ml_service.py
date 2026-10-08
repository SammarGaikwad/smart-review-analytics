import json
import os
import warnings
from typing import Dict, List, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.exceptions import UndefinedMetricWarning

# Suppress precision/recall warnings for small datasets
warnings.filterwarnings("ignore", category=UndefinedMetricWarning)

from app.services.sentiment_service import sentiment_service

class SentimentMLService:
    def __init__(self):
        self.models_trained = False
        self.evaluation_results = {}
        self.pipeline_nb = None
        self.pipeline_svm = None
        self.train_size = 0
        self.test_size = 0
        self.classes = []
        self._train_models()

    def _train_models(self):
        dataset_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets", "sentiment_training.json")
        try:
            with open(dataset_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load sentiment training dataset: {e}")
            return
            
        texts = [item["text"] for item in data]
        labels = [item["label"] for item in data]
        
        self.classes = sorted(list(set(labels)))
        
        # We need at least 2 classes and some samples to train.
        if len(self.classes) < 2 or len(texts) < 5:
            print("Warning: Insufficient classes or samples for ML sentiment training.")
            return
            
        # Due to extremely small dataset, we'll try to stratify if possible, else random split.
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                texts, labels, test_size=0.2, random_state=42, stratify=labels
            )
        except ValueError:
            X_train, X_test, y_train, y_test = train_test_split(
                texts, labels, test_size=0.2, random_state=42
            )
            
        self.train_size = len(X_train)
        self.test_size = len(X_test)
        
        # Build Pipelines
        self.pipeline_nb = Pipeline([
            ('tfidf', TfidfVectorizer(lowercase=True, stop_words='english')),
            ('clf', MultinomialNB())
        ])
        
        self.pipeline_svm = Pipeline([
            ('tfidf', TfidfVectorizer(lowercase=True, stop_words='english')),
            ('clf', LinearSVC(random_state=42))
        ])
        
        # Train
        self.pipeline_nb.fit(X_train, y_train)
        self.pipeline_svm.fit(X_train, y_train)
        
        self.models_trained = True
        
        # Evaluate
        self._evaluate(X_test, y_test)

    def _evaluate(self, X_test, y_test):
        y_pred_nb = self.pipeline_nb.predict(X_test)
        y_pred_svm = self.pipeline_svm.predict(X_test)
        
        self.evaluation_results["naive_bayes"] = {
            "accuracy": round(accuracy_score(y_test, y_pred_nb), 4),
            "precision": round(precision_score(y_test, y_pred_nb, average="weighted", zero_division=0), 4),
            "recall": round(recall_score(y_test, y_pred_nb, average="weighted", zero_division=0), 4),
            "f1": round(f1_score(y_test, y_pred_nb, average="weighted", zero_division=0), 4),
            "confusion_matrix": {
                "labels": self.classes,
                "matrix": confusion_matrix(y_test, y_pred_nb, labels=self.classes).tolist()
            }
        }
        
        self.evaluation_results["svm"] = {
            "accuracy": round(accuracy_score(y_test, y_pred_svm), 4),
            "precision": round(precision_score(y_test, y_pred_svm, average="weighted", zero_division=0), 4),
            "recall": round(recall_score(y_test, y_pred_svm, average="weighted", zero_division=0), 4),
            "f1": round(f1_score(y_test, y_pred_svm, average="weighted", zero_division=0), 4),
            "confusion_matrix": {
                "labels": self.classes,
                "matrix": confusion_matrix(y_test, y_pred_svm, labels=self.classes).tolist()
            }
        }
        
    def predict(self, text: str, model: str) -> Dict[str, Any]:
        if not self.models_trained:
            raise ValueError("Models are not trained due to missing dataset or insufficient data.")
            
        if not text or not text.strip():
            raise ValueError("Text cannot be empty.")
            
        if model not in ["naive_bayes", "svm"]:
            raise ValueError("Invalid model. Must be 'naive_bayes' or 'svm'.")
            
        pipeline = self.pipeline_nb if model == "naive_bayes" else self.pipeline_svm
        
        prediction = pipeline.predict([text])[0]
        
        result = {
            "text": text,
            "model": model,
            "prediction": prediction
        }
        
        # Add probabilities/scores
        if model == "naive_bayes":
            proba = self.pipeline_nb.predict_proba([text])[0]
            result["probabilities"] = {
                cls: round(float(p), 4) for cls, p in zip(self.pipeline_nb.classes_, proba)
            }
        elif model == "svm":
            # LinearSVC provides decision_function instead of probabilities
            decision_scores = self.pipeline_svm.decision_function([text])[0]
            # Handle binary vs multiclass decision function shape
            if len(self.pipeline_svm.classes_) == 2:
                # Binary returns single array
                result["decision_scores"] = {
                    self.pipeline_svm.classes_[1]: round(float(decision_scores), 4)
                }
            else:
                result["decision_scores"] = {
                    cls: round(float(score), 4) for cls, score in zip(self.pipeline_svm.classes_, decision_scores)
                }
                
        return result

    def get_evaluation(self) -> Dict[str, Any]:
        if not self.models_trained:
            return {"error": "Models not trained."}
            
        return {
            "training_samples": self.train_size,
            "testing_samples": self.test_size,
            "classes": self.classes,
            "naive_bayes": self.evaluation_results.get("naive_bayes"),
            "svm": self.evaluation_results.get("svm")
        }

    def compare(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            raise ValueError("Text cannot be empty.")
            
        # Lexicon prediction
        lex_res = sentiment_service.analyze_sentiment(text)
        
        # ML predictions
        if self.models_trained:
            nb_pred = self.pipeline_nb.predict([text])[0]
            svm_pred = self.pipeline_svm.predict([text])[0]
        else:
            nb_pred = None
            svm_pred = None
            
        return {
            "text": text,
            "lexicon": {
                "prediction": lex_res["sentiment"],
                "score": lex_res["score"]
            },
            "naiveBayes": {
                "prediction": nb_pred
            },
            "svm": {
                "prediction": svm_pred
            }
        }

sentiment_ml_service = SentimentMLService()
