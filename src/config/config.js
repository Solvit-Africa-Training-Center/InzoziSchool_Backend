// src/config/config.js
const dotenv = require('dotenv');
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const getPrefix = (env) => {
  if (env === 'test') return 'TEST';
  if (env === 'production') return 'PROD';
  return 'DEV'; // default for development
};

const devPrefix = getPrefix('development');
const testPrefix = getPrefix('test');
const prodPrefix = getPrefix('production');

module.exports = {
  development: {
    username: process.env[`${devPrefix}_USERNAME`] || 'postgres',
    password: process.env[`${devPrefix}_PASSWORD`] || '',
    database: process.env[`${devPrefix}_DATABASE`] || 'inzozi_dev',
    host: process.env[`${devPrefix}_HOST`] || 'localhost',
    port: process.env[`${devPrefix}_PORT`] ? parseInt(process.env[`${devPrefix}_PORT`], 10) : 5432,
    dialect: 'postgres',
    dialectOptions: {},
  },

  test: {
    username: process.env[`${testPrefix}_USERNAME`] || 'postgres',
    password: process.env[`${testPrefix}_PASSWORD`] || '',
    database: process.env[`${testPrefix}_DATABASE`] || 'inzozi_test',
    host: process.env[`${testPrefix}_HOST`] || 'localhost',
    port: process.env[`${testPrefix}_PORT`] ? parseInt(process.env[`${testPrefix}_PORT`], 10) : 5432,
    dialect: 'postgres',
    dialectOptions: {},
  },

  production: {
    username: process.env[`${prodPrefix}_USERNAME`] || 'postgres',
    password: process.env[`${prodPrefix}_PASSWORD`] || '',
    database: process.env[`${prodPrefix}_DATABASE`] || 'inzozi_prod',
    host: process.env[`${prodPrefix}_HOST`] || 'localhost',
    port: process.env[`${prodPrefix}_PORT`] ? parseInt(process.env[`${prodPrefix}_PORT`], 10) : 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    },
  },
};
