import axios from 'axios';
import Game from '../model/Game.js';

const IGDB_API_URL = 'https://api.igdb.com/v4';

// Get IGDB access token (cached)
let accessToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('IGDB credentials not configured');
  }

  try {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    );

    accessToken = response.data.access_token;
    // Token expires in response.data.expires_in seconds, cache for slightly less time
    tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Error getting IGDB access token:', error);
    throw new Error('Failed to authenticate with IGDB');
  }
};

// Search games from IGDB API
export const searchGames = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      res.status(400).json({ message: 'Query parameter required' });
      return;
    }

    const token = await getAccessToken();
    const clientId = process.env.IGDB_CLIENT_ID;

    const response = await axios.post(
      `${IGDB_API_URL}/games`,
      `search "${query}"; fields name,summary,cover.url,first_release_date,platforms.name,genres.name; limit ${limit};`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const games = response.data.map((game) => ({
      giantBombId: game.id, // Using same field name for compatibility
      name: game.name,
      description: game.summary,
      imageUrl: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
      releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : undefined,
      platforms: game.platforms?.map((p) => p.name) || [],
    }));

    res.status(200).json(games);
  } catch (error) {
    console.error('IGDB API error:', error);
    res.status(500).json({ message: 'Error fetching games from IGDB', error });
  }
};

// Get game details by IGDB ID
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if game exists in our database
    let game = await Game.findOne({ giantBombId: parseInt(id) });
    
    if (game) {
      res.status(200).json(game);
      return;
    }

    // If not in database, fetch from IGDB API
    const token = await getAccessToken();
    const clientId = process.env.IGDB_CLIENT_ID;

    const response = await axios.post(
      `${IGDB_API_URL}/games`,
      `fields name,summary,cover.url,first_release_date,platforms.name,genres.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher; where id = ${id};`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.data || response.data.length === 0) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }

    const gameData = response.data[0];

    // Extract developers and publishers
    const developers = gameData.involved_companies
      ?.filter((ic) => ic.developer)
      .map((ic) => ic.company?.name)
      .filter(Boolean) || [];

    const publishers = gameData.involved_companies
      ?.filter((ic) => ic.publisher)
      .map((ic) => ic.company?.name)
      .filter(Boolean) || [];
    
    // Save to database
    game = await Game.create({
      giantBombId: gameData.id,
      name: gameData.name,
      description: gameData.summary,
      imageUrl: gameData.cover?.url ? `https:${gameData.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
      releaseDate: gameData.first_release_date ? new Date(gameData.first_release_date * 1000).toISOString() : undefined,
      platforms: gameData.platforms?.map((p) => p.name) || [],
      genres: gameData.genres?.map((g) => g.name) || [],
      developers,
      publishers,
      apiData: gameData,
    });
    
    res.status(200).json(game);
  } catch (error) {
    console.error('IGDB API error:', error);
    res.status(500).json({ message: 'Error fetching game details', error });
  }
};

// Get game from our database
export const getGameFromDB = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await Game.findById(id);
    
    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }
    
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get popular/trending games
export const getTrendingGames = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const token = await getAccessToken();
    const clientId = process.env.IGDB_CLIENT_ID;

    // Get recent popular games sorted by rating and release date
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const oneYearAgo = currentTimestamp - (365 * 24 * 60 * 60);

    const response = await axios.post(
      `${IGDB_API_URL}/games`,
      `fields name,summary,cover.url,first_release_date,platforms.name,genres.name,rating; where first_release_date >= ${oneYearAgo} & first_release_date <= ${currentTimestamp} & rating != null; sort rating desc; limit ${limit};`,
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const games = response.data.map((game) => ({
      giantBombId: game.id,
      name: game.name,
      description: game.summary,
      imageUrl: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
      releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : undefined,
      platforms: game.platforms?.map((p) => p.name) || [],
    }));
    
    res.status(200).json(games);
  } catch (error) {
    console.error('IGDB API error:', error);
    res.status(500).json({ message: 'Error fetching trending games', error });
  }
};
