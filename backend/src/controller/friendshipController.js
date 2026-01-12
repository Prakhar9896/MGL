import Friendship, { FriendshipStatus } from '../model/Friendship.js';
import User from '../model/User.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { recipientId } = req.body;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    if (!recipientId) {
      res.status(400).json({ message: 'Recipient ID required' });
      return;
    }
    
    const requester = await User.findOne({ clerkId });
    
    if (!requester) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
      res.status(404).json({ message: 'Recipient not found' });
      return;
    }
    
    if (requester._id.toString() === recipientId) {
      res.status(400).json({ message: 'Cannot send friend request to yourself' });
      return;
    }
    
    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requester._id, recipient: recipientId },
        { requester: recipientId, recipient: requester._id },
      ],
    });
    
    if (existingFriendship) {
      res.status(400).json({ 
        message: 'Friend request already exists or users are already friends',
        status: existingFriendship.status 
      });
      return;
    }
    
    const friendship = await Friendship.create({
      requester: requester._id,
      recipient: recipientId,
      status: FriendshipStatus.PENDING,
    });
    
    res.status(201).json(friendship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { friendshipId } = req.params;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const friendship = await Friendship.findById(friendshipId);
    
    if (!friendship) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }
    
    // Only recipient can accept
    if (friendship.recipient.toString() !== user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to accept this request' });
      return;
    }
    
    if (friendship.status !== FriendshipStatus.PENDING) {
      res.status(400).json({ message: 'Friend request already processed' });
      return;
    }
    
    friendship.status = FriendshipStatus.ACCEPTED;
    await friendship.save();
    
    // Add to friends list
    await User.findByIdAndUpdate(friendship.requester, {
      $addToSet: { friends: friendship.recipient },
    });
    
    await User.findByIdAndUpdate(friendship.recipient, {
      $addToSet: { friends: friendship.requester },
    });
    
    res.status(200).json(friendship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { friendshipId } = req.params;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const friendship = await Friendship.findById(friendshipId);
    
    if (!friendship) {
      res.status(404).json({ message: 'Friend request not found' });
      return;
    }
    
    // Only recipient can reject
    if (friendship.recipient.toString() !== user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to reject this request' });
      return;
    }
    
    if (friendship.status !== FriendshipStatus.PENDING) {
      res.status(400).json({ message: 'Friend request already processed' });
      return;
    }
    
    friendship.status = FriendshipStatus.REJECTED;
    await friendship.save();
    
    res.status(200).json(friendship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const clerkId = req.auth()?.userId;
    const { friendId } = req.params;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Find and delete friendship
    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { requester: user._id, recipient: friendId },
        { requester: friendId, recipient: user._id },
      ],
      status: FriendshipStatus.ACCEPTED,
    });
    
    if (!friendship) {
      res.status(404).json({ message: 'Friendship not found' });
      return;
    }
    
    // Remove from friends list
    await User.findByIdAndUpdate(user._id, {
      $pull: { friends: friendId },
    });
    
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: user._id },
    });
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get user's friends
export const getUserFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .populate('friends', 'username profileImage bio');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get current user's friends
export const getCurrentUserFriends = async (req, res) => {
  try {
    const auth = req.auth();
    const clerkId = auth?.userId;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    let user = await User.findOne({ clerkId })
      .populate('friends', 'username profileImage bio');
    
    if (!user) {
      // Auto-create or update user - fetch data from Clerk
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        // Extract email
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || `user${clerkId.slice(-8)}@temp.com`;
        
        // Extract username from name or email
        const firstName = clerkUser.firstName || '';
        const lastName = clerkUser.lastName || '';
        let username = '';
        
        if (firstName && lastName) {
          username = `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, '');
        } else if (firstName) {
          username = firstName.toLowerCase().replace(/\s+/g, '');
        } else if (clerkUser.username) {
          username = clerkUser.username.toLowerCase();
        } else {
          username = email.split('@')[0];
        }
        
        try {
          user = await User.create({
            clerkId,
            email,
            username,
            profileImage: clerkUser.imageUrl,
            friends: [],
          });
        } catch (createError) {
          // If duplicate key error, the user exists - update it instead
          if (createError.code === 11000) {
            user = await User.findOneAndUpdate(
              { clerkId },
              { email, username, profileImage: clerkUser.imageUrl },
              { new: true }
            );
          } else {
            throw createError;
          }
        }
        
        await user.populate('friends', 'username profileImage bio');
      } catch (clerkError) {
        console.error('Failed to fetch/create user from Clerk:', clerkError);
        throw new Error('Failed to create user');
      }
    }
    
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  try {
    const auth = req.auth();
    const clerkId = auth?.userId;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Auto-create or update user - fetch data from Clerk
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        // Extract email
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || `user${clerkId.slice(-8)}@temp.com`;
        
        // Extract username from name or email
        const firstName = clerkUser.firstName || '';
        const lastName = clerkUser.lastName || '';
        let username = '';
        
        if (firstName && lastName) {
          username = `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, '');
        } else if (firstName) {
          username = firstName.toLowerCase().replace(/\s+/g, '');
        } else if (clerkUser.username) {
          username = clerkUser.username.toLowerCase();
        } else {
          username = email.split('@')[0];
        }
        
        try {
          user = await User.create({
            clerkId,
            email,
            username,
            profileImage: clerkUser.imageUrl,
            friends: [],
          });
        } catch (createError) {
          // If duplicate key error, the user exists - update it instead
          if (createError.code === 11000) {
            user = await User.findOneAndUpdate(
              { clerkId },
              { email, username, profileImage: clerkUser.imageUrl },
              { new: true }
            );
          } else {
            throw createError;
          }
        }
      } catch (clerkError) {
        console.error('Failed to fetch/create user from Clerk:', clerkError);
        throw new Error('Failed to create user');
      }
    }
    
    const receivedRequests = await Friendship.find({
      recipient: user._id,
      status: FriendshipStatus.PENDING,
    }).populate('requester', 'username profileImage bio');
    
    const sentRequests = await Friendship.find({
      requester: user._id,
      status: FriendshipStatus.PENDING,
    }).populate('recipient', 'username profileImage bio');
    
    res.status(200).json({
      received: receivedRequests,
      sent: sentRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Check friendship status
export const checkFriendshipStatus = async (req, res) => {
  try {
    const clerkId = req.auth?.userId;
    const { userId } = req.params;
    
    if (!clerkId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const currentUser = await User.findOne({ clerkId });
    
    if (!currentUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const friendship = await Friendship.findOne({
      $or: [
        { requester: currentUser._id, recipient: userId },
        { requester: userId, recipient: currentUser._id },
      ],
    });
    
    if (!friendship) {
      res.status(200).json({ status: 'none' });
      return;
    }
    
    res.status(200).json({
      status: friendship.status,
      isRequester: friendship.requester.toString() === currentUser._id.toString(),
      friendshipId: friendship._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
