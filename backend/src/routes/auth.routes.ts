import { Router } from 'express';
import { login, getMe, testAuth, testAdminAuth } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Public Routes
router.post('/login', login);

// Authenticated Routes
router.get('/me', authenticate, getMe);
router.get('/test', authenticate, testAuth);

// Role-Protected Routes (RBAC)
router.get('/admin-test', authenticate, authorizeRoles('Admin'), testAdminAuth);

export default router;
