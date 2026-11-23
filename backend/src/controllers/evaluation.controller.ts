
import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createEvaluationSchema,
  evaluationHistoryQuerySchema,
  updateEvaluationSchema,
} from "../validators/evaluation.validator";
import {
  getEvaluationFormData,
  createEvaluation,
  getEvaluationHistory,
  getPendingEvaluations,
  updateEvaluation,
  approveEvaluation,
  rejectEvaluation,
} from "../services/evaluation.service";

const evaluationIdSchema = z.string().uuid();

const validateEvaluationId = (id: string) => {
  return evaluationIdSchema.safeParse(id);
};

export const getEvaluationForm = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const data = await getEvaluationFormData();

    return res.status(200).json({ success: true, data });
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
  req: AuthRequest,
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
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const evaluation = await createEvaluation(
      validation.data,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      message: "Evaluation submitted successfully and is pending admin approval.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Submit evaluation error:", error);

    if (error instanceof Error) {
      const messages: Record<string, { status: number; message: string }> = {
        DENTIST_PROFILE_NOT_FOUND: {
          status: 403,
          message: "Dentist profile not found.",
        },
        ASSISTANT_NOT_FOUND_OR_INACTIVE: {
          status: 404,
          message: "Assistant not found or inactive.",
        },
        NO_PUBLISHED_KPI_CONFIGURATION: {
          status: 404,
          message: "No published KPI configuration found.",
        },
        INVALID_EVALUATION_CRITERIA: {
          status: 400,
          message: "Select valid KPI criteria without duplicates.",
        },
      };

      const knownError = messages[error.message];

      if (knownError) {
        return res.status(knownError.status).json({
          success: false,
          message: knownError.message,
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
  req: AuthRequest,
  res: Response
) => {
  const validation = evaluationHistoryQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation history filters.",
      errors: validation.error.flatten(),
    });
  }

  try {
    const evaluations = await getEvaluationHistory(validation.data);

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

export const getPendingEvaluationsController = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const evaluations = await getPendingEvaluations();

    return res.status(200).json({
      success: true,
      data: evaluations,
    });
  } catch (error) {
    console.error("Get pending evaluations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pending evaluations.",
    });
  }
};

export const updateEvaluationController = async (
  req: AuthRequest,
  res: Response
) => {
  const idValidation = validateEvaluationId(req.params.evaluationId);

  if (!idValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation ID.",
    });
  }

  const validation = updateEvaluationSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation data.",
      errors: validation.error.flatten(),
    });
  }

  try {
    const evaluation = await updateEvaluation(
      idValidation.data,
      validation.data
    );

    return res.status(200).json({
      success: true,
      message: "Evaluation updated successfully.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Update evaluation error:", error);

    if (error instanceof Error) {
      if (error.message === "EVALUATION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Evaluation not found.",
        });
      }

      if (error.message === "EVALUATION_NOT_PENDING") {
        return res.status(409).json({
          success: false,
          message: "Only pending evaluations can be edited.",
        });
      }

      if (error.message === "INVALID_EVALUATION_CRITERIA") {
        return res.status(400).json({
          success: false,
          message: "Select valid KPI criteria without duplicates.",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update evaluation.",
    });
  }
};

export const approveEvaluationController = async (
  req: AuthRequest,
  res: Response
) => {
  const idValidation = validateEvaluationId(req.params.evaluationId);

  if (!idValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation ID.",
    });
  }

  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const evaluation = await approveEvaluation(
      idValidation.data,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Evaluation approved successfully.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Approve evaluation error:", error);

    if (error instanceof Error) {
      if (error.message === "EVALUATION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Evaluation not found.",
        });
      }

      if (error.message === "EVALUATION_NOT_PENDING") {
        return res.status(409).json({
          success: false,
          message: "Only pending evaluations can be approved.",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to approve evaluation.",
    });
  }
};

export const rejectEvaluationController = async (
  req: AuthRequest,
  res: Response
) => {
  const idValidation = validateEvaluationId(req.params.evaluationId);

  if (!idValidation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation ID.",
    });
  }

  try {
    const evaluation = await rejectEvaluation(idValidation.data);

    return res.status(200).json({
      success: true,
      message: "Evaluation rejected successfully.",
      data: evaluation,
    });
  } catch (error) {
    console.error("Reject evaluation error:", error);

    if (error instanceof Error) {
      if (error.message === "EVALUATION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Evaluation not found.",
        });
      }

      if (error.message === "EVALUATION_NOT_PENDING") {
        return res.status(409).json({
          success: false,
          message: "Only pending evaluations can be rejected.",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to reject evaluation.",
    });
  }
};
