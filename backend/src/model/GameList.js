import mongoose from 'mongoose';
const { Schema } = mongoose;

export const GameStatus = {
  PLAYING: 'playing',
  COMPLETED: 'completed',
  WISHLIST: 'wishlist',
  DROPPED: 'dropped',
};

const GameListEntrySchema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  status: {
    type: String,
    enum: ['playing', 'completed', 'wishlist', 'dropped'],
    required: true,
    default: 'wishlist',
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
  },
  review: {
    type: String,
    maxlength: 2000,
  },
  hoursPlayed: {
    type: Number,
    min: 0,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const GameListSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    games: [GameListEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
GameListSchema.index({ user: 1, 'games.game': 1 });

export default mongoose.model('GameList', GameListSchema);
