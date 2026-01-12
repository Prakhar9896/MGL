import { Router } from 'express';
import {
  getUserGameList,
  getCurrentUserGameList,
  addGameToList,
  updateGameInList,
  removeGameFromList,
  getGameStats,
} from '../controller/gameListController.js';

const router = Router();

// Public routes
router.get('/user/:userId', getUserGameList);

// Protected routes (require authentication)
router.get('/me/list', getCurrentUserGameList);
router.get('/me/stats', getGameStats);
router.post('/me/games', addGameToList);
router.put('/me/games/:gameId', updateGameInList);
router.delete('/me/games/:gameId', removeGameFromList);

export default router;
