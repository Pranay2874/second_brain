import mongoose, { Schema, model } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL as string;
if (!MONGO_URL) {
    throw new Error("MONGO_URL is not defined in .env");
}

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URL)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String }
});

// ✅ Explicitly using `model` from mongoose
export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,  // ✅ Fix: Use `link` instead of `Link`
    tags: [{ type: mongoose.Types.ObjectId, ref: "tag" }],
    userId: { 
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true
    }
});

// ✅ Explicitly using `model` from mongoose
export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: String,
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true }
});

// ✅ Explicitly using `model` from mongoose
export const LinkModel = model("Links", LinkSchema);
