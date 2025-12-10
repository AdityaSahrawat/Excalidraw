import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const jwt_Secret = process.env.JWT_SECRET!

export function UserMiddleware(req: Request, res: Response, next: NextFunction): void {

  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring('Bearer '.length).trim();
    }
  }

  if (!token && req.cookies?.ws_token) {
    token = req.cookies.ws_token;
  }

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwt_Secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
    });
    return;
  }
}
