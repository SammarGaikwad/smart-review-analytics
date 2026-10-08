import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import axios from 'axios';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'healthy';
  let analyticsStatus = 'healthy';
  let dbResponseTimeMs = 0;
  let analyticsResponseTimeMs = 0;

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbResponseTimeMs = Date.now() - dbStart;
  } catch (e) {
    dbStatus = 'unreachable';
    dbResponseTimeMs = Date.now() - dbStart;
  }

  const analyticsStart = Date.now();
  try {
    const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:8000';
    await axios.get(`${ANALYTICS_URL}/api/analytics/health`, { timeout: 2000 });
    analyticsResponseTimeMs = Date.now() - analyticsStart;
  } catch (e) {
    analyticsStatus = 'unreachable';
    analyticsResponseTimeMs = Date.now() - analyticsStart;
  }

  const overallStatus = (dbStatus === 'healthy' && analyticsStatus === 'healthy') ? 'healthy' : 'degraded';

  res.status(200).json({
    status: overallStatus,
    services: {
      backend: {
        status: 'healthy',
        uptime: process.uptime()
      },
      database: {
        status: dbStatus,
        responseTimeMs: dbResponseTimeMs
      },
      analytics: {
        status: analyticsStatus,
        responseTimeMs: analyticsResponseTimeMs
      }
    },
    system: 'Smart Review Analytics Platform',
    timestamp: new Date().toISOString()
  });
});

export default router;
