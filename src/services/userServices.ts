// src/services/UserService.ts
import { User } from "../database/models/User";
import { Role } from "../database/models/Roles";
import { hashPassword } from "../utils/helper";
import { CreateSchoolManagerDto, CreateAdmissionManagerDto } from "../types/userInterface";

export class UserService {

  static async createSchoolManager(data: CreateSchoolManagerDto): Promise<User> {
    const role = await Role.findOne({ where: { name: 'SchoolManager' } });
    if (!role) throw new Error('SchoolManager role not found');

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      ...data,
      password: hashedPassword,
      roleId: role.id,
    });

    return user;
  }

  static async createAdmissionManager(data: CreateAdmissionManagerDto): Promise<User> {
    const role = await Role.findOne({ where: { name: 'AdmissionManager' } });
    if (!role) throw new Error('AdmissionManager role not found');

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      ...data,
      password: hashedPassword,
      roleId: role.id,
    });

    return user;
  }

  




  
  static async getAllUsers(requestingUser: any) {
    if (!requestingUser.role) throw new Error("Role missing");

    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");

    if (requesterRole.name === "Admin") {
      
      return await User.findAll({
    
      });
    }

    if (requesterRole.name === "SchoolManager") {
      
      const admissionRole = await Role.findOne({ where: { name: "AdmissionManager" } });
      if (!admissionRole) throw new Error("AdmissionManager role not found");

      return await User.findAll({
        where: {
          schoolId: requestingUser.schoolId,
          roleId: admissionRole.id,
        },
        include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
      });
    }

    
    return [];
  }

  
  static async deleteUser(requestingUser: any, userId: string) {
    const userToDelete = await User.findByPk(userId);
    if (!userToDelete) throw new Error("User not found");

    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");

    const targetRole = await Role.findByPk(userToDelete.roleId);

    if (requesterRole.name === "Admin") {
      await userToDelete.destroy();
      return true;
    }

    if (
      requesterRole.name === "SchoolManager" &&
      userToDelete.schoolId === requestingUser.schoolId &&
      targetRole?.name === "AdmissionManager"
    ) {
      await userToDelete.destroy();
      return true;
    }

    throw new Error("You do not have permission to delete this user");
  }

  // Update user
  static async updateUser(requestingUser: any, userId: string, data: any) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");

    // Hash password if updating it
    if (data.password) {
      data.password = await hashPassword(data.password);
    } else {
      delete data.password;
    }

    // Self update
    if (requestingUser.id === user.id) {
      return await user.update(data);
    }

    // Admin can update anyone
    if (requesterRole.name === "Admin") {
      return await user.update(data);
    }

    // SchoolManager can update AdmissionManagers in their school
    if (requesterRole.name === "SchoolManager" && user.schoolId === requestingUser.schoolId) {
      const targetRole = await Role.findByPk(user.roleId);
      if (targetRole?.name === "AdmissionManager") {
        return await user.update(data);
      }
    }

    throw new Error("You do not have permission to update this user");
  }

}
