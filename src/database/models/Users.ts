import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import { Role } from './Roles';

export interface UserAttributes {
  id: string;
  fullName: string;
  email: string;
  password?: string | null; // optional for Google OAuth
  googleId?: string | null;
  profileImage?: string | null;
  roleId: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'password' | 'googleId' | 'profileImage' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public fullName!: string;
  public email!: string;
  public password?: string | null;
  public googleId?: string | null;
  public profileImage?: string | null;
  public roleId!: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;

  static associate(models: { Role: typeof Role }) {
    User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
  }
}

export const UserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      fullName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: true },
      googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
      profileImage: { type: DataTypes.STRING, allowNull: true },
      roleId: { type: DataTypes.UUID, allowNull: false },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, timestamps: true, paranoid: true, tableName: 'users', modelName: 'User' }
  );
  return User;
};
