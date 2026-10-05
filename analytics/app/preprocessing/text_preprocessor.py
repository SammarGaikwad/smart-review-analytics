import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer, PorterStemmer

# Ensure NLTK resources are available
for resource in ['stopwords', 'punkt', 'wordnet', 'punkt_tab']:
    try:
        nltk.download(resource, quiet=True)
    except Exception as e:
        print(f"Warning downloading NLTK resource {resource}: {e}")

class TextPreprocessor:
    def __init__(self):
        try:
            self.stop_words = set(stopwords.words('english'))
        except Exception:
            self.stop_words = set()
        self.lemmatizer = WordNetLemmatizer()
        self.stemmer = PorterStemmer()

    def preprocess(
        self,
        text: str,
        lowercase: bool = True,
        remove_punctuation: bool = True,
        remove_numbers: bool = True,
        remove_stopwords: bool = True,
        lemmatize: bool = True,
        stem: bool = False
    ) -> dict:
        raw_text = text or ""
        processed = raw_text

        # 1. Lowercasing
        if lowercase:
            processed = processed.lower()

        # 2. Remove numbers
        if remove_numbers:
            processed = re.sub(r'\d+', '', processed)

        # 3. Punctuation & Special Character removal
        if remove_punctuation:
            processed = processed.translate(str.maketrans('', '', string.punctuation))
            processed = re.sub(r'[^a-zA-Z\s]', '', processed)

        # 4. Tokenization
        try:
            tokens = word_tokenize(processed) if processed.strip() else []
        except Exception:
            tokens = processed.split()

        # 5. Stop-word removal
        if remove_stopwords and self.stop_words:
            tokens = [t for t in tokens if t.lower() not in self.stop_words and len(t) > 1]

        # 6. Lemmatization
        if lemmatize:
            try:
                tokens = [self.lemmatizer.lemmatize(t) for t in tokens]
            except Exception:
                pass

        # 7. Optional Stemming
        if stem:
            try:
                tokens = [self.stemmer.stem(t) for t in tokens]
            except Exception:
                pass

        clean_text = " ".join(tokens)

        return {
            "original_text": text,
            "clean_text": clean_text,
            "tokens": tokens,
            "token_count": len(tokens),
            "character_count": len(clean_text),
            "steps_applied": {
                "lowercase": lowercase,
                "remove_punctuation": remove_punctuation,
                "remove_numbers": remove_numbers,
                "remove_stopwords": remove_stopwords,
                "lemmatize": lemmatize,
                "stem": stem
            }
        }

preprocessor = TextPreprocessor()
