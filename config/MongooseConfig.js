import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MongooseConfig = () => {
    mongoose.connect(process.env.MONGODB_URI);
    mongoose.connection.on("connected", () => {
        console.log("Connected to MongoDB");
    });
    mongoose.connection.on("error", (err) => {
        console.log("Error connecting to MongoDB", err);
    });
}

export default MongooseConfig;