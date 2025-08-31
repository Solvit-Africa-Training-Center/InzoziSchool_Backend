import { User } from '../database/models/Users';
import { Role } from '../database/models/Roles';
import { hashPassword, comparePassword, generateToken } from '../utils/helper';
import redis from '../utils/redis';
import jwt, { JwtPayload } from 'jsonwebtoken';

// DTOs

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

interface GoogleLoginDto {
  fullName: string;
  email: string;
  googleId: string;
  profileImage?: string | null;
  roleId: string;
}

// JWT User type
interface JwtUser {
  id: string;
  email: string;
  roleId: string;
}

// AuthService
export class AuthService {

  // Generate JWT for an existing user

  static async generateJwtForUser(user: JwtUser): Promise<{ token: string }> {
    if (!user) throw new Error('User is required to generate JWT');

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.roleId,
    });

    return { token };
  }


  // Email/Password login

  static async loginWithEmail({ email, password }: LoginDto) {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) return null; // invalid email or Google-only account

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return null;

    const token = await generateToken({ id: user.id, email: user.email, role: user.roleId });
    return { user, token };
  }


  // Register user with email/password

  static async registerWithEmail({
    fullName,
    email,
    password,
  }: {
    fullName: string;
    email: string;
    password: string;
  }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) return null;
    const role = await Role.findOne({ where: { name: 'NORMAL_USER' } });
    if (!role) throw new Error('Default role NORMAL_USER not found');
    const hashed = await hashPassword(password);
    const user = await User.create({
      fullName,
      email,
      password: hashed,
      roleId: role.id, // automatically assigned
    });

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: role.id,
    });

    return { user, token };
  }


  // Login/Register via Google OAuth2

  static async loginWithGoogle({
    fullName,
    email,
    googleId,
    profileImage,
    roleId, // UUID from passport.ts
  }: GoogleLoginDto) {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        googleId,
        profileImage: profileImage || null,
        roleId,
      });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.roleId,
    });

    return { user, token };
  }


  // Logout (Blacklist JWT)

  static async logout(token: string, expiresInSeconds: number): Promise<void> {
    await redis.setEx(token, expiresInSeconds, 'blacklisted');     // Store token in Redis with TTL equal to token expiration
  }
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const exists = await redis.exists(token);
    return exists === 1;
  }
}