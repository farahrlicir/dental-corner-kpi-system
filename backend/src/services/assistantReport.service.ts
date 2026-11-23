
import prisma from "../config/prisma";

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

  return reports;
};
