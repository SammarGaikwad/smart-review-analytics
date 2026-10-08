import re
import math
import time
from typing import List, Dict, Set
from collections import defaultdict
import nltk
from nltk.corpus import stopwords
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    pass

stop_words = set(stopwords.words('english'))

def get_candidates_rake(text: str, stop_words: Set[str]) -> List[str]:
    # Split by punctuation to get clauses
    sentences = re.split(r'[^a-zA-Z0-9_\+\-\/]', text.lower())
    phrases = []
    for s in sentences:
        words = s.strip().split()
        phrase = []
        for w in words:
            if w in stop_words:
                if phrase:
                    phrases.append(" ".join(phrase))
                    phrase = []
            else:
                phrase.append(w)
        if phrase:
            phrases.append(" ".join(phrase))
    return [p for p in phrases if p]

def rake(text: str, top_k: int = 10):
    candidates = get_candidates_rake(text, stop_words)
    word_freq = defaultdict(int)
    word_degree = defaultdict(int)
    
    for phrase in candidates:
        words = phrase.split()
        phrase_len = len(words)
        for w in words:
            word_freq[w] += 1
            word_degree[w] += phrase_len
            
    word_score = {}
    for w in word_freq:
        word_score[w] = word_degree[w] / word_freq[w]
        
    phrase_scores = {}
    for phrase in candidates:
        score = sum(word_score[w] for w in phrase.split())
        phrase_scores[phrase] = score
        
    # Sort and deduplicate
    sorted_phrases = sorted(phrase_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Return unique
    seen = set()
    res = []
    for p, s in sorted_phrases:
        if p not in seen:
            seen.add(p)
            res.append({"word": p, "score": round(s, 4)})
            
    return {"candidates": list(set(candidates)), "keywords": res[:top_k]}

def textrank(text: str, top_k: int = 10, window_size: int = 2):
    # tokenize
    words = [w.lower() for w in re.findall(r'\b[a-zA-Z]+\b', text) if w.lower() not in stop_words]
    candidates = list(set(words))
    
    if not words:
        return {"candidates": [], "keywords": []}
        
    # build graph
    vocab = list(set(words))
    word2idx = {w: i for i, w in enumerate(vocab)}
    n = len(vocab)
    adj = np.zeros((n, n))
    
    for i in range(len(words)):
        for j in range(i+1, i+window_size):
            if j < len(words):
                w1 = word2idx[words[i]]
                w2 = word2idx[words[j]]
                adj[w1][w2] = 1.0
                adj[w2][w1] = 1.0
                
    # normalize rows
    row_sums = adj.sum(axis=1)
    # prevent div by zero
    row_sums[row_sums == 0] = 1
    transition = adj / row_sums[:, np.newaxis]
    
    # pagerank
    d = 0.85
    scores = np.ones(n)
    for _ in range(20): # 20 iterations
        scores = (1 - d) + d * np.dot(transition.T, scores)
        
    res = []
    for i, w in enumerate(vocab):
        res.append({"word": w, "score": round(float(scores[i]), 4)})
        
    res.sort(key=lambda x: x["score"], reverse=True)
    return {"candidates": candidates, "keywords": res[:top_k]}

def evaluate(extracted, reference):
    if not extracted or not reference:
        return 0.0, 0.0, 0.0
    ext = set([k["word"].lower() for k in extracted])
    ref = set([r.lower() for r in reference])
    
    relevant = len(ext.intersection(ref))
    precision = relevant / len(ext) if ext else 0.0
    recall = relevant / len(ref) if ref else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    
    return round(precision, 4), round(recall, 4), round(f1, 4)

print(rake("The quick brown fox jumps over the lazy dog. The dog is very lazy.", 5))
print(textrank("The quick brown fox jumps over the lazy dog. The dog is very lazy.", 5))
