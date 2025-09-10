const dotenv = require('dotenv');
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const getPrefix = () => {
  if (nodeEnv === 'test') return 'TEST';
  if (nodeEnv === 'production') return 'PROD';
  return 'DEV';
};

const env = getPrefix();

const config = {
  app: {
    env: nodeEnv,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  },

  // Database configuration
  database: process.env.DATABASE_URL
    ? {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
          ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
        },
      }
    : {
        username: process.env[`${env}_USERNAME`] || 'postgres',
        password: process.env[`${env}_PASSWORD`] || '',
        database:
          process.env[`${env}_DATABASE`] ||
          (env === 'TEST' ? 'inzozi_test' : 'inzozi_db'),
        host: process.env[`${env}_HOST`] || 'localhost',
        port: process.env[`${env}_PORT`] ? parseInt(process.env[`${env}_PORT`], 10) : 5432,
        dialect: 'postgres',
      },
};

module.exports = config;
