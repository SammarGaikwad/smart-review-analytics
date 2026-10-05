from typing import List, Dict

from sklearn.feature_extraction.text import TfidfVectorizer


class KeywordService:

    def extract_keywords(
        self,
        text: str,
        top_k: int = 10
    ) -> List[Dict]:

        if not text or not text.strip():
            return []

        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]+\b"
        )

        try:
            matrix = vectorizer.fit_transform([text])
        except ValueError:
            return []

        feature_names = vectorizer.get_feature_names_out()
        scores = matrix.toarray()[0]

        keywords = [
            {
                "word": feature_names[index],
                "score": round(float(scores[index]), 4)
            }
            for index in range(len(feature_names))
            if scores[index] > 0
        ]

        keywords.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        return keywords[:top_k]


keyword_service = KeywordService()