
import { Request, Response } from "express";
import {
  getKpiConfigurations,
  saveKpiConfiguration,
  publishKpiConfiguration,
  createKpiDraft,
} from "../services/adminKpi.service";
import {
  saveKpiConfigurationSchema,
  kpiConfigurationIdSchema,
} from "../validators/adminKpi.validator";



export const getConfigurations = async (_req: Request, res: Response) => {
  try {
    const data = await getKpiConfigurations();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET KPI CONFIGURATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve KPI configurations.",
    });
  }
};

export const createDraft = async (_req: Request, res: Response) => {
  try {
    const data = await createKpiDraft();

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleKpiError(error, res);
  }
};

export const saveDraft = async (req: Request, res: Response) => {
  try {
    const idResult = kpiConfigurationIdSchema.safeParse(req.params.id);
    const bodyResult = saveKpiConfigurationSchema.safeParse(req.body);

    if (!idResult.success || !bodyResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid KPI configuration data.",
      });
    }

    const data = await saveKpiConfiguration(idResult.data, bodyResult.data);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleKpiError(error, res);
  }
};


export const publishDraft = async (req: Request, res: Response) => {
  try {
    const idResult = kpiConfigurationIdSchema.safeParse(req.params.id);
    const bodyResult = saveKpiConfigurationSchema.safeParse(req.body);

    if (!idResult.success || !bodyResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid KPI configuration data.",
      });
    }

    const data = await publishKpiConfiguration(
      idResult.data,
      bodyResult.data
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return handleKpiError(error, res);
  }
};

const handleKpiError = (error: unknown, res: Response) => {
  const messages: Record<string, string> = {
    KPI_CONFIGURATION_NOT_FOUND: "KPI configuration not found.",
    KPI_CONFIGURATION_NOT_EDITABLE: "Only draft configurations can be changed.",
    DUPLICATE_KPI_CRITERION: "Criterion names must be unique.",
    DUPLICATE_DISPLAY_ORDER: "Display order values must be unique.",
    EMPTY_KPI_CONFIGURATION: "Add at least one criterion before publishing.",
    KPI_WEIGHTS_MUST_EQUAL_100: "The total KPI weight must equal 100%.",
    KPI_DRAFT_ALREADY_EXISTS: "An editable draft already exists.",
NO_PUBLISHED_KPI_CONFIGURATION:
  "Publish the first KPI configuration before creating another draft.",
  };

  const code = error instanceof Error ? error.message : "";

  return res.status(code in messages ? 400 : 500).json({
    success: false,
    message: messages[code] || "An unexpected KPI error occurred.",
  });
};
