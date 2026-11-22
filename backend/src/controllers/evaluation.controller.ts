
import { Request, Response } from "express";
import {
  createEvaluationSchema,
  evaluationHistoryQuerySchema,
} from "../validators/evaluation.validator";
import {
  getEvaluationFormData,
  createEvaluation,
  getEvaluationHistory,
} from "../services/evaluation.service";

export const getEvaluationForm = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getEvaluationFormData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get evaluation form error:", error);

    if (
      error instanceof Error &&
      error.message === "NO_PUBLISHED_KPI_CONFIGURATION"
    ) {
      return res.status(404).json({
        success: false,
        message: "No published KPI configuration found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve evaluation form data.",
    });
  }
};

export const submitEvaluation = async (
  req: Request,
  res: Response
) => {
  const validation = createEvaluationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation data.",
      errors: validation.error.flatten(),
    });
  }

  try {
    const evaluation = await createEvaluation(validation.data);

    return res.status(201).json({
      success: true,
      message: "Evaluation submitted successfully.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Submit evaluation error:", error);

    if (error instanceof Error) {
      if (error.message === "ASSISTANT_NOT_FOUND_OR_INACTIVE") {
        return res.status(404).json({
          success: false,
          message: "Assistant not found or inactive.",
        });
      }

      if (error.message === "NO_PUBLISHED_KPI_CONFIGURATION") {
        return res.status(404).json({
          success: false,
          message: "No published KPI configuration found.",
        });
      }

      if (error.message === "INVALID_EVALUATION_CRITERIA") {
        return res.status(400).json({
          success: false,
          message: "All published KPI criteria must be rated exactly once.",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit evaluation.",
    });
  }
};

export const getEvaluationHistoryController = async (
  req: Request,
  res: Response
) => {
  const validation = evaluationHistoryQuerySchema.safeParse(
    req.query
  );

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation history filters.",
      errors: validation.error.flatten(),
    });
  }

  try {
    const evaluations = await getEvaluationHistory(
      validation.data
    );

    return res.status(200).json({
      success: true,
      data: evaluations,
    });
  } catch (error) {
    console.error("Get evaluation history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve evaluation history.",
    });
  }
};
