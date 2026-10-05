import axios from "axios";
import prisma from "../config/database";

const ANALYTICS_URL =
  process.env.ANALYTICS_URL || "http://localhost:8000";

export const analyzeReviewSentiment = async (reviewId: string) => {
  // 1. Get review from PostgreSQL
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  // 2. Send review text to Python Analytics Engine
  const response = await axios.post(
    `${ANALYTICS_URL}/api/analytics/sentiment`,
    {
      text: review.reviewText,
    }
  );

  const result = response.data?.data;

  if (!result) {
    throw new Error("Invalid response from analytics service");
  }

  // 3. Save or update SentimentResult
  const sentimentResult = await prisma.sentimentResult.upsert({
    where: {
      reviewId: review.id,
    },
    update: {
      sentimentLabel:
        result.sentiment.charAt(0).toUpperCase() +
        result.sentiment.slice(1),
      sentimentScore: result.score,
      positiveProb: result.probabilities.positive,
      neutralProb: result.probabilities.neutral,
      negativeProb: result.probabilities.negative,
      analyzedAt: new Date(),
    },
    create: {
      reviewId: review.id,
      sentimentLabel:
        result.sentiment.charAt(0).toUpperCase() +
        result.sentiment.slice(1),
      sentimentScore: result.score,
      positiveProb: result.probabilities.positive,
      neutralProb: result.probabilities.neutral,
      negativeProb: result.probabilities.negative,
    },
  });

  return sentimentResult;
};