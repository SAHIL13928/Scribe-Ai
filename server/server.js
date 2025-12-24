import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())
app.use(requireAuth())

app.get("/", (req, res) => {
  res.status(200).send("Server is running")
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port' , PORT);
});