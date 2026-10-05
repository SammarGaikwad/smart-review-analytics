import re
from typing import List, Dict


class TopicService:

    def __init__(self):
        # Predefined business topic taxonomy and keyword mappings
        self.topic_keywords: Dict[str, Dict[str, float]] = {
            "Battery": {
                "battery": 2.5,
                "charge": 2.0,
                "charging": 2.0,
                "drain": 2.5,
                "drains": 2.5,
                "draining": 2.0,
                "power": 1.5,
                "backup": 2.0,
                "runtime": 2.0,
                "life": 1.5,
                "mah": 2.0,
            },
            "Quality": {
                "quality": 2.5,
                "build": 2.0,
                "durable": 2.0,
                "durability": 2.0,
                "material": 1.5,
                "defective": 2.5,
                "performance": 2.0,
                "ergonomic": 2.0,
                "chair": 1.5,
                "seat": 1.5,
                "audio": 2.0,
                "sound": 2.0,
                "speaker": 1.5,
                "screen": 1.5,
                "display": 1.5,
                "assembly": 1.5,
            },
            "Service": {
                "service": 2.5,
                "staff": 2.5,
                "support": 2.0,
                "customer": 1.5,
                "hospitality": 2.5,
                "response": 2.0,
                "helpful": 2.0,
                "unhelpful": 2.5,
                "rude": 2.5,
                "courteous": 2.0,
                "desk": 1.5,
                "reception": 2.0,
                "waiter": 2.0,
            },
            "Price": {
                "price": 2.5,
                "cost": 2.0,
                "expensive": 2.5,
                "cheap": 2.0,
                "value": 2.5,
                "worth": 2.0,
                "money": 2.0,
                "affordable": 2.0,
                "budget": 1.5,
                "pricing": 2.0,
                "overpriced": 2.5,
            },
            "Delivery": {
                "delivery": 2.5,
                "shipping": 2.5,
                "arrived": 2.0,
                "arrival": 2.0,
                "package": 2.0,
                "parcel": 2.0,
                "dispatch": 2.0,
                "fast": 1.5,
                "quick": 1.5,
                "delivered": 2.0,
                "courier": 2.0,
                "assembly": 1.5,
            },
            "Cleanliness": {
                "clean": 2.5,
                "cleanliness": 2.5,
                "hygiene": 2.5,
                "dirty": 2.5,
                "room": 1.5,
                "sanitary": 2.0,
                "spotless": 2.5,
                "filthy": 2.5,
                "neat": 2.0,
                "tidy": 2.0,
                "dusty": 2.0,
            }
        }

    def predict_topics(self, text: str, top_k: int = 5) -> List[Dict]:
        if not text or not text.strip():
            return []

        # Tokenize and clean text
        words = [w.lower() for w in re.findall(r"\b[a-zA-Z]+\b", text)]
        if not words:
            return []

        topic_scores: Dict[str, float] = {}

        # Calculate raw relevance score per topic
        for topic_name, keywords_map in self.topic_keywords.items():
            score = 0.0
            for word in words:
                if word in keywords_map:
                    score += keywords_map[word]

            if score > 0:
                topic_scores[topic_name] = score

        if not topic_scores:
            return []

        total_score = sum(topic_scores.values())

        # Normalize scores into probabilities
        results = []
        for topic_name, score in topic_scores.items():
            prob = round(score / total_score, 4)
            results.append({
                "topic": topic_name,
                "probability": prob
            })

        # Sort by probability descending
        results.sort(key=lambda item: item["probability"], reverse=True)

        return results[:top_k]


topic_service = TopicService()
