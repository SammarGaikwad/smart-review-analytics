import { Router } from 'express';
import { analyzeKeywords, compareKeywordsEndpoint, benchmarkKeywordsEndpoint } from '../controllers/keyword.controller';

const router = Router();

router.post('/compare', compareKeywordsEndpoint);
router.post('/benchmark', benchmarkKeywordsEndpoint);
router.post('/:reviewId/analyze', analyzeKeywords);

export default router;
