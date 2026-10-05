import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np


class ClusteringService:

    def perform_clustering(
        self,
        reviews: List[Dict[str, str]],
        k: int = 4
    ) -> Dict[str, Any]:

        if not reviews:
            return {
                "clusterCount": 0,
                "clusters": [],
                "assignments": []
            }

        # Extract texts and preserve review IDs
        valid_reviews = []
        for r in reviews:
            review_id = r.get("id")
            text = (r.get("text") or "").strip()
            if review_id and text:
                valid_reviews.append({"id": review_id, "text": text})

        n = len(valid_reviews)
        if n == 0:
            return {
                "clusterCount": 0,
                "clusters": [],
                "assignments": []
            }

        # Dynamically restrict k to available valid document count
        actual_k = min(max(1, k), n)

        texts = [r["text"] for r in valid_reviews]

        # TF-IDF Vectorization
        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]+\b"
        )

        try:
            tfidf_matrix = vectorizer.fit_transform(texts)
            feature_names = vectorizer.get_feature_names_out()
        except ValueError:
            # Fallback if text contains only stopwords or short non-alphabetic words
            feature_names = np.array([])
            tfidf_matrix = None

        if tfidf_matrix is None or len(feature_names) == 0:
            # Fallback single cluster assignment if no TF-IDF features found
            assignments = [{"reviewId": r["id"], "clusterNumber": 0} for r in valid_reviews]
            clusters = [{
                "clusterNumber": 0,
                "size": n,
                "topTerms": []
            }]
            return {
                "clusterCount": 1,
                "clusters": clusters,
                "assignments": assignments
            }

        # If actual_k == 1, assign all to cluster 0
        if actual_k == 1:
            assignments = [{"reviewId": r["id"], "clusterNumber": 0} for r in valid_reviews]

            # Calculate average TF-IDF scores
            avg_scores = np.asarray(tfidf_matrix.mean(axis=0)).ravel()
            top_indices = avg_scores.argsort()[::-1][:5]
            top_terms = [feature_names[idx] for idx in top_indices if avg_scores[idx] > 0]

            clusters = [{
                "clusterNumber": 0,
                "size": n,
                "topTerms": top_terms
            }]

            return {
                "clusterCount": 1,
                "clusters": clusters,
                "assignments": assignments
            }

        # K-Means Clustering
        kmeans = KMeans(n_clusters=actual_k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(tfidf_matrix)

        # Build assignments list
        assignments = []
        cluster_sizes = {i: 0 for i in range(actual_k)}
        for idx, r in enumerate(valid_reviews):
            cluster_num = int(labels[idx])
            cluster_sizes[cluster_num] += 1
            assignments.append({
                "reviewId": r["id"],
                "clusterNumber": cluster_num
            })

        # Calculate representative top terms per cluster
        clusters = []
        cluster_centers = kmeans.cluster_centers_

        for i in range(actual_k):
            center = cluster_centers[i]
            top_indices = center.argsort()[::-1][:5]
            top_terms = [feature_names[idx] for idx in top_indices if center[idx] > 0]

            clusters.append({
                "clusterNumber": i,
                "size": cluster_sizes[i],
                "topTerms": top_terms
            })

        return {
            "clusterCount": actual_k,
            "clusters": clusters,
            "assignments": assignments
        }


clustering_service = ClusteringService()
