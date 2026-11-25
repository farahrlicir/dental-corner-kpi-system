import { Request, Response } from "express";
import { getAdminDashboard } from "../services/adminDashboard.service";

export const getAdminDashboardData = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getAdminDashboard();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data.",
    });
  }
};