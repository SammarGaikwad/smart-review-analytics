import { Router } from 'express';
import { analyzeKeywords } from '../controllers/keyword.controller';

const router = Router();

router.post('/:reviewId/analyze', analyzeKeywords);

export default router;
