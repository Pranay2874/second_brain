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
    throw new Error("Missing environment variable: JWT_SECRET");
}

const app = express();
app.use(express.json());
app.use(cors());

// Signup Route
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

        const token = jwt.sign({ userId: user._id }, JWT_PASSWORD, {
            
        });

        res.status(201).json({ message: "You are signed up", token });
    } catch (e) {
        res.status(500).json({ message: "Internal server error", error: e });
    }
});

// Signin Route
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

app.post("/api/v1/content", UserMiddleware, async (req: Request, res: Response) => {
    const { link, type, title } = req.body;
    await ContentModel.create({
        link,
        type,
        title,
        userId: req.userId, 
        tags: [] 
    });

    res.json({ message: "Content added" }); 
});

// Route 4: Get User Content
app.get("/api/v1/content", UserMiddleware, async (req: Request, res: Response) => {
    const userId = req.userId;  
    const content = await ContentModel.find({ userId: userId }).populate("userId", "username");
    res.json(content);  
});

// Route 5: Delete User Content
app.delete("/api/v1/content", UserMiddleware, async (req: Request, res: Response) => {
    const contentId = req.body.contentId;


    await ContentModel.deleteMany({ contentId, userId: req.userId });
    res.json({ message: "Deleted" });
});

// Route 6: Share Content Link
app.post("/api/v1/brain/share", UserMiddleware, async (req: Request, res: Response) => {
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

// Route 7: Get Shared Content
app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
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
        content
    }); 
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});