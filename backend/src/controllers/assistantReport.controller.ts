import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getMyMonthlyReports } from "../services/assistantReport.service";

export const getMyMonthlyReportsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const reports = await getMyMonthlyReports(userId);

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ASSISTANT_PROFILE_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Assistant profile not found.",
      });
    }

    console.error("Get assistant reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve monthly reports.",
    });
  }
};