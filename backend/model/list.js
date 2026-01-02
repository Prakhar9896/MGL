import mongoose from "mongoose";

const gameItemSchema = new mongoose.Schema(
  {
    guid: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" }
  },
  { _id: false } // prevents Mongoose from adding its own _id to each subdocument
);

const listSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  list: {
    Completed: { type: [gameItemSchema], default: [] },
    Playing: { type: [gameItemSchema], default: [] },
    Wishlist: { type: [gameItemSchema], default: [] }
  }
});

const List = mongoose.model("List", listSchema);

export default List;
