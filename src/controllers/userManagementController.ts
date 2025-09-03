import { Request, Response } from 'express';
import { UserManagementService } from '../services/UserManagementService';
import { Database } from '../database';
import { Op } from 'sequelize';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roleId: string;
    role: {
      name: string;
    };
    schoolId?: string;
  };
  managedRoles?: string[];
  schoolRestriction?: string;
  targetUser?: any;
}

export class UserManagementController {
  /**
   * Create a new user
   * POST /api/users
   */
  static async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userData = req.body;
      const managedRoles = req.managedRoles || [];
      const schoolRestriction = req.schoolRestriction;

      return await UserManagementService.createUser(userData, res, managedRoles, schoolRestriction);
    } catch (error) {
      console.error('Create user controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get all users (filtered by role hierarchy and school)
   * GET /api/users
   */
  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const managedRoles = req.managedRoles || [];
      const schoolRestriction = req.schoolRestriction;
      
      const {
        role,
        schoolId,
        page = '1',
        limit = '10',
        search
      } = req.query;

      const options = {
        managedRoles,
        schoolRestriction,
        role: role as string,
        schoolId: schoolId as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string
      };

      return await UserManagementService.getUsers(options, res);
    } catch (error) {
      console.error('Get users controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get a specific user by ID
   * GET /api/users/:userId
   */
  static async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      
      return await UserManagementService.getUserById(userId!, res);
    } catch (error) {
      console.error('Get user by ID controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Update a user
   * PUT /api/users/:userId
   */
  static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const managedRoles = req.managedRoles || [];
      const schoolRestriction = req.schoolRestriction;

      return await UserManagementService.updateUser(userId!, updateData, res, managedRoles, schoolRestriction);
    } catch (error) {
      console.error('Update user controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Delete a user (soft delete)
   * DELETE /api/users/:userId
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const managedRoles = req.managedRoles || [];
      const schoolRestriction = req.schoolRestriction;

      return await UserManagementService.deleteUser(userId!, res, managedRoles, schoolRestriction);
    } catch (error) {
      console.error('Delete user controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Reset user password
   * POST /api/users/:userId/reset-password
   */
  static async resetUserPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const managedRoles = req.managedRoles || [];
      const schoolRestriction = req.schoolRestriction;

      return await UserManagementService.resetUserPassword(userId!, res, managedRoles, schoolRestriction);
    } catch (error) {
      console.error('Reset user password controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get user statistics (for dashboards)
   * GET /api/users/stats
   */
  static async getUserStats(req: AuthenticatedRequest, res: Response) {
    try {
      const managedRoles = req.managedRoles || [];
      const schoolRestriction = req.schoolRestriction;

      // Build where conditions for direct database query
      const whereConditions: any = {};
      
      // Get manageable role IDs
      const roleRecords = await Database.Role.findAll({
        where: { name: { [Op.in]: managedRoles } }
      });
      const roleIds = roleRecords.map(r => r.id);
      whereConditions.roleId = { [Op.in]: roleIds };

      // School restriction for SCHOOL_MANAGER
      if (schoolRestriction) {
        whereConditions.schoolId = schoolRestriction;
      }

      // Get user counts by role
      const users = await Database.User.findAll({
        where: whereConditions,
        include: [{
          model: Database.Role,
          as: 'role',
          attributes: ['id', 'name']
        }],
        attributes: ['id', 'roleId']
      });

      const roleStats = managedRoles.reduce((acc: any, role: string) => {
        acc[role] = users.filter((user: any) => user.role.name === role).length;
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: {
          totalUsers: users.length,
          roleBreakdown: roleStats,
          managedRoles
        }
      });

    } catch (error) {
      console.error('Get user stats controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Get available roles that the current user can assign
   * GET /api/users/available-roles
   */
  static async getAvailableRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const managedRoles = req.managedRoles || [];
      const currentUser = req.user;

      return res.status(200).json({
        success: true,
        message: 'Available roles retrieved successfully',
        data: {
          availableRoles: managedRoles,
          currentUserRole: currentUser?.role.name,
          canManage: {
            'INSPECTOR': managedRoles.includes('INSPECTOR'),
            'ADMISSION_MANAGER': managedRoles.includes('ADMISSION_MANAGER')
          }
        }
      });
    } catch (error) {
      console.error('Get available roles controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  /**
   * Bulk operations (for future enhancement)
   * POST /api/users/bulk-action
   */
  static async bulkAction(req: AuthenticatedRequest, res: Response) {
    try {
      const { action, userIds } = req.body;
      
      if (!action || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Action and user IDs are required',
          data: null
        });
      }

      // For now, just return a placeholder
      return res.status(501).json({
        success: false,
        message: 'Bulk operations not implemented yet',
        data: null
      });
    } catch (error) {
      console.error('Bulk action controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }
}
