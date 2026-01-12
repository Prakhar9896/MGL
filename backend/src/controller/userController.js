import User from '../model/User.js';
import GameList from '../model/GameList.js';

// Get user profile (accepts MongoDB _id or Clerk ID)
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to find by MongoDB _id first, then by clerkId
    let user = null;
    
    // Check if it looks like a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      user = await User.findById(userId)
        .select('-__v')
        .populate('friends', 'username profileImage');
    }
    
    // If not found or not a valid ObjectId, try finding by clerkId
    if (!user) {
      user = await User.findOne({ clerkId: userId })
        .select('-__v')
        .populate('friends', 'username profileImage');
    }
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get current user (from Clerk auth)
export const getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId })
      .select('-__v')
      .populate('friends', 'username profileImage');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create or update user (webhook from Clerk)
export const createOrUpdateUser = async (req, res) => {
  try {
    const { clerkId, email, username, profileImage } = req.body;
    
    if (!clerkId || !email || !username) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    
    let user = await User.findOne({ clerkId });
    
    if (user) {
      // Update existing user
      user.email = email;
      user.username = username;
      if (profileImage) user.profileImage = profileImage;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        clerkId,
        email,
        username,
        profileImage,
      });
      
      // Create empty game list for new user
      await GameList.create({
        user: user._id,
        games: [],
      });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { username, bio, profileImage } = req.body;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;
    
    await user.save();
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      res.status(400).json({ message: 'Query parameter required' });
      return;
    }
    
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    })
      .select('username profileImage bio')
      .limit(20);
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOneAndDelete({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Delete user's game list
    await GameList.findOneAndDelete({ user: user._id });
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
