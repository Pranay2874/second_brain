import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import cors from "cors";
import { UserModel, ContentModel, LinkModel } from "./db";
import "dotenv/config";
import { UserMiddleware } from "./middleware";
import { random } from "./utils";

const JWT_PASSWORD = process.env.JWT_PASSWORD;
if (!JWT_PASSWORD) {
    throw new Error("Missing environment variable: JWT_PASSWORD");
}

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req: Request, res: Response): Promise<void> => {
    const schema = z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(3).max(300),
    });

    const parsedData = schema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid username or password",
            error: parsedData.error,
        });
        return;
    }

    const { username, password } = parsedData.data;

    try {
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ username, password: hashedPassword });

        const token = jwt.sign({ userId: user._id }, JWT_PASSWORD);

        res.status(201).json({ message: "You are signed up", token });
    } catch (e) {
        res.status(500).json({ message: "Internal server error", error: e });
    }
});

app.post("/api/v1/signin", async (req: Request, res: Response): Promise<void> => {
    const schema = z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(3).max(300),
    });

    const parsedData = schema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Invalid username or password",
            error: parsedData.error,
        });
        return;
    }

    const { username, password } = parsedData.data;

    try {
        const user = await UserModel.findOne({ username });
        if (!user || !user.password) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = jwt.sign({ userId: user._id }, JWT_PASSWORD, {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "Successfully signed in", token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});

app.post("/api/v1/content", UserMiddleware, async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const content = await ContentModel.create({
            link: req.body.link,
            type: req.body.type,
            title: req.body.title,
            userId: req.userId,
            tags: [],
        });

        res.status(200).json({ message: "Content added", content }); 
    } catch (error) {
        res.status(500).json({ message: "Error adding content", error });
    }
});


app.get("/api/v1/content", UserMiddleware, async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const content = await ContentModel.find({ userId: req.userId }).populate("userId", "username");
    res.json(content);
});




app.delete("/api/v1/content", UserMiddleware, async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.body; 

    if (!req.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if (!contentId) {
        res.status(400).json({ message: "Missing contentId" });
        return;
    }

    try {
        const deletedContent = await ContentModel.findOneAndDelete({ _id: contentId, userId: req.userId });

        if (!deletedContent) {
            res.status(404).json({ message: "Content not found" });
            return;
        }

        res.json({ message: "Deleted successfully", deletedContent });
    } catch (error) {
        console.error("Error deleting content:", error);
        res.status(500).json({ message: "Error deleting content", error });
    }
});





app.post("/api/v1/brain/share", UserMiddleware, async (req: Request, res: Response): Promise<void> => {
    if (!req.userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const { share } = req.body;
    if (share) {
        const existingLink = await LinkModel.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash });
            return;
        }

        const hash = random(10);
        await LinkModel.create({ userId: req.userId, hash });
        res.json({ hash });
    } else {
        await LinkModel.deleteOne({ userId: req.userId });
        res.json({ message: "Removed link" });
    }
});

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response): Promise<void> => {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({ hash });
    if (!link) {
        res.status(404).json({ message: "Invalid share link" });
        return;
    }

    const content = await ContentModel.find({ userId: link.userId });
    const user = await UserModel.findOne({ _id: link.userId });

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.json({
        username: user.username,
        content,
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
