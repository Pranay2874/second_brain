import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URL = process.env.MONGO_URL as string;
if (!MONGO_URL) {
    throw new Error("MONGO_URL is not defined in .env")
}

mongoose.connect(MONGO_URL)

// users schema
const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String }
});

export const UserModel = mongoose.model("User", UserSchema);

// content schema
const ContentSchema = new Schema({
    title: String,
    link: String,
    tag: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
    UserId: { type: mongoose.Types.ObjectId, ref: 'User', required: true }

})

export const ContentModel = mongoose.model("Content", ContentSchema);

//link schema
const LinkSchema = new Schema({
    hash: String,
    UserId: { type: mongoose.Types.ObjectId, ref: 'User', required: true ,unique:true}

})

export const LinkModel = mongoose.model("Link", LinkSchema);