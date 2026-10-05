import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createNewProduct,
  updateExistingProduct,
  deleteExistingProduct,
} from '../controllers/product.controller';
import { getReviewsByProduct } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:productId/reviews', getReviewsByProduct);
router.get('/:id', getProduct);

// Protected Mutation Routes with Authenticated User Context for Audit Trail
router.post('/', authenticate, createNewProduct);
router.put('/:id', authenticate, updateExistingProduct);
router.delete('/:id', authenticate, deleteExistingProduct);

export default router;
