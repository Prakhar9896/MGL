import mongoose from 'mongoose';
const { Schema } = mongoose;

const GameSchema = new Schema(
  {
    giantBombId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    releaseDate: {
      type: Date,
    },
    platforms: [{
      type: String,
    }],
    genres: [{
      type: String,
    }],
    developers: [{
      type: String,
    }],
    publishers: [{
      type: String,
    }],
    apiData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Game', GameSchema);
