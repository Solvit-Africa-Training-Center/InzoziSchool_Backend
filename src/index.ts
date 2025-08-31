import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';

import authRoutes from './routes/usersRoute';
import './config/passport';
import { sequelize } from './database/index';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'supersecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

app.get('/', (_req, res) => res.json({ message: 'Server is running' }));

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync(); // sync models for dev/testing

    const PORT = process.env.PORT ?? 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
})();
