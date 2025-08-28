import databaseConfig from '../config/config';

import { Sequelize } from 'sequelize';
import { AllModal } from './models';

interface ConfigInterface {
  username: string;
  password: string;
  database: string;
  port: number;
  host: string;
}

const dbConnection = () => {
  const db_config = databaseConfig() as ConfigInterface;
  const sequelize = new Sequelize({
    ...db_config,
    dialect: 'postgres',
  });
  return sequelize;
};


const sequelizeInstance = dbConnection();

// ✅ Test DB connection
sequelizeInstance
  .authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

const models = AllModal(sequelizeInstance);

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});
export type DatabaseType = typeof models & { database: Sequelize };

export const Database = { ...models, database: sequelizeInstance };
