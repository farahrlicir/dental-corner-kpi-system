import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/prisma";
import {
  dentistIdSchema,
  updateDentistStatusSchema,
} from "../validators/adminDentist.validator";

import { updateDentistStatus } from "../services/adminDentist.service";

// GET /api/dentists
export async function getDentists(
  req: AuthRequest,
  res: Response
) {
  try {
    const dentists = await prisma.user.findMany({
      where: {
        roles: {
          some: { role: "DENTIST" },
          none: { role: "ADMIN" },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: dentists.map((dentist) => ({
        id: dentist.id,
        name: dentist.fullName,
        email: dentist.email,
        status: dentist.status,
        registrationDate: dentist.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get dentists error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve dentists.",
    });
  }
}
// PATCH /api/dentists/:id/status
export async function changeDentistStatus(
  req: AuthRequest,
  res: Response
) {
  const idResult = dentistIdSchema.safeParse(req.params.id);
  const bodyResult = updateDentistStatusSchema.safeParse(req.body);

  if (!idResult.success || !bodyResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid dentist ID or action.",
    });
  }

  try {
    const dentist = await updateDentistStatus(
      idResult.data,
      req.user!.userId,
      bodyResult.data.action
    );

    return res.status(200).json({
      success: true,
      message: "Dentist account updated successfully.",
      data: dentist,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DENTIST_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Dentist not found.",
        });
      }

      if (error.message === "INVALID_STATUS_TRANSITION") {
        return res.status(409).json({
          success: false,
          message: "This action is not allowed for the current account status.",
        });
      }
    }

    console.error("Change dentist status error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not update dentist account.",
    });
  }
}