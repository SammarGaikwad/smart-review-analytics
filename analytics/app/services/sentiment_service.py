import re
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Download VADER lexicon if it is not already available
try:
    nltk.download("vader_lexicon", quiet=True)
except Exception as e:
    print(f"Warning downloading vader_lexicon: {e}")


class SentimentService:

    def __init__(self):
        try:
            self.sia = SentimentIntensityAnalyzer()

            # Domain-specific review sentiment terms
            custom_lexicon = {
                "drains": -2.5,
                "drain": -2.0,
                "draining": -2.0,
                "lag": -2.0,
                "laggy": -2.0,
                "defective": -3.0,
                "broken": -3.0,
                "dirty": -2.5,
                "filthy": -3.0,
                "unhelpful": -2.5,
                "rude": -2.5,

                "clean": 2.0,
                "cleanliness": 2.5,
                "spotless": 2.5,
                "comfortable": 2.0,
                "ergonomic": 2.0,
                "helpful": 2.0,
                "outstanding": 3.0,
                "fast": 1.5,
                "easy": 1.5,
            }

            self.sia.lexicon.update(custom_lexicon)

        except Exception as e:
            print(f"VADER initialization warning: {e}")
            self.sia = None

    def analyze_sentiment(self, text: str) -> dict:

        # Empty input
        if not text or not text.strip():
            return {
                "text": text,
                "sentiment": "neutral",
                "score": 0.0,
                "confidence": 0.0,
                "probabilities": {
                    "positive": 0.0,
                    "neutral": 1.0,
                    "negative": 0.0
                }
            }

        # VADER analysis
        if self.sia:

            # Handle contrastive sentences such as:
            # "Excellent audio but battery drains quickly."
            if re.search(
                r"\b(but|however|although|except)\b",
                text,
                flags=re.IGNORECASE
            ):

                parts = re.split(
                    r"\b(but|however|overall|although|except)\b",
                    text,
                    flags=re.IGNORECASE
                )

                if len(parts) >= 3:

                    pre_text = parts[0]
                    post_text = "".join(parts[2:])

                    pre_scores = self.sia.polarity_scores(pre_text)
                    post_scores = self.sia.polarity_scores(post_text)

                    # Give more importance to the clause after "but"
                    compound = (
                        post_scores["compound"] * 0.70
                        + pre_scores["compound"] * 0.30
                    )

                    pos_prob = (
                        post_scores["pos"] * 0.70
                        + pre_scores["pos"] * 0.30
                    )

                    neg_prob = (
                        post_scores["neg"] * 0.70
                        + pre_scores["neg"] * 0.30
                    )

                    neu_prob = max(
                        0.0,
                        1.0 - (pos_prob + neg_prob)
                    )

                else:
                    scores = self.sia.polarity_scores(text)

                    compound = scores["compound"]
                    pos_prob = scores["pos"]
                    neu_prob = scores["neu"]
                    neg_prob = scores["neg"]

            else:

                scores = self.sia.polarity_scores(text)

                compound = scores["compound"]
                pos_prob = scores["pos"]
                neu_prob = scores["neu"]
                neg_prob = scores["neg"]

        else:
            # Simple fallback if VADER cannot initialize
            words = text.lower().split()

            positive_words = {
                "good",
                "great",
                "excellent",
                "outstanding",
                "clean",
                "helpful",
                "fast",
                "easy",
                "love",
                "like",
                "best",
                "wonderful",
                "comfortable",
                "ergonomic"
            }

            negative_words = {
                "bad",
                "terrible",
                "poor",
                "dirty",
                "slow",
                "hard",
                "drain",
                "drains",
                "worst",
                "hate",
                "broken",
                "awful",
                "lag"
            }

            pos_count = sum(
                1 for word in words
                if word.strip(".,!?;:") in positive_words
            )

            neg_count = sum(
                1 for word in words
                if word.strip(".,!?;:") in negative_words
            )

            total = len(words) or 1

            compound = (
                (pos_count - neg_count)
                / max(pos_count + neg_count, 1)
            )

            pos_prob = pos_count / total
            neg_prob = neg_count / total

            neu_prob = max(
                0.0,
                1.0 - (pos_prob + neg_prob)
            )

        # Keep values inside valid ranges
        compound = max(-1.0, min(1.0, compound))

        pos_prob = max(0.0, min(1.0, pos_prob))
        neu_prob = max(0.0, min(1.0, neu_prob))
        neg_prob = max(0.0, min(1.0, neg_prob))

        # Normalize probabilities so they add up to 1
        probability_total = pos_prob + neu_prob + neg_prob

        if probability_total > 0:
            pos_prob /= probability_total
            neu_prob /= probability_total
            neg_prob /= probability_total

        # Classification based on VADER compound score
        if compound >= 0.05:
            sentiment = "positive"

        elif compound <= -0.05:
            sentiment = "negative"

        else:
            sentiment = "neutral"

        # Confidence = probability of predicted sentiment
        if sentiment == "positive":
            confidence = pos_prob

        elif sentiment == "negative":
            confidence = neg_prob

        else:
            confidence = neu_prob

        return {
            "text": text,
            "sentiment": sentiment,
            "score": round(compound, 4),
            "confidence": round(confidence, 4),
            "probabilities": {
                "positive": round(pos_prob, 4),
                "neutral": round(neu_prob, 4),
                "negative": round(neg_prob, 4)
            }
        }


sentiment_service = SentimentService()