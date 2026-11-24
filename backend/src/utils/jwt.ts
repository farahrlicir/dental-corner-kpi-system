
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  roles: string[];
  tokenVersion: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded === "string" ||
    typeof decoded.tokenVersion !== "number"
  ) {
    throw new Error("INVALID_TOKEN");
  }

  return decoded as JwtPayload;
}
