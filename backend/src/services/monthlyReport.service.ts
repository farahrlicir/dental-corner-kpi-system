
import prisma from "../config/prisma";
import { MonthlyReportQuery } from "../validators/monthlyReport.validator";

const average = (values: number[]): number | null => {
  if (values.length === 0) return null;

  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)
  );
};

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
          status: "APPROVED",
          dentistId: { not: null },
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
  month: number,
  generationType: "MANUAL" | "AUTOMATIC" = "MANUAL"
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
          select: { fullName: true },
        },
      },
    }),

    prisma.evaluation.findMany({
      where: {
        status: "APPROVED",
        dentistId: { not: null },
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
        configuration: {
          include: {
            criteria: true,
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

    // Group evaluations by dentist.
    const dentistGroups = new Map<string, typeof assistantEvaluations>();

    for (const evaluation of assistantEvaluations) {
      if (!evaluation.dentistId) continue;

      const group = dentistGroups.get(evaluation.dentistId) ?? [];
      group.push(evaluation);
      dentistGroups.set(evaluation.dentistId, group);
    }

    const dentistCount = dentistGroups.size;
    const evaluationCount = assistantEvaluations.length;

    // Each dentist contributes equally to the monthly overall score.
    const dentistOverallAverages = Array.from(
      dentistGroups.values()
    ).map((dentistEvaluations) =>
      average(
        dentistEvaluations.map((evaluation) =>
          Number(evaluation.overallScore)
        )
      )
    );

    const overallScore = average(
      dentistOverallAverages.filter(
        (score): score is number => score !== null
      )
    );

    // Calculate KPI averages separately for each dentist.
    const criterionGroups = new Map<
      string,
      {
        criterionName: string;
        dentists: Map<
          string,
          { scores: number[]; weights: number[] }
        >;
      }
    >();

    for (const [dentistId, dentistEvaluations] of dentistGroups) {
      for (const evaluation of dentistEvaluations) {
        for (const item of evaluation.items) {
          const configurationItem = item.configurationItem;
          const criterionId = configurationItem.criterionId;

          let criterion = criterionGroups.get(criterionId);

          if (!criterion) {
            criterion = {
              criterionName: configurationItem.criterionName,
              dentists: new Map(),
            };
            criterionGroups.set(criterionId, criterion);
          }

          let dentistData = criterion.dentists.get(dentistId);

          if (!dentistData) {
            dentistData = { scores: [], weights: [] };
            criterion.dentists.set(dentistId, dentistData);
          }

          dentistData.scores.push(Number(item.score));
          dentistData.weights.push(Number(configurationItem.weight));
        }
      }
    }

    const kpiScores = Array.from(criterionGroups.entries()).map(
      ([criterionId, criterion]) => {
        const dentistScoreAverages: number[] = [];
        const dentistWeightAverages: number[] = [];

        for (const dentistData of criterion.dentists.values()) {
          const score = average(dentistData.scores);
          const weight = average(dentistData.weights);

          if (score !== null) dentistScoreAverages.push(score);
          if (weight !== null) dentistWeightAverages.push(weight);
        }

        return {
          criterionId,
          criterionName: criterion.criterionName,
          averageScore: average(dentistScoreAverages) ?? 0,
          averageWeight: average(dentistWeightAverages) ?? 0,
        };
      }
    );

    // Calculate average KPI coverage per dentist, then across dentists.
    const dentistCoverageAverages: number[] = [];

    for (const dentistEvaluations of dentistGroups.values()) {
      const evaluationCoverages: number[] = [];

      for (const evaluation of dentistEvaluations) {
        const totalConfigurationWeight =
          evaluation.configuration.criteria.reduce(
            (sum, criterion) => sum + Number(criterion.weight),
            0
          );

        const selectedWeight = evaluation.items.reduce(
          (sum, item) =>
            sum + Number(item.configurationItem.weight),
          0
        );

        if (totalConfigurationWeight > 0) {
          evaluationCoverages.push(
            (selectedWeight / totalConfigurationWeight) * 100
          );
        }
      }

      const dentistCoverage = average(evaluationCoverages);

      if (dentistCoverage !== null) {
        dentistCoverageAverages.push(dentistCoverage);
      }
    }

    const averageKpiCoverage = average(dentistCoverageAverages);

    const existingReport = await prisma.monthlyReport.findUnique({
      where: {
        assistantId_year_month_generationType: {
          assistantId: assistant.id,
          year,
          month,
          generationType,
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
          assistantId_year_month_generationType: {
            assistantId: assistant.id,
            year,
            month,
            generationType,
          },
        },
        create: {
          assistantId: assistant.id,
          year,
          month,
          generationType,
          overallScore,
          evaluationCount,
          dentistCount,
          averageKpiCoverage,
          status: "DRAFT",
        },
        update: {
          overallScore,
          evaluationCount,
          dentistCount,
          averageKpiCoverage,
          status: "DRAFT",
        },
      });

      await tx.monthlyReportKpiScore.deleteMany({
        where: { reportId: report.id },
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
    generationType,
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

  // Reports with zero eligible evaluations can also be finalized.
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
            select: { fullName: true },
          },
        },
      },
      kpiScores: true,
    },
  });
};
