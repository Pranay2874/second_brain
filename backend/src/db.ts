import mongoose, { Schema, model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL as string;
if (!MONGO_URL) {
    throw new Error("MONGO_URL is not defined in .env");
}


mongoose.connect(MONGO_URL)
    .then(() => console.log("connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String }
});

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String, 
    tags: [{ type: mongoose.Types.ObjectId, ref: "tag" }],
    userId: { 
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true
    }
});
export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true }
});

export const LinkModel = model("Links", LinkSchema);
