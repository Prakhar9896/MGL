import User from '../model/User.js';
import GameList from '../model/GameList.js';

// Clerk webhook handler
export const handleClerkWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log('Webhook received:', type);
    
    // Handle user created event
    if (type === 'user.created' || type === 'user.updated') {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || '';
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const profileImage = data.image_url || '';
      
      // Create username from name or email
      let username = '';
      if (firstName && lastName) {
        username = `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, '');
      } else if (firstName) {
        username = firstName.toLowerCase().replace(/\s+/g, '');
      } else if (data.username) {
        username = data.username.toLowerCase();
      } else {
        username = email.split('@')[0];
      }
      
      console.log('Creating/updating user:', { clerkId, email, username });
      
      // Check if user already exists
      let user = await User.findOne({ clerkId });
      
      if (user) {
        // Update existing user
        user.email = email;
        user.username = username;
        user.profileImage = profileImage;
        await user.save();
        console.log('User updated:', user.username);
      } else {
        // Create new user
        user = await User.create({
          clerkId,
          email,
          username,
          profileImage,
          friends: [],
        });
        
        // Create empty game list for new user
        await GameList.create({
          user: user._id,
          games: [],
        });
        
        console.log('User created:', user.username);
      }
    }
    
    // Handle user deleted event
    if (type === 'user.deleted') {
      const clerkId = data.id;
      const user = await User.findOneAndDelete({ clerkId });
      
      if (user) {
        await GameList.findOneAndDelete({ user: user._id });
        console.log('User deleted:', clerkId);
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed', error: error.message });
  }
};
