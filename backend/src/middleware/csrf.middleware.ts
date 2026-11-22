import { Request, Response, NextFunction } from "express";

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const origin = req.get("Origin");

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    origin &&
    origin !== allowedOrigin
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin",
    });
  }

  next();
}