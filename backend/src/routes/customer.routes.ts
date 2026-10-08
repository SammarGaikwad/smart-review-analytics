import { Router } from 'express';
import { getInsights } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// CRM Customer Insights - Protected for Admins and Analysts
router.get('/insights', authenticate, authorizeRoles('Admin', 'Analyst'), getInsights);

export default router;
