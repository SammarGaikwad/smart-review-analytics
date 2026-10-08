import prisma from '../config/database';

export const getCustomerInsights = async () => {
  // Fetch users who are customers (has reviews or role is CUSTOMER)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          createdAt: true,
          productId: true,
          domainId: true,
          sentimentResult: {
            select: {
              sentimentLabel: true
            }
          }
        }
      }
    }
  });

  const insights = users.filter(u => u.reviews.length > 0).map(user => {
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    
    let totalRating = 0;
    const products = new Set<string>();
    const domains = new Set<string>();
    
    let lastReviewDate: Date | null = null;

    user.reviews.forEach(r => {
      totalRating += r.rating;
      if (r.productId) products.add(r.productId);
      if (r.domainId) domains.add(r.domainId);
      
      if (!lastReviewDate || r.createdAt > lastReviewDate) {
        lastReviewDate = r.createdAt;
      }

      if (r.sentimentResult) {
        const label = r.sentimentResult.sentimentLabel.toLowerCase();
        if (label === 'positive') positiveCount++;
        else if (label === 'negative') negativeCount++;
        else neutralCount++;
      }
    });

    const averageRating = user.reviews.length > 0 ? (totalRating / user.reviews.length) : 0;

    return {
      customerId: user.id,
      customerName: user.fullName || user.email.split('@')[0],
      reviewCount: user.reviews.length,
      averageRating: Number(averageRating.toFixed(2)),
      positiveCount,
      neutralCount,
      negativeCount,
      productsReviewed: products.size,
      domainsReviewed: domains.size,
      lastReviewDate
    };
  });

  // Sort by review count descending
  insights.sort((a, b) => b.reviewCount - a.reviewCount);

  return insights;
};
