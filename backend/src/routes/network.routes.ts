import { Router } from 'express';
import { analyzeNetwork, getTemporalNetwork } from '../controllers/network.controller';

const router = Router();

// GET /api/analytics/network & POST /api/analytics/network
router.get('/', analyzeNetwork);
router.post('/', analyzeNetwork);
router.get('/temporal', getTemporalNetwork);

export default router;
