import GameList, { GameStatus } from '../model/GameList.js';
import Game from '../model/Game.js';
import User from '../model/User.js';
import mongoose from 'mongoose';

// Get user's game list (accepts MongoDB _id or Clerk ID)
export const getUserGameList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    // Try to find user by MongoDB _id first, then by clerkId
    let user = null;
    
    // Check if it looks like a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      user = await User.findById(userId);
    }
    
    // If not found or not a valid ObjectId, try finding by clerkId
    if (!user) {
      user = await User.findOne({ clerkId: userId });
    }
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const gameList = await GameList.findOne({ user: user._id })
      .populate('games.game');
    
    if (!gameList) {
      // Return empty game list instead of 404
      res.status(200).json({
        user: user._id,
        games: [],
        totalGames: 0,
      });
      return;
    }
    
    let filteredGames = gameList.games;
    
    if (status && Object.values(GameStatus).includes(status)) {
      filteredGames = gameList.games.filter(entry => entry.status === status);
    }
    
    res.status(200).json({
      user: gameList.user,
      games: filteredGames,
      totalGames: gameList.games.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get current user's game list
export const getCurrentUserGameList = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { status } = req.query;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const gameList = await GameList.findOne({ user: user._id })
      .populate('games.game');
    
    if (!gameList) {
      res.status(404).json({ message: 'Game list not found' });
      return;
    }
    
    let filteredGames = gameList.games;
    
    if (status && Object.values(GameStatus).includes(status)) {
      filteredGames = gameList.games.filter(entry => entry.status === status);
    }
    
    res.status(200).json({
      user: gameList.user,
      games: filteredGames,
      totalGames: gameList.games.length,
      byStatus: {
        playing: gameList.games.filter(g => g.status === GameStatus.PLAYING).length,
        completed: gameList.games.filter(g => g.status === GameStatus.COMPLETED).length,
        wishlist: gameList.games.filter(g => g.status === GameStatus.WISHLIST).length,
        dropped: gameList.games.filter(g => g.status === GameStatus.DROPPED).length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add game to list
export const addGameToList = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { giantBombId, status, rating, review, hoursPlayed } = req.body;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    if (!giantBombId || !status) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Find or create game in database
    let game = await Game.findOne({ giantBombId });
    
    if (!game) {
      // Fetch from GiantBomb API
      const axios = (await import('axios')).default;
      const apiKey = process.env.GIANTBOMB_API_KEY;
      
      if (!apiKey) {
        res.status(500).json({ message: 'GiantBomb API key not configured' });
        return;
      }
      
      const response = await axios.get(`https://www.giantbomb.com/api/game/3030-${giantBombId}/`, {
        params: {
          api_key: apiKey,
          format: 'json',
        },
        headers: {
          'User-Agent': 'GameListApp/1.0',
        },
      });
      
      const gameData = response.data.results;
      
      game = await Game.create({
        giantBombId: gameData.id,
        name: gameData.name,
        description: gameData.deck,
        imageUrl: gameData.image?.medium_url || gameData.image?.thumb_url,
        releaseDate: gameData.original_release_date,
        platforms: gameData.platforms?.map((p) => p.name) || [],
        genres: gameData.genres?.map((g) => g.name) || [],
        developers: gameData.developers?.map((d) => d.name) || [],
        publishers: gameData.publishers?.map((p) => p.name) || [],
      });
    }
    
    let gameList = await GameList.findOne({ user: user._id });
    
    if (!gameList) {
      gameList = await GameList.create({
        user: user._id,
        games: [],
      });
    }
    
    // Check if game already exists in list
    const existingEntry = gameList.games.find(
      entry => entry.game.toString() === game._id.toString()
    );
    
    if (existingEntry) {
      res.status(400).json({ message: 'Game already in list' });
      return;
    }
    
    // Add game to list
    const newEntry = {
      game: game._id,
      status,
      addedAt: new Date(),
    };
    
    if (rating !== undefined) newEntry.rating = rating;
    if (review) newEntry.review = review;
    if (hoursPlayed !== undefined) newEntry.hoursPlayed = hoursPlayed;
    if (status === GameStatus.PLAYING) newEntry.startedAt = new Date();
    if (status === GameStatus.COMPLETED) {
      newEntry.startedAt = new Date();
      newEntry.completedAt = new Date();
    }
    
    gameList.games.push(newEntry);
    await gameList.save();
    
    await gameList.populate('games.game');
    
    res.status(201).json(gameList);
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update game in list
export const updateGameInList = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { gameId } = req.params;
    const { status, rating, review, hoursPlayed } = req.body;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const gameList = await GameList.findOne({ user: user._id });
    
    if (!gameList) {
      res.status(404).json({ message: 'Game list not found' });
      return;
    }
    
    const gameEntry = gameList.games.find(
      entry => entry.game.toString() === gameId
    );
    
    if (!gameEntry) {
      res.status(404).json({ message: 'Game not found in list' });
      return;
    }
    
    // Update fields
    if (status) {
      const oldStatus = gameEntry.status;
      gameEntry.status = status;
      
      if (status === GameStatus.PLAYING && oldStatus !== GameStatus.PLAYING) {
        gameEntry.startedAt = new Date();
      }
      
      if (status === GameStatus.COMPLETED && oldStatus !== GameStatus.COMPLETED) {
        gameEntry.completedAt = new Date();
        if (!gameEntry.startedAt) gameEntry.startedAt = new Date();
      }
    }
    
    if (rating !== undefined) gameEntry.rating = rating;
    if (review !== undefined) gameEntry.review = review;
    if (hoursPlayed !== undefined) gameEntry.hoursPlayed = hoursPlayed;
    
    await gameList.save();
    await gameList.populate('games.game');
    
    res.status(200).json(gameList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove game from list
export const removeGameFromList = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { gameId } = req.params;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const gameList = await GameList.findOne({ user: user._id });
    
    if (!gameList) {
      res.status(404).json({ message: 'Game list not found' });
      return;
    }
    
    gameList.games = gameList.games.filter(
      entry => entry.game.toString() !== gameId
    );
    
    await gameList.save();
    
    res.status(200).json({ message: 'Game removed from list', gameList });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get game statistics
export const getGameStats = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const gameList = await GameList.findOne({ user: user._id })
      .populate('games.game');
    
    if (!gameList) {
      res.status(404).json({ message: 'Game list not found' });
      return;
    }
    
    const stats = {
      totalGames: gameList.games.length,
      playing: gameList.games.filter(g => g.status === GameStatus.PLAYING).length,
      completed: gameList.games.filter(g => g.status === GameStatus.COMPLETED).length,
      wishlist: gameList.games.filter(g => g.status === GameStatus.WISHLIST).length,
      dropped: gameList.games.filter(g => g.status === GameStatus.DROPPED).length,
      totalHoursPlayed: gameList.games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0),
      averageRating: gameList.games.filter(g => g.rating).length > 0
        ? gameList.games.reduce((sum, g) => sum + (g.rating || 0), 0) / 
          gameList.games.filter(g => g.rating).length
        : 0,
      recentlyCompleted: gameList.games
        .filter(g => g.status === GameStatus.COMPLETED && g.completedAt)
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
        .slice(0, 5),
    };
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
