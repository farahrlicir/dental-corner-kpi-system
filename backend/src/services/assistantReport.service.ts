
import prisma from "../config/prisma";

const ALGERIA_OFFSET_MS = 60 * 60 * 1000;

const getAlgeriaMonthRange = (year: number, month: number) => {
  const startDate = new Date(
    Date.UTC(year, month - 1, 1) - ALGERIA_OFFSET_MS
  );

  const endDate = new Date(
    Date.UTC(year, month, 1) - ALGERIA_OFFSET_MS
  );

  return { startDate, endDate };
};

export const getMyMonthlyReports = async (userId: string) => {
  const assistant = await prisma.assistant.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!assistant) {
    throw new Error("ASSISTANT_PROFILE_NOT_FOUND");
  }

  const reports = await prisma.monthlyReport.findMany({
    where: {
      assistantId: assistant.id,
      status: "FINALIZED",
      generationType: "AUTOMATIC",
    },
    select: {
      id: true,
      year: true,
      month: true,
      overallScore: true,
      evaluationCount: true,
      dentistCount: true,
      averageKpiCoverage: true,
      status: true,
      generationType: true,
      finalizedAt: true,
      createdAt: true,
      kpiScores: {
        select: {
          criterionName: true,
          averageWeight: true,
          averageScore: true,
        },
        orderBy: {
          criterionName: "asc",
        },
      },
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });

  return Promise.all(
    reports.map(async (report) => {
      const { startDate, endDate } = getAlgeriaMonthRange(
        report.year,
        report.month
      );

      const evaluations = await prisma.evaluation.findMany({
        where: {
          assistantId: assistant.id,
          status: "APPROVED",
          dentistId: { not: null },
          submittedAt: {
            gte: startDate,
            lt: endDate,
          },
          observation: { not: null },
        },
        select: {
          observation: true,
        },
        orderBy: {
          submittedAt: "asc",
        },
      });

      const observations = [
        ...new Set(
          evaluations
            .map((evaluation) => evaluation.observation?.trim())
            .filter((observation): observation is string =>
              Boolean(observation)
            )
        ),
      ];

      return {
        ...report,
        observations,
      };
    })
  );
};
