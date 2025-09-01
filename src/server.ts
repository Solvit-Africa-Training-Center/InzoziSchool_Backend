import express from "express";
import { routers } from './routes';
import { Database } from './database';
import { config } from "dotenv";

config();

Database;

const app = express();

app.use(routers);

app.get('/', (req, res) => {
  res.send('Hello World');
});

export { app };
