
import { Request, Response } from "express";

import {
  monthlyReportQuerySchema,
  finalizeMonthlyReportSchema,
} from "../validators/monthlyReport.validator";

import {
  getMonthlyReports,
  generatePreviousMonthAutomaticReports,
  finalizeMonthlyReport,
} from "../services/monthlyReport.service";

export const getMonthlyReportsController = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = monthlyReportQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid monthly report filters.",
        errors: validation.error.flatten(),
      });
    }

    const reports = await getMonthlyReports(validation.data);

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Get monthly reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve monthly reports.",
    });
  }
};

export const generateMissingMonthlyReportsController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await generatePreviousMonthAutomaticReports();

    return res.status(200).json({
      success: true,
      message: "Missing automatic monthly reports processed successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "MONTH_NOT_COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Reports can only be generated for completed months.",
      });
    }

    console.error("Generate missing monthly reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate missing monthly reports.",
    });
  }
};

export const finalizeMonthlyReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = finalizeMonthlyReportSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid monthly report ID.",
        errors: validation.error.flatten(),
      });
    }

    const report = await finalizeMonthlyReport(validation.data.reportId);

    return res.status(200).json({
      success: true,
      message: "Monthly report finalized successfully.",
      data: report,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "MONTHLY_REPORT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Monthly report not found.",
        });
      }

      if (error.message === "MONTHLY_REPORT_ALREADY_FINALIZED") {
        return res.status(409).json({
          success: false,
          message: "This monthly report is already finalized.",
        });
      }

      if (error.message === "NO_EVALUATIONS_TO_FINALIZE") {
        return res.status(400).json({
          success: false,
          message: "A report with no evaluations cannot be finalized.",
        });
      }
    }

    console.error("Finalize monthly report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to finalize monthly report.",
    });
  }
};
