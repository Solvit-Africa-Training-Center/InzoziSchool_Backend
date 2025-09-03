import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../utils/response';
import { Database } from '../database';

// InzoziSchool Role Hierarchy:
// SYSTEM_ADMIN -> manages INSPECTOR
// SCHOOL_MANAGER -> manages ADMISSION_MANAGER

const ROLE_HIERARCHY = {
  'SYSTEM_ADMIN': ['INSPECTOR'],
  'SCHOOL_MANAGER': ['ADMISSION_MANAGER']
};

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roleId: string;
    role: {
      name: string;
    };
    schoolId?: string;
  };
}

export const checkUserManagementPermission = (requiredPermission: 'create' | 'read' | 'update' | 'delete') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      
      if (!currentUser) {
        return ResponseService({
          status: 401,
          success: false,
          message: 'Authentication required',
          data: null,
          res
        });
      }

      const currentUserRole = currentUser.role.name;
      
      // SYSTEM_ADMIN has full access to manage INSPECTORs
      if (currentUserRole === 'SYSTEM_ADMIN') {
        req.managedRoles = ROLE_HIERARCHY['SYSTEM_ADMIN'];
        return next();
      }
      
      // SCHOOL_MANAGER can manage ADMISSION_MANAGERs within their school
      if (currentUserRole === 'SCHOOL_MANAGER') {
        req.managedRoles = ROLE_HIERARCHY['SCHOOL_MANAGER'];
        if (currentUser.schoolId) {
          req.schoolRestriction = currentUser.schoolId;
        }
        return next();
      }
      
      // Other roles don't have user management permissions
      return ResponseService({
        status: 403,
        success: false,
        message: 'Insufficient permissions for user management',
        data: null,
        res
      });
      
    } catch (error) {
      console.error('Role hierarchy middleware error:', error);
      return ResponseService({
        status: 500,
        success: false,
        message: 'Server error',
        data: null,
        res
      });
    }
  };
};

export const validateManagedUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;
    const managedRoles = req.managedRoles || [];
    const schoolRestriction = req.schoolRestriction;
    
    if (!userId) {
      return ResponseService({
        status: 400,
        success: false,
        message: 'User ID is required',
        data: null,
        res
      });
    }

    // Find the target user
    const targetUser = await Database.User.findOne({
      where: { id: userId },
      include: [
        {
          model: Database.Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!targetUser) {
      return ResponseService({
        status: 404,
        success: false,
        message: 'User not found',
        data: null,
        res
      });
    }

    const targetUserRole = (targetUser as any).role.name;
    
    // Check if current user can manage target user's role
    if (!managedRoles.includes(targetUserRole)) {
      return ResponseService({
        status: 403,
        success: false,
        message: `You are not authorized to manage ${targetUserRole} users`,
        data: null,
        res
      });
    }
    
    // Check school restriction for SCHOOL_MANAGER
    if (schoolRestriction && targetUser.schoolId !== schoolRestriction) {
      return ResponseService({
        status: 403,
        success: false,
        message: 'You can only manage users within your school',
        data: null,
        res
      });
    }

    // Store target user for use in controller
    req.targetUser = targetUser;
    next();
    
  } catch (error) {
    console.error('Validate managed user error:', error);
    return ResponseService({
      status: 500,
      success: false,
      message: 'Server error',
      data: null,
      res
    });
  }
};

export const validateCreateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.body;
    const managedRoles = req.managedRoles || [];
    
    // Find the role being assigned
    const role = await Database.Role.findByPk(roleId);
    
    if (!role) {
      return ResponseService({
        status: 400,
        success: false,
        message: 'Invalid role specified',
        data: null,
        res
      });
    }

    // Check if current user can assign this role
    if (!managedRoles.includes(role.name)) {
      return ResponseService({
        status: 403,
        success: false,
        message: `You are not authorized to create ${role.name} users`,
        data: null,
        res
      });
    }

    // For SCHOOL_MANAGER, ensure schoolId is provided and matches their school
    if (req.user?.role.name === 'SCHOOL_MANAGER') {
      const { schoolId } = req.body;
      
      if (role.name === 'ADMISSION_MANAGER') {
        if (!schoolId) {
          return ResponseService({
            status: 400,
            success: false,
            message: 'School ID is required when creating ADMISSION_MANAGER',
            data: null,
            res
          });
        }
        
        if (schoolId !== req.user.schoolId) {
          return ResponseService({
            status: 403,
            success: false,
            message: 'You can only create users for your school',
            data: null,
            res
          });
        }
      }
    }

    next();
    
  } catch (error) {
    console.error('Validate create user role error:', error);
    return ResponseService({
      status: 500,
      success: false,
      message: 'Server error',
      data: null,
      res
    });
  }
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      managedRoles?: string[];
      schoolRestriction?: string;
      targetUser?: any;
    }
  }
}
