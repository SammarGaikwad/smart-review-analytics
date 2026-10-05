import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'backend-api',
    system: 'Smart Review Analytics Platform',
    subjectMapping: ['ES Tier-2 App Server', 'IPTM DevOps Baseline'],
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
