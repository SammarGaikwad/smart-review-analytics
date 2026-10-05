import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export const getAllReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('[Get All Reviews Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews',
    });
  }
};

export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('[Get Review By ID Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve review',
    });
  }
};

export const getReviewsByProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const result = await reviewService.getReviewsByProduct(productId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      count: result.reviews.length,
      data: result.reviews,
    });
  } catch (error) {
    console.error('[Get Reviews By Product Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews for product',
    });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, domainId, productId, reviewText, rating, source, reviewDate } = req.body;

    if (!domainId || !productId || !reviewText || rating === undefined) {
      res.status(400).json({
        success: false,
        message: 'domainId, productId, reviewText, and rating are required',
      });
      return;
    }

    const result = await reviewService.createReview({
      customerId,
      domainId,
      productId,
      reviewText,
      rating: Number(rating),
      source,
      reviewDate,
    });

    if ('error' in result) {
      if (result.error === 'RATING_OUT_OF_RANGE') {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
        return;
      }
      if (result.error === 'DOMAIN_NOT_FOUND') {
        res.status(400).json({
          success: false,
          message: 'Domain not found',
        });
        return;
      }
      if (result.error === 'PRODUCT_NOT_FOUND') {
        res.status(400).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }
      if (result.error === 'DOMAIN_PRODUCT_MISMATCH') {
        res.status(400).json({
          success: false,
          message: 'Product does not belong to the specified domain',
        });
        return;
      }
    }

    res.status(201).json({
      success: true,
      data: result.review,
    });
  } catch (error) {
    console.error('[Create Review Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
    });
  }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reviewText, rating, source, reviewDate } = req.body;

    const result = await reviewService.updateReview(id, {
      reviewText,
      rating: rating !== undefined ? Number(rating) : undefined,
      source,
      reviewDate,
    });

    if ('error' in result) {
      if (result.error === 'REVIEW_NOT_FOUND') {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }
      if (result.error === 'RATING_OUT_OF_RANGE') {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
        return;
      }
    }

    res.json({
      success: true,
      data: result.review,
    });
  } catch (error) {
    console.error('[Update Review Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
    });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await reviewService.deleteReview(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Review Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
    });
  }
};
