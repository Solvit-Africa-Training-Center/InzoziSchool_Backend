import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import { User } from './Users';

export interface RoleAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface RoleCreationAttributes
  extends Optional<RoleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: string;
  public name!: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;

  static associate(models: { User: typeof User }) {
    Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' });
  }
}

export const RoleModel = (sequelize: Sequelize): typeof Role => {
  Role.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, timestamps: true, paranoid: true, tableName: 'roles', modelName: 'Role' }
  );
  return Role;
};
