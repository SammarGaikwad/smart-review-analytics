import { Request, Response } from "express";
import { analyzeReviewSentiment } from "../services/sentiment.service";

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