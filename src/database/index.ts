// src/database/models/index.ts
import { Sequelize, ModelStatic } from 'sequelize';
import { RoleModel, Role } from './models/Roles';
import { UserModel, User } from './models/User';
import { SchoolModel, School } from './models/School';
import { SchoolProfileModel, SchoolProfile } from './models/SchoolProfile';
import { SchoolGalleryModel, SchoolGallery } from './models/SchoolGallery';
import { SchoolSpotModel, SchoolSpot } from './models/SchoolSpot';
import { StudentModel, Student } from './models/Student';
import ApplicationModel, { Application } from './models/Application';

const sequelize = new Sequelize(
  process.env.DB_DATABASE ?? (() => { throw new Error('DB_DATABASE is not defined'); })(),
  process.env.DB_USERNAME ?? (() => { throw new Error('DB_USERNAME is not defined'); })(),
  process.env.DB_PASSWORD ?? (() => { throw new Error('DB_PASSWORD is not defined'); })(),
  {
    host: process.env.DB_HOST ?? (() => { throw new Error('DB_HOST is not defined'); })(),
    port: Number(process.env.DB_PORT ?? (() => { throw new Error('DB_PORT is not defined'); })()),
    dialect: 'postgres',
    logging: false,
  }
);

export { sequelize };

export interface Models {
  Role: ModelStatic<Role>;
  User: ModelStatic<User>;
  School: ModelStatic<School>;
  SchoolProfile: ModelStatic<SchoolProfile>;
  SchoolGallery: ModelStatic<SchoolGallery>;
  SchoolSpot: ModelStatic<SchoolSpot>;
  Student: ModelStatic<Student>;
  Application: ModelStatic<Application>;
  [key: string]: ModelStatic<any>;
}

export const AllModal = (sequelize: Sequelize): Models => {
  const RoleM = RoleModel(sequelize);
  const UserM = UserModel(sequelize);
  const SchoolM = SchoolModel(sequelize);
  const SchoolProfileM = SchoolProfileModel(sequelize);
  const SchoolGalleryM = SchoolGalleryModel(sequelize);
  const SchoolSpotM = SchoolSpotModel(sequelize);
  const StudentM = StudentModel(sequelize);
  const ApplicationM = ApplicationModel(sequelize);

  const models: Models = {
    Role: RoleM,
    User: UserM,
    School: SchoolM,
    SchoolProfile: SchoolProfileM,
    SchoolGallery: SchoolGalleryM,
    SchoolSpot: SchoolSpotM,
    Student: StudentM,
    Application: ApplicationM, // <-- Add Application here
  };

  // Run associations if defined
  Object.values(models).forEach((model: any) => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
};

export default AllModal;


