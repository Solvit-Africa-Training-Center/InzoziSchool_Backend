import config from '../config/config';
import { Sequelize, Options } from 'sequelize';
import { AllModal } from './models';


const dbConfig = config.database;

let sequelizeInstance: Sequelize;

if (process.env.DATABASE_URL) {
  
  sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: dbConfig.dialectOptions || {},
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    logging: false,
  });
} else {
  // Local dev/test
  sequelizeInstance = new Sequelize(
    dbConfig.database!, // assert not undefined
    dbConfig.username!,
    dbConfig.password!,
    {
      host: dbConfig.host || 'localhost',
      port: dbConfig.port || 5432,
      dialect: 'postgres',
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      logging: false,
    } as Options
  );
}

// Authenticate database connection
sequelizeInstance
  .authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection error:', err.message || err));

// Register models
const models = AllModal(sequelizeInstance);
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

export type DatabaseType = typeof models & { database: Sequelize };
export const Database = { ...models, database: sequelizeInstance };
export const sequelize = sequelizeInstance;
export default sequelizeInstance;
