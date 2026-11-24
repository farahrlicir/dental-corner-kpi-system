
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import prisma from "../config/prisma";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    roles: string[];
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        tokenVersion: true,
        status: true,
      },
    });

    if (
      !user ||
      user.status !== "ACTIVE" ||
      user.tokenVersion !== decoded.tokenVersion
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = {
      userId: decoded.userId,
      roles: decoded.roles,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
