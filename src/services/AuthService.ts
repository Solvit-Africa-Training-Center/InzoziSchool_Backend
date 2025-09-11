import { User } from "../database/models/User";
import { comparePassword, generateToken, destroyToken } from "../utils/helper";
import { hashPassword } from "../utils/helper";
import { redis } from "../utils/redis";
import { emailEmitter } from "../events/emailEvent";
import { School } from "../database/models/School";
interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  
 async login(dto: LoginDto) {
  const user = await User.findOne({ where: { email: dto.email } });
  
  if (!user) {
    return { success: false, status: 404, message: "User not Found", data: null };
  }

  if (!user.password) {
    return { success: false, status: 500, message: "User password not set", data: null };
  }

  const isMatch = await comparePassword(dto.password, user.password);
  if (!isMatch) {
    return { success: false, status: 401, message: "Incorrect email or password", data: null };
  }

  if (!user.id || !user.email || !user.roleId) {
    return { success: false, status: 500, message: "User data incomplete for token generation", data: null };
  }

  const token = await generateToken({
    id: user.id,
    email: user.email,
    role: user.roleId,
  });

  
  let schoolStatus: "not_registered" | "pending" | "approved" | "rejected" = "not_registered";

  
  if (user.roleId === "SchoolManager") {
    const school = await School.findOne({ where: { userId: user.id } });

    if (school) {
      if (school.status === "pending") schoolStatus = "pending";
      if (school.status === "approved") schoolStatus = "approved";
      if (school.status === "rejected") schoolStatus = "rejected";
    }
  }

  return {
    success: true,
    status: 200,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
      token,
      schoolStatus, 
    },
  };
}

  // Logout
  async logout(token: string | undefined) {
    if (!token) {
      return { success: false, status: 400, message: "Token missing", data: null };
    }

    await destroyToken(token); 
    return { success: true, status: 200, message: "Logged out successfully", data: null };
  }
}




export class PasswordResetService {
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  }

    static async requestReset(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const code = this.generateCode();
    await redis.setEx(`resetCode:${email}`, 300, code); 

    
    emailEmitter.emit("sendResetCode", email, code);
  }
  static async resetPassword(email: string, code: string, newPassword: string) {
    const storedCode = await redis.get(`resetCode:${email}`);
    if (!storedCode || storedCode !== code) throw new Error("Invalid or expired code");

    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    user.password = await hashPassword(newPassword);
    await user.save();

    await redis.del(`resetCode:${email}`); 
    return true;
  }
}

