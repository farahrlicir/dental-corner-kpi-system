import { Request, Response } from "express";

import {
  getAssistants as getAssistantsService,
  createAssistant as createAssistantService,
  updateAssistant as updateAssistantService,
  updateAssistantStatus,
} from "../services/adminAssistant.service";

import {
  createAssistantSchema,
  updateAssistantSchema,
  assistantIdSchema,
  assistantStatusActionSchema,
} from "../validators/adminAssistant.validator";

export async function getAssistants(req: Request, res: Response) {
  try {
    const assistants = await getAssistantsService();

    return res.status(200).json({
      success: true,
      data: assistants,
    });
  } catch (error) {
    console.error("Get assistants error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assistants.",
    });
  }
}

export async function createAssistant(req: Request, res: Response) {
  try {
    const validation = createAssistantSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid assistant data.",
        errors: validation.error.flatten(),
      });
    }

    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const assistant = await createAssistantService(
      validation.data,
      adminId
    );

    return res.status(201).json({
      success: true,
      data: assistant,
      message: "Assistant created successfully.",
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Create assistant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assistant.",
    });
  }
}

export async function editAssistant(req: Request, res: Response) {
  try {
    const idValidation = assistantIdSchema.safeParse(req.params.id);
    const bodyValidation = updateAssistantSchema.safeParse(req.body);

    if (!idValidation.success || !bodyValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid assistant data.",
      });
    }

    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const assistant = await updateAssistantService(
      idValidation.data,
      bodyValidation.data,
      adminId
    );

    return res.status(200).json({
      success: true,
      data: assistant,
      message: "Assistant updated successfully.",
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.message === "ASSISTANT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Assistant not found.",
      });
    }

    if (error.message === "ASSISTANT_ARCHIVED") {
      return res.status(409).json({
        success: false,
        message: "Archived assistants cannot be edited.",
      });
    }

    console.error("Edit assistant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update assistant.",
    });
  }
}

export async function changeAssistantStatus(req: Request, res: Response) {
  try {
    const idValidation = assistantIdSchema.safeParse(req.params.id);
    const bodyValidation = assistantStatusActionSchema.safeParse(req.body);

    if (!idValidation.success || !bodyValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid status request.",
      });
    }

    const adminId = req.user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const assistant = await updateAssistantStatus(
      idValidation.data,
      bodyValidation.data.action,
      adminId
    );

    return res.status(200).json({
      success: true,
      data: assistant,
      message: "Assistant status updated successfully.",
    });
  } catch (error: any) {
    if (error.message === "ASSISTANT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Assistant not found.",
      });
    }

    if (
      error.message === "ASSISTANT_ARCHIVED" ||
      error.message === "INVALID_STATUS_TRANSITION"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Change assistant status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update assistant status.",
    });
  }
}