from transformers import pipeline

_sentiment = pipeline("sentiment-analysis")

def analyze_sentiment(text: str) -> dict:
    result = _sentiment(text)[0]
    return {"label": result["label"], "score": float(result["score"])}