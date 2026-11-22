
import { z } from "zod";

export const saveKpiConfigurationSchema = z.object({
  criteria: z.array(
    z.object({
      name: z.string().trim().min(2).max(150),
      weight: z.number().positive().max(100),
      displayOrder: z.number().int().positive(),
    })
  ).min(1).max(100),
});

export const kpiConfigurationIdSchema = z.string().uuid();

export const publishKpiConfigurationSchema = z.object({
  configurationId: z.string().uuid(),
});
