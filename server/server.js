import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv/config';
import aiRouter from './routes/aiRoutes.js';
import userRouter from './routes/userRouter.js';
import connectCloudinary from './configs/cloudinary.js';

const app = express();

await connectCloudinary();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://mirage-q8fskjhbp-sahil-kumars-projects-f11074dd.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
