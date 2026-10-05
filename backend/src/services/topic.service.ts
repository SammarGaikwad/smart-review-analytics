import axios from 'axios';
import prisma from '../config/database';

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:8000';

export interface ExtractedTopicItem {
  id: string;
  name: string;
  description: string | null;
  probability: number;
}

export interface AnalyzeTopicsResult {
  reviewId: string;
  topics: ExtractedTopicItem[];
}

export const analyzeReviewTopics = async (reviewId: string): Promise<AnalyzeTopicsResult> => {
  // 1. Get review from PostgreSQL
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // 2. Send review text to Python Analytics Engine
  const response = await axios.post(`${ANALYTICS_URL}/api/analytics/topics`, {
    text: review.reviewText,
    top_k: 6,
  });

  const resultData = response.data?.data;

  if (!resultData || !Array.isArray(resultData.topics)) {
    throw new Error('Invalid response from analytics service');
  }

  const rawTopics: Array<{ topic: string; probability: number }> = resultData.topics;

  // 3. Atomic database transaction for topic persistence
  const persistedTopics = await prisma.$transaction(async (tx) => {
    // Delete existing ReviewTopic relations for this review
    await tx.reviewTopic.deleteMany({
      where: { reviewId: review.id },
    });

    const resultList: ExtractedTopicItem[] = [];

    // Process each predicted topic
    for (const item of rawTopics) {
      // Find existing Topic record by name (do not create new topics automatically)
      const topicRecord = await tx.topic.findUnique({
        where: { name: item.topic },
      });

      if (!topicRecord) {
        // Skip unknown topics if not found in database taxonomy
        continue;
      }

      // Upsert ReviewTopic relation
      await tx.reviewTopic.upsert({
        where: {
          reviewId_topicId: {
            reviewId: review.id,
            topicId: topicRecord.id,
          },
        },
        create: {
          reviewId: review.id,
          topicId: topicRecord.id,
          probability: item.probability,
        },
        update: {
          probability: item.probability,
        },
      });

      resultList.push({
        id: topicRecord.id,
        name: topicRecord.name,
        description: topicRecord.description,
        probability: item.probability,
      });
    }

    return resultList;
  });

  return {
    reviewId: review.id,
    topics: persistedTopics,
  };
};
