import prisma from "../config/prisma";

export const getMyMonthlyReports = async (userId: string) => {
  const assistant = await prisma.assistant.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!assistant) {
    throw new Error("ASSISTANT_PROFILE_NOT_FOUND");
  }

  return prisma.monthlyReport.findMany({
    where: {
      assistantId: assistant.id,
      status: "FINALIZED",
    },
    include: {
      kpiScores: {
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
};