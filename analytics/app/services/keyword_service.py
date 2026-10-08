import re
import time
from typing import List, Dict, Tuple, Set
from collections import defaultdict
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from app.preprocessing.text_preprocessor import preprocessor

class KeywordService:

    def __init__(self):
        # We reuse the stop_words from the preprocessor
        self.stop_words = preprocessor.stop_words

    def extract_tfidf(self, text: str, top_k: int = 10) -> Dict:
        start_time = time.time()
        
        if not text or not text.strip():
            return {"candidates": [], "keywords": [], "executionTimeMs": 0}
            
        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]+\b"
        )
        
        try:
            matrix = vectorizer.fit_transform([text])
        except ValueError:
            return {"candidates": [], "keywords": [], "executionTimeMs": 0}
            
        feature_names = vectorizer.get_feature_names_out()
        scores = matrix.toarray()[0]
        
        candidates = list(feature_names)
        
        keywords = [
            {
                "word": feature_names[index],
                "score": round(float(scores[index]), 4)
            }
            for index in range(len(feature_names))
            if scores[index] > 0
        ]
        
        keywords.sort(key=lambda item: item["score"], reverse=True)
        keywords = keywords[:top_k]
        
        exec_time = round((time.time() - start_time) * 1000, 2)
        
        return {
            "candidates": candidates,
            "keywords": keywords,
            "executionTimeMs": exec_time
        }

    def extract_rake(self, text: str, top_k: int = 10) -> Dict:
        start_time = time.time()
        
        if not text or not text.strip():
            return {"candidates": [], "keywords": [], "executionTimeMs": 0}
            
        # 1. Candidate phrase generation (split by punctuation/stopwords)
        sentences = re.split(r'[^a-zA-Z0-9_\+\-\/]', text.lower())
        phrases = []
        for s in sentences:
            words = s.strip().split()
            phrase = []
            for w in words:
                if w in self.stop_words or len(w) < 2:
                    if phrase:
                        phrases.append(" ".join(phrase))
                        phrase = []
                else:
                    phrase.append(w)
            if phrase:
                phrases.append(" ".join(phrase))
                
        candidates = [p for p in phrases if p]
        
        if not candidates:
            return {"candidates": [], "keywords": [], "executionTimeMs": 0}
            
        # 2. Word degree & frequency
        word_freq = defaultdict(int)
        word_degree = defaultdict(int)
        
        for phrase in candidates:
            words = phrase.split()
            phrase_len = len(words)
            for w in words:
                word_freq[w] += 1
                word_degree[w] += phrase_len - 1  # co-occurrence with other words in phrase
                
        # word degree should be degree + frequency
        for w in word_freq:
            word_degree[w] += word_freq[w]
            
        word_score = {}
        for w in word_freq:
            word_score[w] = word_degree[w] / word_freq[w]
            
        # 3. Phrase scoring
        phrase_scores = {}
        for phrase in candidates:
            score = sum(word_score[w] for w in phrase.split())
            phrase_scores[phrase] = score
            
        sorted_phrases = sorted(phrase_scores.items(), key=lambda x: x[1], reverse=True)
        
        seen = set()
        keywords = []
        for p, s in sorted_phrases:
            if p not in seen:
                seen.add(p)
                keywords.append({"word": p, "score": round(s, 4)})
                
        exec_time = round((time.time() - start_time) * 1000, 2)
        
        return {
            "candidates": list(set(candidates)),
            "keywords": keywords[:top_k],
            "executionTimeMs": exec_time
        }
        
    def extract_textrank(self, text: str, top_k: int = 10, window_size: int = 2) -> Dict:
        start_time = time.time()
        
        if not text or not text.strip():
            return {"candidates": [], "keywords": [], "executionTimeMs": 0}
            
        words = [w.lower() for w in re.findall(r'\b[a-zA-Z]+\b', text) if w.lower() not in self.stop_words and len(w) > 1]
        candidates = list(set(words))
        
        if not words:
            return {"candidates": [], "keywords": [], "executionTimeMs": 0}
            
        vocab = list(set(words))
        word2idx = {w: i for i, w in enumerate(vocab)}
        n = len(vocab)
        adj = np.zeros((n, n))
        
        for i in range(len(words)):
            for j in range(i+1, min(i + window_size + 1, len(words))):
                w1 = word2idx[words[i]]
                w2 = word2idx[words[j]]
                if w1 != w2:
                    adj[w1][w2] += 1.0
                    adj[w2][w1] += 1.0
                    
        # normalize
        row_sums = adj.sum(axis=1)
        row_sums[row_sums == 0] = 1 # avoid div zero
        transition = adj / row_sums[:, np.newaxis]
        
        d = 0.85
        scores = np.ones(n)
        
        # Power iteration
        for _ in range(20):
            scores = (1 - d) + d * np.dot(transition.T, scores)
            
        keywords = []
        for i, w in enumerate(vocab):
            keywords.append({"word": w, "score": round(float(scores[i]), 4)})
            
        keywords.sort(key=lambda x: x["score"], reverse=True)
        
        exec_time = round((time.time() - start_time) * 1000, 2)
        
        return {
            "candidates": candidates,
            "keywords": keywords[:top_k],
            "executionTimeMs": exec_time
        }

    def evaluate_metrics(self, extracted: List[Dict], reference: List[str]) -> Tuple[float, float, float]:
        if not extracted or not reference:
            return 0.0, 0.0, 0.0
            
        ext_set = set([k["word"].lower() for k in extracted])
        ref_set = set([r.lower() for r in reference])
        
        # Check partial matches if exact doesn't match for phrases vs words, but strictly speaking precision expects exact matches or standard overlaps.
        # For academic strictness, we'll use exact token matching, but allow for phrases in RAKE to match reference phrases.
        relevant = 0
        for ext in ext_set:
            # We count it as relevant if it's in reference, or a reference is exactly in it
            # To be strictly correct: 
            if ext in ref_set:
                relevant += 1
            else:
                # If they provided single words and we extracted a phrase, maybe credit it?
                # For basic implementation, exact match is expected.
                # We will check exact match.
                pass
                
        precision = relevant / len(ext_set) if ext_set else 0.0
        recall = relevant / len(ref_set) if ref_set else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
        
        return round(precision, 4), round(recall, 4), round(f1, 4)

    def compare(self, text: str, reference: List[str], top_k: int = 10) -> Dict:
        res_tfidf = self.extract_tfidf(text, top_k)
        res_rake = self.extract_rake(text, top_k)
        res_textrank = self.extract_textrank(text, top_k)
        
        for res in [res_tfidf, res_rake, res_textrank]:
            if reference:
                p, r, f1 = self.evaluate_metrics(res["keywords"], reference)
                res["precision"] = p
                res["recall"] = r
                res["f1"] = f1
            else:
                res["precision"] = None
                res["recall"] = None
                res["f1"] = None
                
        return {
            "tfidf": res_tfidf,
            "rake": res_rake,
            "textrank": res_textrank
        }

keyword_service = KeywordService()