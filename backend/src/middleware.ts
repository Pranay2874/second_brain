import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";

const JWT_PASSWORD = process.env.JWT_PASSWORD;
if (!JWT_PASSWORD) {
    throw new Error("Missing environment variable: JWT_PASSWORD");
}

// Extend the Request type to include the userId property
declare module 'express' {
    interface Request {
        userId?: string;
    }
}

export const UserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  if (!header) {
      res.status(403).json({
          message: "You are not logged in"
      });
      return;
  }

  try {
      const decoded = jwt.verify(header, JWT_PASSWORD) as JwtPayload;
      req.userId = decoded.userId;
      console.log("Decoded userId:", req.userId);
      next();
  } catch (error) {
      res.status(403).json({
          message: "Invalid token"
      });
  }
};