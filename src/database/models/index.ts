import { Sequelize } from 'sequelize';
import { Role,RoleModel } from './Roles';
import { User, UserModel } from './User';
import { School, SchoolModel } from './School';

interface Modals {
  Role: typeof Role;
  User:typeof User;
  School:typeof School;

}
export const AllModal = (sequelize: Sequelize): Modals => ({
  Role: RoleModel(sequelize),
  User:UserModel(sequelize),
  School:SchoolModel(sequelize),
 
});