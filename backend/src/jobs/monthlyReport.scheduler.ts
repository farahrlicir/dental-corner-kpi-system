
import cron from "node-cron";
import { generateMonthlyReports } from "../services/monthlyReport.service";

const TIME_ZONE = "Africa/Algiers";

export const startMonthlyReportScheduler = () => {
  cron.schedule(
    "5 1 1 * *",
    async () => {
      try {
        // Get the current year and month in Algeria's timezone.
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: TIME_ZONE,
          year: "numeric",
          month: "2-digit",
        }).formatToParts(new Date());

        const currentYear = Number(
          parts.find((part) => part.type === "year")?.value
        );

        const currentMonth = Number(
          parts.find((part) => part.type === "month")?.value
        );

        // Generate the previous month's reports.
        const previousDate = new Date(
          Date.UTC(currentYear, currentMonth - 2, 1)
        );

        const year = previousDate.getUTCFullYear();
        const month = previousDate.getUTCMonth() + 1;

        console.log(
          `Starting automatic monthly reports for ${year}-${String(month).padStart(2, "0")}...`
        );

        const result = await generateMonthlyReports(
          year,
          month,
          "AUTOMATIC"
        );

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
