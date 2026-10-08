import { Request, Response } from "express";
import { analyzeReviewSentiment, analyzeTextSentiment, predictSentiment, compareSentimentModels, getSentimentModelEvaluation } from "../services/sentiment.service";

export const analyzeSentiment = async (
    req: Request,
    res: Response
) => {
    try {
        const { reviewId } = req.params;

        const result = await analyzeReviewSentiment(reviewId);

        res.status(200).json({
            success: true,
            message: "Sentiment analysis completed successfully",
            data: result,
        });
    } catch (error: any) {
        console.error("Sentiment analysis error:", error);

        if (error.message === "Review not found") {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        if (error.response) {
            return res.status(503).json({
                success: false,
                message: "Analytics service is unavailable",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to analyze sentiment",
            error: error.message,
        });
    }
};

export const analyzeText = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: "Text is required" });
        const result = await analyzeTextSentiment(text);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        if (error.response) {
            return res.status(503).json({ success: false, message: "Analytics service is unavailable" });
        }
        res.status(500).json({ success: false, message: "Failed to analyze text sentiment", error: error.message });
    }
};

export const predictSentimentEndpoint = async (req: Request, res: Response) => {
    try {
        const { text, model } = req.body;
        const result = await predictSentiment(text, model);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const compareSentimentModelsEndpoint = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        const result = await compareSentimentModels(text);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getSentimentModelEvaluationEndpoint = async (req: Request, res: Response) => {
    try {
        const result = await getSentimentModelEvaluation();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};