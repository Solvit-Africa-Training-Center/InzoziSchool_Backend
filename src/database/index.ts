// src/database/dbConnection.ts
import { Sequelize, Options } from 'sequelize';
import databaseConfig from '../config/config';

// Import model factories
import { UserModel, User } from './models/Users';
import { RoleModel, Role } from './models/Roles';
import { SchoolModel, School } from './models/Schools';

// Get DB config
const dbConfig = databaseConfig;

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  } as Options
);

// Initialize models
const models = {
  User: UserModel(sequelize),
  Role: RoleModel(sequelize),
  School: SchoolModel(sequelize),
};

// Define types for models
type ModelsType = {
  User: typeof User;
  Role: typeof Role;
  School: typeof School;
};

// Define model interface for associations
interface ModelWithAssociate {
  associate?: (models: ModelsType) => void;
}

// Run associations
Object.values(models).forEach((model: ModelWithAssociate) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Test DB connection
sequelize
  .authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection error:', err.message || err));

// Export database + models
export type DatabaseType = typeof models & { database: Sequelize };
export const Database = { ...models, database: sequelize };

export default Database;
