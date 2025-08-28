import express from "express";
import { Database } from "./database";
import { config } from "dotenv";
import { routers } from './routes';

config()

Database

const port= process.env.PORT || 6000;
const app=express()
app.use(routers);

app.get('/',(req,res)=>{
    res.send('Hello World');
}) 

app.listen(port,()=>{
    console.log('Serve is running successful')
})