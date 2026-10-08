import { Router } from "express";
import { analyzeSentiment, analyzeText, predictSentimentEndpoint, compareSentimentModelsEndpoint, getSentimentModelEvaluationEndpoint } from "../controllers/sentiment.controller";

const router = Router();

router.get("/models/evaluation", getSentimentModelEvaluationEndpoint);
router.post("/predict", predictSentimentEndpoint);
router.post("/predict/compare", compareSentimentModelsEndpoint);
router.post("/analyze-text", analyzeText);
router.post("/:reviewId/analyze", analyzeSentiment);

export default router;