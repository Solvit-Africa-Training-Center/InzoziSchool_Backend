import { createClient } from 'redis';
import { config } from 'dotenv';
import { logger } from './logger';

config();

// Read Redis config from environment
const host = process.env.REDIS_HOST || 'localhost';
const port = Number(process.env.REDIS_PORT ?? 6379);
const password = process.env.REDIS_PASSWORD || undefined;
const db = Number(process.env.REDIS_DB ?? 0);

// Log the configuration
logger.info(`Redis configuration: ${host}:${port}, DB: ${db}`);

// Create client
export const redis = createClient({
  socket: { host, port },
  password,   // can be undefined safely
  database: db,
} as any); // <-- cast to any to avoid TS conflicts

// Handle events
redis.on('connect', () => {
  logger.info('Redis client connecting...');
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`, { stack: err.stack });
});

redis.on('end', () => {
  logger.warn('Redis client disconnected');
});

// Connect immediately
(async () => {
  try {
    await redis.connect();
    logger.info('Redis connected successfully');
  } catch (err) {
    logger.error('Redis connection failed', { error: err });
  }
})();

export default redis;
