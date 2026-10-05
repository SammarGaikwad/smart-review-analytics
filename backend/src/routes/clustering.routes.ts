import { Router } from 'express';
import { analyzeClustering } from '../controllers/clustering.controller';

const router = Router();

router.post('/analyze', analyzeClustering);

export default router;
