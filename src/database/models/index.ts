import { Sequelize } from 'sequelize';
import { Role,RoleModel } from './Roles';
import { User, UserModel } from './User';

interface Modals {
  Role: typeof Role;
  User:typeof User;

}
export const AllModal = (sequelize: Sequelize): Modals => ({
  Role: RoleModel(sequelize),
  User:UserModel(sequelize),
 
});