import { z } from "zod";

export const updateDentistStatusSchema = z.object({
  action: z.enum([
    "APPROVE",
    "REJECT",
    "ACTIVATE",
    "DEACTIVATE",
  ]),
});

export const dentistIdSchema = z.string().uuid();