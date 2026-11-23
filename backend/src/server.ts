import prisma from "./config/prisma";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { csrfProtection } from "./middleware/csrf.middleware";
dotenv.config();
import adminDentistRoutes from "./routes/adminDentist.routes";
import adminAssistantRoutes from "./routes/adminAssistant.routes";
import adminKpiRoutes from "./routes/adminKpi.routes";
import evaluationRoutes from "./routes/evaluation.routes";
import monthlyReportRoutes from "./routes/monthlyReport.routes";
import assistantReportRoutes from "./routes/assistantReport.routes";
import { startMonthlyReportScheduler } from "./jobs/monthlyReport.scheduler";

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// CSRF protection
app.use(csrfProtection);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dentists", adminDentistRoutes);
app.use("/api/assistants", adminAssistantRoutes);
app.use("/api/kpi", adminKpiRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/monthly-reports", monthlyReportRoutes);
app.use("/api/assistant-reports", assistantReportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dental Clinic KPI API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Start server
// Start server
async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully!");

    startMonthlyReportScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
}

startServer();