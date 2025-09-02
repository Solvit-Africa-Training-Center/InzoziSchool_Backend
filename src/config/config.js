// src/config/config.js
const dotenv = require('dotenv');
dotenv.config();
const nodeEnv = process.env.NODE_ENV || 'development';


const getPrefix = () => {
  if (nodeEnv === 'test') return 'TEST';
  if (nodeEnv === 'production') return 'PROD';
  return 'DEV'; // default
};

const env = getPrefix();

module.exports = {
  username: process.env[`${env}_USERNAME`] || 'postgres',
  password: process.env[`${env}_PASSWORD`] || '',
  database: process.env[`${env}_DATABASE`] || (env === 'TEST' ? 'inzozi_test' : 'inzozi_db'),
  host: process.env[`${env}_HOST`] || 'localhost',
  port: process.env[`${env}_PORT`] ? parseInt(process.env[`${env}_PORT`], 10) : 5432,
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};