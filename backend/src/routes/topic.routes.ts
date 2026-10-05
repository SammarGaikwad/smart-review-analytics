import { Router } from 'express';
import { analyzeTopics } from '../controllers/topic.controller';

const router = Router();

router.post('/:reviewId/analyze', analyzeTopics);

export default router;
