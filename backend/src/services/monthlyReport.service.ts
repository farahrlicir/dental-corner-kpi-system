
import prisma from "../config/prisma";
import { MonthlyReportQuery } from "../validators/monthlyReport.validator";


export const getMonthlyReports = async (
  filters: MonthlyReportQuery
) => {
  const where: any = {};

  if (filters.year !== undefined) where.year = filters.year;
  if (filters.month !== undefined) where.month = filters.month;
  if (filters.assistantId) where.assistantId = filters.assistantId;

  const reports = await prisma.monthlyReport.findMany({
    where,
    include: {
      assistant: {
        include: {
          user: { select: { fullName: true } },
        },
      },
      kpiScores: true,
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
      { assistant: { user: { fullName: "asc" } } },
    ],
  });

  return Promise.all(
    reports.map(async (report) => {
      const startDate = new Date(
        Date.UTC(report.year, report.month - 1, 1)
      );

      const endDate = new Date(
        Date.UTC(report.year, report.month, 1)
      );

      const evaluations = await prisma.evaluation.findMany({
        where: {
          assistantId: report.assistantId,
          submittedAt: {
            gte: startDate,
            lt: endDate,
          },
          observation: { not: null },
        },
        select: { observation: true },
        orderBy: { submittedAt: "asc" },
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


export const generateMonthlyReports = async (
  year: number,
  month: number
) => {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;

  if (
    year > currentYear ||
    (year === currentYear && month >= currentMonth)
  ) {
    throw new Error("MONTH_NOT_COMPLETED");
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const [assistants, evaluations] = await Promise.all([
    prisma.assistant.findMany({
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    }),

    prisma.evaluation.findMany({
      where: {
        submittedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        items: {
          include: {
            configurationItem: true,
          },
        },
      },
      orderBy: {
        submittedAt: "asc",
      },
    }),
  ]);

  let generated = 0;
  let updated = 0;
  let skipped = 0;

  for (const assistant of assistants) {
    const assistantEvaluations = evaluations.filter(
      (evaluation) => evaluation.assistantId === assistant.id
    );

    const evaluationCount = assistantEvaluations.length;

    const overallScore =
      evaluationCount > 0
        ? assistantEvaluations.reduce(
            (sum, evaluation) =>
              sum + Number(evaluation.overallScore),
            0
          ) / evaluationCount
        : null;

    // Aggregate KPI scores by criterion.
    const criterionMap = new Map<
      string,
      {
        criterionName: string;
        totalScore: number;
        totalWeight: number;
        count: number;
      }
    >();

    for (const evaluation of assistantEvaluations) {
      for (const item of evaluation.items) {
        const configurationItem = item.configurationItem;
        const criterionId = configurationItem.criterionId;

        const existing = criterionMap.get(criterionId);

        if (existing) {
          existing.criterionName =
            configurationItem.criterionName;
          existing.totalScore += Number(item.score);
          existing.totalWeight += Number(
            configurationItem.weight
          );
          existing.count += 1;
        } else {
          criterionMap.set(criterionId, {
            criterionName: configurationItem.criterionName,
            totalScore: Number(item.score),
            totalWeight: Number(configurationItem.weight),
            count: 1,
          });
        }
      }
    }

    const kpiScores = Array.from(
      criterionMap.entries()
    ).map(([criterionId, data]) => ({
      criterionId,
      criterionName: data.criterionName,
      averageScore: Number(
        (data.totalScore / data.count).toFixed(2)
      ),
      averageWeight: Number(
        (data.totalWeight / data.count).toFixed(2)
      ),
    }));

    const existingReport = await prisma.monthlyReport.findUnique({
      where: {
        assistantId_year_month: {
          assistantId: assistant.id,
          year,
          month,
        },
      },
    });

    // Never modify an already finalized report.
    if (existingReport?.status === "FINALIZED") {
      skipped++;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const report = await tx.monthlyReport.upsert({
        where: {
          assistantId_year_month: {
            assistantId: assistant.id,
            year,
            month,
          },
        },
        create: {
          assistantId: assistant.id,
          year,
          month,
          overallScore,
          evaluationCount,
          status: "DRAFT",
        },
        update: {
          overallScore,
          evaluationCount,
          status: "DRAFT",
        },
      });

      await tx.monthlyReportKpiScore.deleteMany({
        where: {
          reportId: report.id,
        },
      });

      if (kpiScores.length > 0) {
        await tx.monthlyReportKpiScore.createMany({
          data: kpiScores.map((score) => ({
            reportId: report.id,
            criterionId: score.criterionId,
            criterionName: score.criterionName,
            averageWeight: score.averageWeight,
            averageScore: score.averageScore,
          })),
        });
      }
    });

    if (existingReport) {
      updated++;
    } else {
      generated++;
    }
  }

  return {
    year,
    month,
    totalAssistants: assistants.length,
    generated,
    updated,
    skipped,
  };
};

export const finalizeMonthlyReport = async (
  reportId: string
) => {
  const report = await prisma.monthlyReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error("MONTHLY_REPORT_NOT_FOUND");
  }

  if (report.status === "FINALIZED") {
    throw new Error("MONTHLY_REPORT_ALREADY_FINALIZED");
  }

  if (report.evaluationCount === 0) {
    throw new Error("NO_EVALUATIONS_TO_FINALIZE");
  }

  return prisma.monthlyReport.update({
    where: { id: reportId },
    data: {
      status: "FINALIZED",
      finalizedAt: new Date(),
    },
    include: {
      assistant: {
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
      kpiScores: true,
    },
  });
};
