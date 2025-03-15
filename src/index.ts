import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";

import { UserModel, ContentModel } from "./db";
import "dotenv/config";
import { UserMiddleware } from "./middleware";

const JWT_PASSWORD = process.env.JWT_PASSWORD;
if (!JWT_PASSWORD) {
    throw new Error("Missing environment variable: JWT_PASSWORD");
}

const app = express();
app.use(express.json());

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

        const hashedPassword = await bcrypt.hash(password, 5);
        await UserModel.create({ username, password: hashedPassword });

        res.json({ message: "You are signed up" });
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
    const { link, type } = req.body;

    try {
        await ContentModel.create({
            link,
            type,
            // @ts-ignore
            UserId: req.userId,
            tag: [],
        });

        res.json({ message: "Content added" });
    } catch (error) {
        res.status(500).json({ message: "Error adding content", error });
    }
});

app.get("/api/v1/content", UserMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const content = await ContentModel.find({ UserId: userId }).populate("UserId", "username");

        res.json({ content });
    } catch (error) {
        res.status(500).json({ message: "Error fetching content", error });
    }
});

app.delete("/api/v1/content", UserMiddleware, async (req: Request, res: Response): Promise<void> => {
    const { contentId } = req.body;

    try {
        const result = await ContentModel.deleteMany({
            contentId,
            // @ts-ignore
            UserId: req.userId,
        });

        res.json({ message: "Content deleted", deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: "Error deleting content", error });
    }
});

app.post("/api/v1/brain/share", (req: Request, res: Response): void => {
    res.json({ message: "Brain share route is not implemented yet" });
});

app.get("/api/v1/brain/:shareLink", (req: Request, res: Response): void => {
    res.json({ message: "Brain fetch route is not implemented yet" });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
