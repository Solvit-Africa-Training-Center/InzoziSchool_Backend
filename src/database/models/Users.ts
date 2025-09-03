import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import { Role } from './Roles';
import { School } from './Schools';

export interface UserAttributes {
  id: string;
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
  password?: string | null;
  roleId: string;
  schoolId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'password' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public gender!: string;
  public province!: string;
  public district!: string;
  public sector!: string;
  public cell!: string;
  public village!: string;
  public phone!: string;
  public email!: string;
  public password?: string | null;
  public roleId!: string;
  public schoolId?: string | null;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;

  static associate(models: { Role: typeof Role; School: typeof School }) {
    User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });       // role relationship
    User.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school' }); // school relationship
  }
}

export const UserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
      province: { type: DataTypes.STRING, allowNull: false },
      district: { type: DataTypes.STRING, allowNull: false },
      sector: { type: DataTypes.STRING, allowNull: false },
      cell: { type: DataTypes.STRING, allowNull: false },
      village: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: true },
      roleId: { type: DataTypes.UUID, allowNull: false },
      schoolId: { type: DataTypes.UUID, allowNull: true },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      timestamps: true,
      paranoid: true,
      tableName: 'users',
      modelName: 'User',
    }
  );
  return User;
};
