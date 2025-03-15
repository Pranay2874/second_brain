import {NextFunction,Request,Response} from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_PASSWORD = process.env.JWT_PASSWORD;
if (!JWT_PASSWORD) {
    throw new Error("Missing environment variable: JWT_PASSWORD");
}
export const UserMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    const header=req.headers["authorization"];
    const decoded=jwt.verify(header as string,JWT_PASSWORD)
  if(decoded){
     // @ts-ignore
    req.userId=decoded.indexOf;
    next()
  }
  else{
    res.status(403).json({
        message:"You are are not logged in"
    })
  }
}