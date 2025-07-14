import mongoose from "mongoose";

const listSchema= new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    list:{
        Completed: {type: [String], default:[]},
        Playing: {type: [String], default:[]},
        Wishlist: {type:[String], default:[]}
    }
});

const List = mongoose.model('List',listSchema);

export default List;