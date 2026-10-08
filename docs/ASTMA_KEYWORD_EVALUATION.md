# ASTMA Keyword Extraction Evaluation

## 1. Purpose
This document outlines the implementation of the Keyword Extraction Evaluation module to fulfill the requirements of ASTMA Unit III (Text Extraction). It details the algorithms implemented, evaluation metrics used, and instructions on how to use the comparison and benchmarking tools within the Smart Review Analytics Platform.

## 2. Architecture
The Keyword Extraction Evaluation is built as an enhancement to the Python FastAPI analytics engine. It natively supports three distinct keyword extraction algorithms and exposes REST endpoints `/api/analytics/keywords/compare` and `/api/analytics/keywords/benchmark`. 

The Node.js backend serves as a proxy for the frontend React application, preserving the platform's microservice-style separation of concerns while keeping operations stateless and performant.

## 3. TF-IDF
**Term Frequency-Inverse Document Frequency** determines word relevance by measuring how frequently a word appears in a given document compared to the entire corpus. 
*Note on single-document calculation:* The implementation uses `scikit-learn`'s `TfidfVectorizer`. When executed on a single text string (like a single user input), the "Inverse Document Frequency" mathematically normalizes to 1 (or essentially constant) for all present terms, effectively acting purely as a normalized Term Frequency (TF) score. 

## 4. RAKE
**Rapid Automatic Keyword Extraction (RAKE)** is an unsupervised, domain-independent method. 
It operates by parsing the text into candidate phrases split by punctuation and stopwords. It then scores each candidate phrase based on the word degree (number of co-occurrences with other words within phrases) divided by the word frequency. 

## 5. TextRank
**TextRank** is a graph-based ranking model for text processing. 
The algorithm tokenizes the text and removes stopwords, considering the remaining words as nodes in a graph. An adjacency matrix is built by connecting words that co-occur within a specified window size (e.g., 2). The PageRank algorithm (via power iteration) is then applied to the normalized transition matrix to determine the most "central" or important keywords.

## 6. Candidate Keyword Extraction
The UI and API explicitly delineate between candidate keywords and final extracted keywords:
- **TF-IDF:** The candidates are all unique tokens identified by the vectorizer.
- **RAKE:** The candidates are all continuous contiguous word phrases separated by stopwords/punctuation.
- **TextRank:** The candidates are all non-stopword tokens in the document.

## 7. Stopword Handling
Stopword removal is essential for reducing noise. The analytics engine leverages the existing English stopword corpus from the `nltk` library (`nltk.corpus.stopwords`), stripping functionally irrelevant terms ("the", "is", "in", etc.) before building matrices or graphs for RAKE and TextRank.

## 8. Precision
Precision measures the proportion of extracted keywords that are truly relevant (i.e., appear in the ground truth/reference list).
**Formula:** `Precision = Relevant Extracted Keywords / Total Extracted Keywords`

## 9. Recall
Recall measures the proportion of relevant keywords (from the ground truth) that were successfully extracted by the algorithm.
**Formula:** `Recall = Relevant Extracted Keywords / Total Reference Keywords`

## 10. F1 Score
The F1 score is the harmonic mean of precision and recall, providing a single balanced metric for evaluation.
**Formula:** `F1 = 2 * (Precision * Recall) / (Precision + Recall)`

## 11. Efficiency
Execution time is measured explicitly within the Python engine using standard time modules (`time.time()`). The time to execute each individual algorithm (from raw string to sorted JSON array) is returned in milliseconds (`executionTimeMs`), allowing direct comparison of computational complexity.

## 12. Benchmark Dataset
A static benchmark evaluation dataset is stored in `datasets/keyword_benchmark.json`. This version-controlled file contains explicitly labeled documents and manually defined ground-truth `referenceKeywords` required for calculating precision, recall, and F1 accurately and deterministically across algorithms.

## 13. Evaluation Procedure
1. The platform passes a string of text and a list of `referenceKeywords`.
2. The algorithms run independently and time their execution.
3. Extracted keywords are standardized (lowercased) and checked against the `referenceKeywords` array.
4. Calculations handle zero-denominators safely, returning `0.0` if no matches are found, or `None` if no reference keywords were provided.

## 14. API Endpoint
**Endpoint:** `POST /api/v1/keywords/compare`
**Payload:**
```json
{
  "text": "Machine learning models are fascinating...",
  "referenceKeywords": ["machine learning", "models"],
  "topK": 10
}
```

## 15. Example Response
```json
{
  "success": true,
  "data": {
    "text": "...",
    "methods": {
      "tfidf": {
        "candidates": [...],
        "keywords": [{ "word": "models", "score": 0.54 }],
        "precision": 0.5,
        "recall": 1.0,
        "f1": 0.6667,
        "executionTimeMs": 2.45
      },
      "rake": { ... },
      "textrank": { ... }
    }
  }
}
```

## 16. How this maps to ASTMA Unit III
- **Candidate Keywords / Keyword Scores:** Exposed explicitly in the JSON response payload.
- **Stop Lists:** Managed using robust NLP libraries (`nltk`) in `keyword_service.py`.
- **Benchmark Evaluation:** Executed via the new `/benchmark` endpoint querying the newly seeded JSON file.
- **Precision / Recall / Efficiency:** Computed in real-time, safely handling missing references to strictly test algorithmic accuracy against a known ground truth.
- **Comparison of Keyword Extraction Methods:** Demonstrated live via the new "Keyword Extraction Comparison" React frontend view, pitting TF-IDF, RAKE, and TextRank against each other in real-time.
