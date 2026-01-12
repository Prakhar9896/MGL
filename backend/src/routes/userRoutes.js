import { Router } from 'express';
import {
  getUserProfile,
  getCurrentUser,
  createOrUpdateUser,
  updateUserProfile,
  searchUsers,
  deleteUser,
} from '../controller/userController.js';

const router = Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:userId', getUserProfile);

// Protected routes (require authentication)
router.get('/me/profile', getCurrentUser);
router.put('/me/profile', updateUserProfile);
router.delete('/me/profile', deleteUser);

// Webhook route (for Clerk)
router.post('/webhook', createOrUpdateUser);

export default router;
