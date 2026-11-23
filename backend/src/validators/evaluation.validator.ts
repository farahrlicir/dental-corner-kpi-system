
import { z } from "zod";

export const createEvaluationSchema = z.object({
  assistantId: z.string().uuid("Invalid assistant ID."),

  ratings: z
    .array(
      z.object({
        configurationItemId: z.string().uuid(
          "Invalid KPI configuration item ID."
        ),
        rating: z.number().int().min(1).max(5),
      })
    )
    .min(1, "At least one KPI rating is required."),

  observation: z
    .string()
    .trim()
    .max(2000, "Observation cannot exceed 2000 characters.")
    .optional()
    .nullable(),
});
export const updateEvaluationSchema = z.object({
  ratings: z
    .array(
      z.object({
        configurationItemId: z.string().uuid(
          "Invalid KPI configuration item ID."
        ),
        rating: z.number().int().min(1).max(5),
      })
    )
    .min(1, "At least one KPI rating is required."),

  observation: z
    .string()
    .trim()
    .max(2000, "Observation cannot exceed 2000 characters.")
    .optional()
    .nullable(),
});

export type UpdateEvaluationInput = z.infer<
  typeof updateEvaluationSchema
>;

export const evaluationHistoryQuerySchema = z.object({
  assistantId: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
});

export type CreateEvaluationInput = z.infer<
  typeof createEvaluationSchema
>;
