import { Sequelize } from 'sequelize';
import { Role,RoleModel } from './Roles';
import { User, UserModel } from './User';
import { School, SchoolModel } from './School';
import { SchoolProfile,SchoolProfileModel } from './SchoolProfile';
import { SchoolGallery,SchoolGalleryModel } from './SchoolGallery';
import { SchoolSpot,SchoolSpotModel } from './SchoolSpot';

interface Modals {
  Role: typeof Role;
  User:typeof User;
  School:typeof School;
  SchoolProfile:typeof SchoolProfile;
  SchoolGallery:typeof SchoolGallery,
  SchoolSpot:typeof SchoolSpot,

}
export const AllModal = (sequelize: Sequelize): Modals => ({
  Role: RoleModel(sequelize),
  User:UserModel(sequelize),
  School:SchoolModel(sequelize),
  SchoolProfile:SchoolProfileModel(sequelize),
  SchoolGallery:SchoolGalleryModel(sequelize),
  SchoolSpot:SchoolSpotModel(sequelize),


 
});