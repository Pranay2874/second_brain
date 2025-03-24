import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

const JWT_PASSWORD = process.env.JWT_PASSWORD;
if (!JWT_PASSWORD) {
    throw new Error("Missing environment variable: JWT_PASSWORD");
}

export const UserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const header = req.headers["authorization"];
        if (!header) {
            res.status(401).json({ message: "Unauthorized: Missing token" });
            return;
        }

        const decoded = jwt.verify(header, JWT_PASSWORD) as JwtPayload;
        req.userId = decoded.userId;

        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
