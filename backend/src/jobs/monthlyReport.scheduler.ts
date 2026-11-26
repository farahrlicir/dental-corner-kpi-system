
import cron from "node-cron";
import { generatePreviousMonthAutomaticReports } from "../services/monthlyReport.service";

const TIME_ZONE = "Africa/Algiers";

export const startMonthlyReportScheduler = () => {
  cron.schedule(
    "5 1 1 * *",
    async () => {
      try {
        console.log("Starting automatic monthly report generation...");

        const result = await generatePreviousMonthAutomaticReports();

        console.log("Automatic monthly reports completed:", result);
      } catch (error) {
        console.error("Automatic monthly report generation failed:", error);
      }
    },
    {
      timezone: TIME_ZONE,
    }
  );

  console.log("Monthly report scheduler started (Africa/Algiers).");
};
