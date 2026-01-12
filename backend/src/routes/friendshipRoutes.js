import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getUserFriends,
  getCurrentUserFriends,
  getPendingRequests,
  checkFriendshipStatus,
} from '../controller/friendshipController.js';

const router = Router();

// Public routes
router.get('/user/:userId', getUserFriends);

// Protected routes (require authentication)
router.get('/me/friends', getCurrentUserFriends);
router.get('/me/requests', getPendingRequests);
router.get('/status/:userId', checkFriendshipStatus);
router.post('/request', sendFriendRequest);
router.put('/accept/:friendshipId', acceptFriendRequest);
router.put('/reject/:friendshipId', rejectFriendRequest);
router.delete('/remove/:friendId', removeFriend);

export default router;
