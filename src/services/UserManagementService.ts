import { Response } from 'express';
import { Database } from '../database';
import { ResponseService } from '../utils/response';
import { hashPassword } from '../utils/helper';
import { sendMail } from '../utils/mailer';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

interface CreateUserData {
  firstName: string;
  lastName: string;
  gender: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  phone: string;
  email: string;
  roleId: string;
  schoolId?: string;
  password?: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  gender?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  phone?: string;
  email?: string;
  roleId?: string;
  schoolId?: string;
}

interface GetUsersOptions {
  managedRoles: string[];
  schoolRestriction?: string | undefined;
  role?: string;
  schoolId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export class UserManagementService {
  /**
   * Create a new user (SYSTEM_ADMIN creates INSPECTOR, SCHOOL_MANAGER creates ADMISSION_MANAGER)
   */
  static async createUser(userData: CreateUserData, res: Response, managedRoles: string[], schoolRestriction?: string | undefined) {
    try {
      // Check if email already exists
      const existingUser = await Database.User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        return ResponseService({
          status: 409,
          success: false,
          message: 'User with this email already exists',
          data: null,
          res
        });
      }

      // Get role details to validate
      const role = await Database.Role.findByPk(userData.roleId);
      if (!role) {
        return ResponseService({
          status: 400,
          success: false,
          message: 'Invalid role specified',
          data: null,
          res
        });
      }

      // Validate role hierarchy
      if (!managedRoles.includes(role.name)) {
        return ResponseService({
          status: 403,
          success: false,
          message: `You are not authorized to create ${role.name} users`,
          data: null,
          res
        });
      }

      // For SCHOOL_MANAGER creating ADMISSION_MANAGER, validate school
      if (schoolRestriction && role.name === 'ADMISSION_MANAGER') {
        if (!userData.schoolId) {
          return ResponseService({
            status: 400,
            success: false,
            message: 'School ID is required when creating ADMISSION_MANAGER',
            data: null,
            res
          });
        }

        if (userData.schoolId !== schoolRestriction) {
          return ResponseService({
            status: 403,
            success: false,
            message: 'You can only create users for your school',
            data: null,
            res
          });
        }
      }

      // Generate password if not provided
      let finalPassword = userData.password;
      if (!finalPassword) {
        finalPassword = this.generateTemporaryPassword();
      }

      // Hash the password
      const hashedPassword = await hashPassword(finalPassword);

      // Create user
      const newUser = await Database.User.create({
        id: uuidv4(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        province: userData.province,
        district: userData.district,
        sector: userData.sector,
        cell: userData.cell,
        village: userData.village,
        phone: userData.phone,
        email: userData.email,
        password: hashedPassword,
        roleId: userData.roleId,
        schoolId: userData.schoolId || null
      });

      // Load complete user data with relationships
      const createdUser = await Database.User.findByPk(newUser.id, {
        include: [
          {
            model: Database.Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: Database.School,
            as: 'school',
            attributes: ['id', 'school_name'],
            required: false
          }
        ],
        attributes: { exclude: ['password'] }
      });

      // Send welcome email with temporary credentials if password was generated
      if (!userData.password) {
        try {
          await this.sendWelcomeEmail(userData.email, userData.firstName, finalPassword, role.name);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail user creation if email fails
        }
      }

      return ResponseService({
        status: 201,
        success: true,
        message: `${role.name} user created successfully`,
        data: {
          user: createdUser,
          temporaryPassword: !userData.password ? finalPassword : undefined
        },
        res
      });

    } catch (error) {
      console.error('Create user error:', error);
      return ResponseService({
        status: 500,
        success: false,
        message: 'Failed to create user',
        data: null,
        res
      });
    }
  }

  /**
   * Get users based on role hierarchy and permissions
   */
  static async getUsers(options: GetUsersOptions, res: Response) {
    try {
      const { managedRoles, schoolRestriction, role, schoolId, page = 1, limit = 10, search } = options;

      // Build where conditions
      const whereConditions: any = {};

      // Role filter - only show roles the current user can manage
      if (role && managedRoles.includes(role)) {
        const roleRecord = await Database.Role.findOne({ where: { name: role } });
        if (roleRecord) {
          whereConditions.roleId = roleRecord.id;
        }
      } else {
        // Show all manageable roles
        const roleRecords = await Database.Role.findAll({
          where: { name: { [Op.in]: managedRoles } }
        });
        const roleIds = roleRecords.map(r => r.id);
        whereConditions.roleId = { [Op.in]: roleIds };
      }

      // School restriction for SCHOOL_MANAGER
      if (schoolRestriction) {
        whereConditions.schoolId = schoolRestriction;
      } else if (schoolId) {
        whereConditions.schoolId = schoolId;
      }

      // Search functionality
      if (search) {
        whereConditions[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Calculate pagination
      const offset = (page - 1) * limit;

      // Get users with pagination
      const { count, rows: users } = await Database.User.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Database.Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: Database.School,
            as: 'school',
            attributes: ['id', 'school_name'],
            required: false
          }
        ],
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(count / limit);

      return ResponseService({
        status: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers: count,
            usersPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        },
        res
      });

    } catch (error) {
      console.error('Get users error:', error);
      return ResponseService({
        status: 500,
        success: false,
        message: 'Failed to retrieve users',
        data: null,
        res
      });
    }
  }

  /**
   * Get a specific user by ID
   */
  static async getUserById(userId: string, res: Response) {
    try {
      const user = await Database.User.findByPk(userId, {
        include: [
          {
            model: Database.Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: Database.School,
            as: 'school',
            attributes: ['id', 'school_name'],
            required: false
          }
        ],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return ResponseService({
          status: 404,
          success: false,
          message: 'User not found',
          data: null,
          res
        });
      }

      return ResponseService({
        status: 200,
        success: true,
        message: 'User retrieved successfully',
        data: { user },
        res
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      return ResponseService({
        status: 500,
        success: false,
        message: 'Failed to retrieve user',
        data: null,
        res
      });
    }
  }

  /**
   * Update a user
   */
  static async updateUser(userId: string, updateData: UpdateUserData, res: Response, managedRoles: string[], schoolRestriction?: string | undefined) {
    try {
      const user = await Database.User.findByPk(userId, {
        include: [
          {
            model: Database.Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!user) {
        return ResponseService({
          status: 404,
          success: false,
          message: 'User not found',
          data: null,
          res
        });
      }

      // Check if current user can manage this user's role
      if (!managedRoles.includes((user as any).role.name)) {
        return ResponseService({
          status: 403,
          success: false,
          message: `You are not authorized to manage ${(user as any).role.name} users`,
          data: null,
          res
        });
      }

      // Check school restriction
      if (schoolRestriction && user.schoolId !== schoolRestriction) {
        return ResponseService({
          status: 403,
          success: false,
          message: 'You can only manage users within your school',
          data: null,
          res
        });
      }

      // Check if email is being updated and already exists
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await Database.User.findOne({
          where: { email: updateData.email }
        });
        
        if (existingUser) {
          return ResponseService({
            status: 409,
            success: false,
            message: 'User with this email already exists',
            data: null,
            res
          });
        }
      }

      // If role is being updated, validate it
      if (updateData.roleId) {
        const newRole = await Database.Role.findByPk(updateData.roleId);
        if (!newRole) {
          return ResponseService({
            status: 400,
            success: false,
            message: 'Invalid role specified',
            data: null,
            res
          });
        }

        if (!managedRoles.includes(newRole.name)) {
          return ResponseService({
            status: 403,
            success: false,
            message: `You are not authorized to assign ${newRole.name} role`,
            data: null,
            res
          });
        }
      }

      // Update user
      await user.update(updateData);

      // Get updated user with relationships
      const updatedUser = await Database.User.findByPk(userId, {
        include: [
          {
            model: Database.Role,
            as: 'role',
            attributes: ['id', 'name']
          },
          {
            model: Database.School,
            as: 'school',
            attributes: ['id', 'school_name'],
            required: false
          }
        ],
        attributes: { exclude: ['password'] }
      });

      return ResponseService({
        status: 200,
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
        res
      });

    } catch (error) {
      console.error('Update user error:', error);
      return ResponseService({
        status: 500,
        success: false,
        message: 'Failed to update user',
        data: null,
        res
      });
    }
  }

  /**
   * Delete a user (soft delete)
   */
  static async deleteUser(userId: string, res: Response, managedRoles: string[], schoolRestriction?: string | undefined) {
    try {
      const user = await Database.User.findByPk(userId, {
        include: [
          {
            model: Database.Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!user) {
        return ResponseService({
          status: 404,
          success: false,
          message: 'User not found',
          data: null,
          res
        });
      }

      // Check permissions
      if (!managedRoles.includes((user as any).role.name)) {
        return ResponseService({
          status: 403,
          success: false,
          message: `You are not authorized to delete ${(user as any).role.name} users`,
          data: null,
          res
        });
      }

      // Check school restriction
      if (schoolRestriction && user.schoolId !== schoolRestriction) {
        return ResponseService({
          status: 403,
          success: false,
          message: 'You can only manage users within your school',
          data: null,
          res
        });
      }

      // Soft delete
      await user.destroy();

      return ResponseService({
        status: 200,
        success: true,
        message: `${(user as any).role.name} user deleted successfully`,
        data: null,
        res
      });

    } catch (error) {
      console.error('Delete user error:', error);
      return ResponseService({
        status: 500,
        success: false,
        message: 'Failed to delete user',
        data: null,
        res
      });
    }
  }

  /**
   * Reset user password
   */
  static async resetUserPassword(userId: string, res: Response, managedRoles: string[], schoolRestriction?: string | undefined) {
    try {
      const user = await Database.User.findByPk(userId, {
        include: [
          {
            model: Database.Role,
            as: 'role',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!user) {
        return ResponseService({
          status: 404,
          success: false,
          message: 'User not found',
          data: null,
          res
        });
      }

      // Check permissions
      if (!managedRoles.includes((user as any).role.name)) {
        return ResponseService({
          status: 403,
          success: false,
          message: `You are not authorized to reset password for ${(user as any).role.name} users`,
          data: null,
          res
        });
      }

      // Check school restriction
      if (schoolRestriction && user.schoolId !== schoolRestriction) {
        return ResponseService({
          status: 403,
          success: false,
          message: 'You can only manage users within your school',
          data: null,
          res
        });
      }

      // Generate new temporary password
      const newPassword = this.generateTemporaryPassword();
      const hashedPassword = await hashPassword(newPassword);

      // Update user password
      await user.update({ password: hashedPassword });

      // Send password reset email
      try {
        await this.sendPasswordResetEmail(user.email, user.firstName, newPassword, (user as any).role.name);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Continue even if email fails
      }

      return ResponseService({
        status: 200,
        success: true,
        message: 'Password reset successfully',
        data: {
          temporaryPassword: newPassword,
          message: 'New password has been sent to user\'s email'
        },
        res
      });

    } catch (error) {
      console.error('Reset user password error:', error);
      return ResponseService({
        status: 500,
        success: false,
        message: 'Failed to reset password',
        data: null,
        res
      });
    }
  }

  /**
   * Generate a secure temporary password
   */
  private static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Send welcome email to new user
   */
  private static async sendWelcomeEmail(email: string, firstName: string, password: string, role: string): Promise<void> {
    const subject = `Welcome to InzoziSchool - ${role} Account Created`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to InzoziSchool, ${firstName}!</h2>
        <p>Your ${role} account has been created successfully.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 5px;">${password}</code></p>
        </div>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <strong>Important:</strong> Please change your password after your first login for security purposes.
        </div>
        
        <p>If you have any questions, please contact your administrator.</p>
        
        <p>Best regards,<br>InzoziSchool Team</p>
      </div>
    `;
    
    await sendMail(email, subject, htmlContent);
  }

  /**
   * Send password reset email
   */
  private static async sendPasswordResetEmail(email: string, firstName: string, newPassword: string, role: string): Promise<void> {
    const subject = `InzoziSchool - Password Reset for ${role}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset - InzoziSchool</h2>
        <p>Hello ${firstName},</p>
        <p>Your password has been reset by an administrator.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your New Login Credentials:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>New Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 5px;">${newPassword}</code></p>
        </div>
        
        <div style="background-color: #d1ecf1; border-left: 4px solid #bee5eb; padding: 15px; margin: 20px 0;">
          <strong>Security Notice:</strong> Please change this password immediately after logging in.
        </div>
        
        <p>If you did not request this password reset, please contact your administrator immediately.</p>
        
        <p>Best regards,<br>InzoziSchool Team</p>
      </div>
    `;
    
    await sendMail(email, subject, htmlContent);
  }
}
