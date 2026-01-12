import { Router } from 'express';
import {
  searchGames,
  getGameById,
  getGameFromDB,
  getTrendingGames,
} from '../controller/gameController.js';

const router = Router();

// All routes are public (no authentication required for game data)
router.get('/search', searchGames);
router.get('/trending', getTrendingGames);
router.get('/giantbomb/:id', getGameById);
router.get('/:id', getGameFromDB);

export default router;
