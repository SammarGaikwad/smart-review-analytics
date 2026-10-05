import { Router } from 'express';
import { recordActivityHandler } from '../controllers/activity.controller';

const router = Router();

router.post('/activity', recordActivityHandler);

export default router;
