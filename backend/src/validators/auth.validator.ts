import { z } from "zod";

export const registerDentistSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(8).max(128),
  licenseNumber: z.string().trim().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});