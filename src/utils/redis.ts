import { createClient, RedisClientOptions } from 'redis';
import { config } from 'dotenv';
import { logger } from './logger';

config();

// Redis config
const host = process.env.REDIS_HOST || 'localhost';
const port = parseInt(process.env.REDIS_PORT || '6379', 10);
const password = process.env.REDIS_PASSWORD || '';
const database = parseInt(process.env.REDIS_DB || '0', 10);

// Build client options
const clientOptions: RedisClientOptions = {
  socket: { host, port },
  database,
};

// Only add password if it's not empty
if (password) {
  clientOptions.password = password;
}

// Create Redis client
export const redis = createClient(clientOptions);

// Event listeners
redis.on('connect', () => logger.info('Redis client connected'));
redis.on('ready', () => logger.info('Redis client ready'));
redis.on('error', (err) => logger.error(`Redis connection error: ${err.message}`, { stack: err.stack }));
redis.on('end', () => logger.info('Redis connection closed'));

// Connect to Redis
(async () => {
  try {
    await redis.connect();
    logger.info(`Redis connected to ${host}:${port}, DB: ${database}`);
  } catch (err) {
    logger.error('Failed to connect to Redis', { stack: (err as Error).stack });
    process.exit(1); // Exit if Redis fails to connect
  }
})();

export default redis;
