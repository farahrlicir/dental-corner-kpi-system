
import { z } from "zod";

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  assistantId: z.string().uuid().optional(),
});

export const finalizeMonthlyReportSchema = z.object({
  reportId: z.string().uuid("Invalid monthly report ID."),
});

export type MonthlyReportQuery = z.infer<
  typeof monthlyReportQuerySchema
>;
export const generateMonthlyReportSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});