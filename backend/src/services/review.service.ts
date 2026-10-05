import prisma from '../config/database';

export const getAllReviews = async () => {
  return await prisma.review.findMany({
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      sentimentResult: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getReviewById = async (id: string) => {
  return await prisma.review.findUnique({
    where: { id },
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
        },
      },
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      sentimentResult: true,
      reviewKeywords: {
        include: {
          keyword: true,
        },
      },
      reviewTopics: {
        include: {
          topic: true,
        },
      },
    },
  });
};

export const getReviewsByProduct = async (productId: string) => {
  const productExists = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!productExists) {
    return null;
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      sentimentResult: true,
    },
    orderBy: {
      reviewDate: 'desc',
    },
  });

  return {
    product: productExists,
    reviews,
  };
};

export const createReview = async (data: {
  customerId?: string;
  domainId: string;
  productId: string;
  reviewText: string;
  rating: number;
  source?: string;
  reviewDate?: string | Date;
}) => {
  // 1. Validate rating range (1.0 to 5.0)
  if (typeof data.rating !== 'number' || data.rating < 1.0 || data.rating > 5.0) {
    return { error: 'RATING_OUT_OF_RANGE' };
  }

  // 2. Verify domain exists
  const domainExists = await prisma.domain.findUnique({
    where: { id: data.domainId },
  });
  if (!domainExists) {
    return { error: 'DOMAIN_NOT_FOUND' };
  }

  // 3. Verify product exists
  const productExists = await prisma.product.findUnique({
    where: { id: data.productId },
  });
  if (!productExists) {
    return { error: 'PRODUCT_NOT_FOUND' };
  }

  // 4. Verify product belongs to domain
  if (productExists.domainId !== data.domainId) {
    return { error: 'DOMAIN_PRODUCT_MISMATCH' };
  }

  // 5. Create review record
  const review = await prisma.review.create({
    data: {
      customerId: data.customerId || null,
      domainId: data.domainId,
      productId: data.productId,
      reviewText: data.reviewText,
      rating: data.rating,
      source: data.source || 'manual',
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : new Date(),
    },
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return { review };
};

export const updateReview = async (
  id: string,
  data: {
    reviewText?: string;
    rating?: number;
    source?: string;
    reviewDate?: string | Date;
  }
) => {
  const existingReview = await prisma.review.findUnique({
    where: { id },
  });

  if (!existingReview) {
    return { error: 'REVIEW_NOT_FOUND' };
  }

  if (data.rating !== undefined) {
    if (typeof data.rating !== 'number' || data.rating < 1.0 || data.rating > 5.0) {
      return { error: 'RATING_OUT_OF_RANGE' };
    }
  }

  const updateData: {
    reviewText?: string;
    rating?: number;
    source?: string;
    reviewDate?: Date;
  } = {};

  if (data.reviewText !== undefined) updateData.reviewText = data.reviewText;
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.reviewDate !== undefined) updateData.reviewDate = new Date(data.reviewDate);

  const review = await prisma.review.update({
    where: { id },
    data: updateData,
    include: {
      domain: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      sentimentResult: true,
    },
  });

  return { review };
};

export const deleteReview = async (id: string) => {
  const existingReview = await prisma.review.findUnique({
    where: { id },
  });

  if (!existingReview) {
    return false;
  }

  await prisma.review.delete({
    where: { id },
  });

  return true;
};
