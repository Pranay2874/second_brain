import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";

const JWT_PASSWORD = process.env.JWT_PASSWORD;
if (!JWT_PASSWORD) {
    throw new Error("Missing environment variable: JWT_PASSWORD");
}

declare module "express" {
    interface Request {
        userId?: string;
    }
}

export const UserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers["authorization"];

    if (!header) {
        res.status(401).json({ message: "Unauthorized User" });
        return;
    }

    try {
        const decoded = jwt.verify(header, JWT_PASSWORD) as JwtPayload;
        req.userId = decoded.userId;
        next(); 
    } catch (error) {
        res.status(401).json({ message: "Unauthorized User" });
    }
};
