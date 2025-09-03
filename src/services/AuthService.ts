import { Response } from 'express';
import { User } from '../database/models/Users';
import { hashPassword, comparePassword, generateToken, destroyToken } from '../utils/helper';
import { ResponseService } from '../utils/response';
import { redis } from '../utils/redis';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer';
import { Role } from '../database/models/Roles';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  password: string;
  schoolId?: string;
}

interface ResetPasswordDto {
  email: string;
}

interface ChangePasswordDto {
  token: string;
  newPassword: string;
}

export class AuthService {
  // REGISTER
static async registerWithEmail(dto: RegisterDto, res: Response) {
  try {
    const existing = await User.findOne({ where: { email: dto.email } });
    if (existing) {
      return ResponseService({ res, status: 409, success: false, message: 'Email already in use', data: null });
    }

    // Fetch SCHOOL_MANAGER role
    const role = await Role.findOne({ where: { name: 'SCHOOL_MANAGER' } });
    if (!role) throw new Error('Default role SCHOOL_MANAGER not found');

    const hashed = await hashPassword(dto.password);

    const user = await User.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashed,
      gender: dto.gender,
      province: dto.province,
      district: dto.district,
      sector: dto.sector,
      cell: dto.cell,
      village: dto.village,
      phone: dto.phone,
      roleId: role.id, // ✅ assigned dynamically
      schoolId: null,
    });

    const token = await generateToken({ id: user.id, email: user.email, role: role.id });

    return ResponseService({ res, status: 201, success: true, message: 'Registration successful', data: { user, token } });
  } catch (err) {
    const { message, stack } = err as Error;
    return ResponseService({ res, status: 500, success: false, data: { message, stack } });
  }
}


  // LOGIN
  static async login(dto: LoginDto, res: Response) {
    try {
      const user = await User.findOne({ where: { email: dto.email } });
      if (!user || !user.password)
        return ResponseService({
          res,
          status: 401,
          success: false,
          message: 'Invalid credentials',
          data: null
        });

      const isMatch = await comparePassword(dto.password, user.password);
      if (!isMatch)
        return ResponseService({
          res,
          status: 401,
          success: false,
          message: 'Incorrect password',
          data: null
        });

      const token = await generateToken({ id: user.id, email: user.email, role: user.roleId });
      return ResponseService({
        res,
        status: 200,
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    } catch (error) {
      return ResponseService({
        res,
        status: 500,
        success: false,
        data: error
      });
    }
  }

  // LOGOUT
  static async logout(token: string | undefined, res: Response) {
    try {
      if (!token) throw new Error('Token missing');
      await destroyToken(token);
      return ResponseService({
        res,
        status: 200,
        success: true,
        message: 'Logged out successfully',
        data: null
      });
    } catch (error) {
      return ResponseService({
        res,
        status: 500,
        success: false,
        data: error
      });
    }
  }

  // FORGOT PASSWORD
  static async forgotPassword(dto: ResetPasswordDto, res: Response) {
    try {
      const user = await User.findOne({ where: { email: dto.email } });
      if (!user)
        return ResponseService({
          res,
          status: 404,
          success: false,
          message: 'User not found',
          data: null
        });

      const token = crypto.randomBytes(32).toString('hex');
      await redis.setEx(`reset:${token}`, 15 * 60, user.id); // expires in 15 min

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      const html = `
        <h3>Password Reset Request</h3>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `;

      await sendMail(user.email, 'Reset Your Password', html);

      return ResponseService({
        res,
        status: 200,
        success: true,
        message: 'Password reset link sent to your email',
        data: { token } // optional, mostly for dev/testing
      });
    } catch (error) {
      return ResponseService({
        res,
        status: 500,
        success: false,
        data: error
      });
    }
  }

  // RESET PASSWORD
  static async resetPassword(dto: ChangePasswordDto, res: Response) {
    try {
      const userId = await redis.get(`reset:${dto.token}`);
      if (!userId)
        return ResponseService({
          res,
          status: 400,
          success: false,
          message: 'Invalid or expired token',
          data: null
        });

      const hashed = await hashPassword(dto.newPassword);
      await User.update({ password: hashed }, { where: { id: userId } });
      await redis.del(`reset:${dto.token}`);

      return ResponseService({
        res,
        status: 200,
        success: true,
        message: 'Password updated successfully',
        data: null
      });
    } catch (error) {
      return ResponseService({
        res,
        status: 500,
        success: false,
        data: error
      });
    }
  }
}
