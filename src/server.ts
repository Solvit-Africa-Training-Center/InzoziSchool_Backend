import express from "express";
import { routers } from './routes';
import { Database } from './database';
import { config } from "dotenv";
import redis from "./utils/redis";
import './events/emailListener';
config();

Database;
redis.connect().catch(console.error);

const app = express();


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(routers);

app.get('/', (req, res) => {
  res.send('Hello World');
});

export { app };
