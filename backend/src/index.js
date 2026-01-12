import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { clerk, protect } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import gameListRoutes from './routes/gameListRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhook routes BEFORE express.json() (Clerk needs raw body)
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Clerk middleware globally
app.use(clerk);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString() 
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/gamelists', protect, gameListRoutes);
app.use('/api/friendships', protect, friendshipRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
