import axios from 'axios';
import prisma from '../config/database';

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:8000';

export interface ClusterInfoItem {
  clusterNumber: number;
  size: number;
  topTerms: string[];
  name?: string;
  description?: string;
}

export interface ReviewClusterAssignment {
  reviewId: string;
  clusterNumber: number;
}

export interface PerformClusteringResult {
  clusterCount: number;
  clusters: ClusterInfoItem[];
  assignments: ReviewClusterAssignment[];
}

export const performReviewClustering = async (k: number = 4): Promise<PerformClusteringResult> => {
  // 1. Fetch reviews from PostgreSQL using Prisma
  const reviews = await prisma.review.findMany({
    select: {
      id: true,
      reviewText: true,
    },
  });

  if (!reviews || reviews.length === 0) {
    throw new Error('No reviews available for clustering');
  }

  const formattedReviews = reviews.map((r) => ({
    id: r.id,
    text: r.reviewText,
  }));

  // 2. Send review texts to Python Analytics Engine
  const response = await axios.post(`${ANALYTICS_URL}/api/analytics/clustering`, {
    reviews: formattedReviews,
    k,
  });

  const resultData = response.data?.data;

  if (!resultData || !Array.isArray(resultData.clusters) || !Array.isArray(resultData.assignments)) {
    throw new Error('Invalid response from clustering analytics service');
  }

  // 3. Match and update database Cluster aggregate records using Prisma transaction
  const updatedClusters = await prisma.$transaction(async (tx) => {
    // Fetch pre-seeded cluster profiles
    const dbClusters = await tx.cluster.findMany({
      orderBy: { clusterNumber: 'asc' },
    });

    const clustersWithMetadata: ClusterInfoItem[] = [];

    for (const c of resultData.clusters as ClusterInfoItem[]) {
      // Find matching DB cluster profile by index or clusterNumber
      const matchingDbCluster = dbClusters.find(
        (dbc) => dbc.clusterNumber === c.clusterNumber + 1 || dbc.clusterNumber === c.clusterNumber
      );

      if (matchingDbCluster) {
        // Update review count in database
        await tx.cluster.update({
          where: { id: matchingDbCluster.id },
          data: {
            reviewCount: c.size,
          },
        });

        clustersWithMetadata.push({
          ...c,
          name: matchingDbCluster.name,
          description: matchingDbCluster.description || undefined,
        });
      } else {
        clustersWithMetadata.push(c);
      }
    }

    return clustersWithMetadata;
  });

  return {
    clusterCount: resultData.clusterCount,
    clusters: updatedClusters,
    assignments: resultData.assignments,
  };
};
