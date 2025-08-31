import { Sequelize } from 'sequelize';
import { RoleModel, Role } from './Roles';
import { UserModel, User } from './Users';

export interface Models {
  User: typeof User;
  Role: typeof Role;
}

export const initModels = (sequelize: Sequelize): Models => {
  const Role = RoleModel(sequelize);
  const User = UserModel(sequelize);

  Role.associate({ User });
  User.associate({ Role });

  return { User, Role };
};
