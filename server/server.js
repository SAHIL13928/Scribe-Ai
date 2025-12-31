import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv/config';
import aiRouter from './routes/aiRoutes.js';
import userRouter from './routes/userRouter.js';
import connectCloudinary from './configs/cloudinary.js';

const app = express();

await connectCloudinary();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));

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
