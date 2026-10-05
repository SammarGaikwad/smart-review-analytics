import { Request, Response } from 'express';
import * as userService from '../services/userManagement.service';
import { createAuditLog } from '../services/audit.service';

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await userService.getAllRoles();
    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    console.error('[Get Roles Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve roles',
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, role } = req.query;

    const options = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search ? String(search) : undefined,
      role: role ? String(role) : undefined,
    };

    const result = await userService.getUsers(options);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Get Users Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('[Get User Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
    });
  }
};

export const createNewUser = async (req: Request, res: Response) => {
  try {
    const { email, fullName, name, password, role, roleId, roleName } = req.body;
    const userFullName = fullName || name;
    const targetRole = role || roleName;

    if (!email || !userFullName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, fullName/name, and password are required',
      });
    }

    const result = await userService.createUser({
      email,
      fullName: userFullName,
      password,
      roleName: targetRole,
      roleId,
    });

    if ('error' in result) {
      if (result.error === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered',
        });
      }
      if (result.error === 'INVALID_ROLE') {
        return res.status(400).json({
          success: false,
          message: 'Specified role does not exist',
        });
      }
    }

    // Record audit event
    await createAuditLog({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: 'CREATE',
      resource: 'User',
      ipAddress: req.ip || null,
      status: 'SUCCESS',
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: (result as any).user,
    });
  } catch (error: any) {
    console.error('[Create User Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

export const updateExistingUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, fullName, name, password, isActive } = req.body;

    const result = await userService.updateUser(id, {
      email,
      fullName: fullName || name,
      password,
      isActive,
    });

    if ('error' in result) {
      if (result.error === 'USER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      if (result.error === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered by another account',
        });
      }
    }

    // Record audit event
    await createAuditLog({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: 'UPDATE',
      resource: 'User',
      ipAddress: req.ip || null,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: (result as any).user,
    });
  } catch (error: any) {
    console.error('[Update User Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

export const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive boolean field is required',
      });
    }

    if (req.user?.id === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account',
      });
    }

    const result = await userService.updateUser(id, { isActive });

    if ('error' in result && result.error === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Record audit event
    await createAuditLog({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: 'UPDATE',
      resource: 'User',
      ipAddress: req.ip || null,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      message: `User status changed to ${isActive ? 'active' : 'inactive'}`,
      data: (result as any).user,
    });
  } catch (error: any) {
    console.error('[Change Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

export const assignRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, roleId, roleName } = req.body;
    const targetRole = role || roleId || roleName;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name or roleId is required',
      });
    }

    const result = await userService.assignUserRole(id, targetRole);

    if ('error' in result) {
      if (result.error === 'USER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      if (result.error === 'INVALID_ROLE') {
        return res.status(400).json({
          success: false,
          message: 'Specified role does not exist',
        });
      }
    }

    // Record audit event
    await createAuditLog({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: 'CREATE',
      resource: 'UserRole',
      ipAddress: req.ip || null,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      message: result.alreadyAssigned ? 'Role is already assigned to user' : 'Role assigned successfully',
      data: result.user,
    });
  } catch (error: any) {
    console.error('[Assign Role Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign role',
    });
  }
};

export const removeRole = async (req: Request, res: Response) => {
  try {
    const { id, roleId } = req.params;

    const result = await userService.removeUserRole(id, roleId);

    if ('error' in result) {
      if (result.error === 'USER_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      if (result.error === 'INVALID_ROLE' || result.error === 'ROLE_ASSIGNMENT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Role assignment not found for user',
        });
      }
      if (result.error === 'LAST_ADMIN_PROTECTION') {
        return res.status(400).json({
          success: false,
          message: 'At least one administrator must remain in the system',
        });
      }
    }

    // Record audit event
    await createAuditLog({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: 'DELETE',
      resource: 'UserRole',
      ipAddress: req.ip || null,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      message: 'Role removed successfully',
      data: (result as any).user,
    });
  } catch (error: any) {
    console.error('[Remove Role Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove role',
    });
  }
};

export const deleteExistingUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account',
      });
    }

    const result = await userService.deleteUser(id);

    if (result === false) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (typeof result === 'object' && result.error === 'LAST_ADMIN_PROTECTION') {
      return res.status(400).json({
        success: false,
        message: 'At least one administrator must remain in the system',
      });
    }

    // Record audit event
    await createAuditLog({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: 'DELETE',
      resource: 'User',
      ipAddress: req.ip || null,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('[Delete User Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};
