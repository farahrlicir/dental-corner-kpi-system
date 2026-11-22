
import { z } from "zod";

export const createAssistantSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(8).max(128),
});

export const updateAssistantSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional(),
});


export const assistantIdSchema = z.string().uuid();
export const assistantStatusActionSchema = z.object({
  action: z.enum(["ACTIVATE", "DEACTIVATE", "ARCHIVE"]),
});