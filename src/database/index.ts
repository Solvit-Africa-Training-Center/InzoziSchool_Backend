// src/database/index.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { UserModel } from './models/Users';
import { RoleModel } from './models/Roles';

dotenv.config();

const dbHost = process.env.DEV_HOST ?? 'localhost';
const dbPort = Number(process.env.DEV_PORT ?? 5432);
const dbName = process.env.DEV_DATABASE ?? 'inzozii';
const dbUser = process.env.DEV_USERNAME ?? 'postgres';
const dbPass = process.env.DEV_PASSWORD ?? '';

export const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false,
});

// Initialize models
export const Role = RoleModel(sequelize);
export const User = UserModel(sequelize);

// Setup associations
Role.associate({ User });
User.associate({ Role });

// Optional: do NOT sync here in production
// export const initDatabase = async () => {
//   await sequelize.authenticate();
//   console.log('Database connected!');
//   await sequelize.sync({ alter: true });
// };
