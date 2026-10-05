import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// GET /api/audit-logs - Protected (Admin only)
router.get('/', authenticate, authorizeRoles('Admin'), getAuditLogs);

export default router;
