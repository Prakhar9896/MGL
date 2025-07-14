import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const connection= await mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/mgl");
        console.log(`Database Connected: ${connection.connection.host}`);
    }

    catch(err){
        console.log("error in connecting database: ",err);
        process.exit(1);
    }
}

export default connectDB;