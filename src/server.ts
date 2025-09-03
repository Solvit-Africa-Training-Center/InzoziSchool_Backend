import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { routers } from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { Database } from './database';
import { getTranslation } from './routes/languages';

config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
/**
 * @swagger
 * tags:
 *   name: General
 *   description: General API endpoints and health checks
 */

app.use('/api', routers);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/i18n', getTranslation);

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health Check
 *     description: Basic health check endpoint to verify API is running
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hello World
 */
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Database connection
Database.database.authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err: Error) => console.error('❌ Database connection error:', err.message || err));

export { app };
