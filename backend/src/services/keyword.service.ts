import axios from 'axios';
import prisma from '../config/database';

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:8000';

export interface ExtractedKeywordItem {
  id: string;
  word: string;
  category: string | null;
  score: number;
}

export interface AnalyzeKeywordsResult {
  reviewId: string;
  keywords: ExtractedKeywordItem[];
}

export const analyzeReviewKeywords = async (reviewId: string): Promise<AnalyzeKeywordsResult> => {
  // 1. Get review from PostgreSQL
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // 2. Send review text to Python Analytics Engine
  const response = await axios.post(`${ANALYTICS_URL}/api/analytics/keywords`, {
    text: review.reviewText,
    top_k: 10,
  });

  const resultData = response.data?.data;

  if (!resultData || !Array.isArray(resultData.keywords)) {
    throw new Error('Invalid response from analytics service');
  }

  const rawKeywords: Array<{ word: string; score: number }> = resultData.keywords;

  // 3. Perform atomic database transaction for keyword persistence
  const persistedKeywords = await prisma.$transaction(async (tx) => {
    // Stale Keyword Handling: Delete existing ReviewKeyword relations for this review
    await tx.reviewKeyword.deleteMany({
      where: { reviewId: review.id },
    });

    const resultList: ExtractedKeywordItem[] = [];

    // Process each extracted keyword
    for (const item of rawKeywords) {
      // Upsert Keyword record (word is unique)
      const keywordRecord = await tx.keyword.upsert({
        where: { word: item.word },
        create: { word: item.word },
        update: { word: item.word },
      });

      // Upsert ReviewKeyword relation
      await tx.reviewKeyword.upsert({
        where: {
          reviewId_keywordId: {
            reviewId: review.id,
            keywordId: keywordRecord.id,
          },
        },
        create: {
          reviewId: review.id,
          keywordId: keywordRecord.id,
          score: item.score,
        },
        update: {
          score: item.score,
        },
      });

      resultList.push({
        id: keywordRecord.id,
        word: keywordRecord.word,
        category: keywordRecord.category,
        score: item.score,
      });
    }

    return resultList;
  });

  return {
    reviewId: review.id,
    keywords: persistedKeywords,
  };
};
