import { Router } from 'express';
import { getWebAnalyticsHandler } from '../controllers/webAnalytics.controller';

const router = Router();

router.get('/web', getWebAnalyticsHandler);

export default router;
