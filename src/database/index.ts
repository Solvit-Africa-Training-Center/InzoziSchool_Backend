// src/database/dbConnection.ts
import databaseConfig from '../config/config';
import { Sequelize, Options } from 'sequelize';
import { AllModal } from './models';

// Call the function to get config
const dbConfig = databaseConfig; 


const sequelizeInstance = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  } as Options 
);


sequelizeInstance
  .authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message || err);
  });

// Register models
const models = AllModal(sequelizeInstance);

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export type DatabaseType = typeof models & { database: Sequelize };
export const Database = { ...models, database: sequelizeInstance };

export default sequelizeInstance;