import { Router } from 'express';
import {
  getRoles,
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  changeUserStatus,
  assignRole,
  removeRole,
  deleteExistingUser,
} from '../controllers/userManagement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Protect all user management endpoints with Admin RBAC
router.use(authenticate, authorizeRoles('Admin'));

// 1. Roles listing endpoint (Must precede /:id parameter)
router.get('/roles', getRoles);

// 2. Users listing & creation
router.get('/', getUsers);
router.post('/', createNewUser);

// 3. User operations
router.get('/:id', getUser);
router.put('/:id', updateExistingUser);
router.patch('/:id/status', changeUserStatus);
router.delete('/:id', deleteExistingUser);

// 4. Role assignment & removal operations
router.post('/:id/roles', assignRole);
router.delete('/:id/roles/:roleId', removeRole);

export default router;
