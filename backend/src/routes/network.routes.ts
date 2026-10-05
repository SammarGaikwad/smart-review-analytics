import { Router } from 'express';
import { analyzeNetwork } from '../controllers/network.controller';

const router = Router();

// GET /api/analytics/network & POST /api/analytics/network
router.get('/', analyzeNetwork);
router.post('/', analyzeNetwork);

export default router;
