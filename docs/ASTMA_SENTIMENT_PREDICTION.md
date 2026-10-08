# ASTMA Sentiment Prediction Enhancement

## 1. Objective
This document details the ASTMA Unit II enhancement covering Simple Predictive Modeling and Sentiment Analysis. It establishes two parallel paradigms for sentiment classification: the pre-existing Lexicon-based (VADER) approach, and a newly implemented Machine-Learning (ML) prediction framework using scikit-learn.

## 2. Existing Lexicon-based Sentiment Analysis
The system already relies on NLTK's VADER (Valence Aware Dictionary and sEntiment Reasoner). VADER uses a combination of a sentiment lexicon (a list of lexical features labeled according to their semantic orientation) and grammatical rules to calculate a compound polarity score between -1 and 1. This rule-based analysis accurately infers positive, negative, and neutral sentiment without requiring a dedicated training phase.

## 3. Machine-Learning Sentiment Prediction
To satisfy the Simple Predictive Modeling requirement, we introduced an independent Machine Learning-based classification engine. Two distinct predictive algorithms were implemented and exposed for comparison:
1. **Naive Bayes (MultinomialNB)**
2. **Support Vector Machine (LinearSVC)**

These models are instantiated directly into the memory of the Python FastAPI analytics service and evaluate texts securely against a defined labeled dataset.

## 4. Dataset
A curated academic training dataset was created in `datasets/sentiment_training.json`. It is a small dataset comprising clearly labeled positive, negative, and neutral text examples. Due to its limited size, it serves as a strict academic demonstration of model mechanics rather than an enterprise-scale training corpus.

## 5. Preprocessing
Text preprocessing utilizes standard NLP mechanisms (lowercasing, English stopword removal via `TfidfVectorizer`). The existing custom logic removes unwanted linguistic noise prior to algorithmic evaluation.

## 6. TF-IDF
Term Frequency-Inverse Document Frequency (TF-IDF) is used to map raw text into normalized numerical feature vectors. It scales word frequency relative to their rarity across the labeled training corpus, acting as the primary input feature matrix for both Naive Bayes and SVM pipelines.

## 7. Naive Bayes
**Multinomial Naive Bayes** is a probabilistic classifier based on applying Bayes' theorem with strong (naive) independence assumptions between features.
Because it inherently outputs probabilistic metrics, this algorithm legitimately produces class probabilities (`predict_proba`) when evaluating a review.

## 8. SVM
**Linear Support Vector Machine (LinearSVC)** operates by finding the hyperplane that maximally separates the data classes in the multi-dimensional TF-IDF feature space.
SVM is non-probabilistic. Instead of probabilities, it outputs a "decision score" (via `decision_function`) representing the distance to the separating hyperplane. The implementation correctly reflects this distinction and does not incorrectly advertise decision scores as probabilities.

## 9. Training/Testing Split
We utilize `sklearn.model_selection.train_test_split` configured dynamically to a typical 80/20 train/test split. A `random_state=42` is fixed to ensure absolute reproducibility. If sample distribution allows, stratification is applied to ensure balanced testing.

## 10. Accuracy
Accuracy reflects the proportion of completely correct classifications across the test split. 

## 11. Precision
Precision measures exactness (True Positives / (True Positives + False Positives)). The calculation uses the `weighted` average parameter to safely scale across our multi-class evaluation.

## 12. Recall
Recall measures completeness (True Positives / (True Positives + False Negatives)). Similar to precision, it operates using a weighted average.

## 13. F1-Score
F1 provides the harmonic mean of precision and recall.

## 14. Confusion Matrix
Confusion matrices explicitly tabulate the intersection of True Labels vs. Predicted Labels, proving the performance distribution across "Positive", "Neutral", and "Negative". The matrix is seamlessly passed back through the API and dynamically mapped into the frontend UI.

## 15. Model Comparison
The frontend (`AnalyticsPage.tsx`) implements a consolidated view enabling end-users to compare predictive endpoints instantly:
- Lexicon / VADER output
- Naive Bayes output
- SVM output

Additionally, the UI presents the hard statistical metrics (Accuracy, Precision, Recall, F1) calculated during the Python API initialization phase.

## 16. Single-Review Prediction
The API allows on-the-fly predictions using specific routes:
- `POST /api/analytics/sentiment/predict`: Target an individual model ('naive_bayes' or 'svm').
- `POST /api/analytics/sentiment/predict/compare`: Automatically trigger Lexicon, NB, and SVM asynchronously.

## 17. Limitations
- **Dataset Scale**: The training matrix is extremely restricted in scale. Accuracy representations may fluctuate wildly depending heavily on training stratification randomness and limited class populations.
- **Lexicon Independence**: The VADER algorithm does not leverage the ML dataset; thus, attempting direct benchmark equivalency against VADER requires independent ground truths.

## 18. ASTMA Unit II Mapping
- **Content Analysis**: Extracted explicitly via text submission.
- **Natural Language Processing**: Preprocessing pipeline tokenizing textual inputs.
- **Clustering & Topic Detection**: Pre-existing functionality mapped elsewhere.
- **Simple Predictive Modeling**: Represented thoroughly via Naive Bayes and SVM Pipelines.
- **Sentiment Analysis**: Provided by the Lexicon approach.
- **Sentiment Prediction**: Provided by ML prediction arrays and evaluation endpoints.
