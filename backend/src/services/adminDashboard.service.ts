
import prisma from "../config/prisma";

const TIME_ZONE = "Africa/Algiers";
const ALGERIA_OFFSET_MS = 60 * 60 * 1000;

function getCurrentPeriod() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);

  return { year, month };
}

function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1) - ALGERIA_OFFSET_MS);
  const end = new Date(Date.UTC(year, month, 1) - ALGERIA_OFFSET_MS);

  return { start, end };
}

function getPreviousPeriod(year: number, month: number) {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

function getLastSixCompletedMonths(year: number, month: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 2 - index, 1));

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
    };
  }).reverse();
}

function average(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

async function getClinicAverageScore(start: Date, end: Date) {
  const evaluations = await prisma.evaluation.findMany({
    where: {
      status: "APPROVED",
      submittedAt: { gte: start, lt: end },
      dentistId: { not: null },
    },
    select: {
      assistantId: true,
      dentistId: true,
      overallScore: true,
    },
  });

  const assistantGroups = new Map<string, Map<string, number[]>>();

  for (const evaluation of evaluations) {
    if (!evaluation.dentistId) continue;

    if (!assistantGroups.has(evaluation.assistantId)) {
      assistantGroups.set(evaluation.assistantId, new Map());
    }

    const dentistGroups = assistantGroups.get(evaluation.assistantId)!;

    if (!dentistGroups.has(evaluation.dentistId)) {
      dentistGroups.set(evaluation.dentistId, []);
    }

    dentistGroups.get(evaluation.dentistId)!.push(
      Number(evaluation.overallScore)
    );
  }

  const assistantScores: number[] = [];

  for (const dentistGroups of assistantGroups.values()) {
    const dentistAverages = Array.from(dentistGroups.values()).map(
      (scores) => average(scores)!
    );

    const assistantAverage = average(dentistAverages);

    if (assistantAverage !== null) {
      assistantScores.push(assistantAverage);
    }
  }

  return average(assistantScores);
}

function percentageTrend(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "New this month" : "No change";
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.abs(change).toFixed(1);

  return `${change >= 0 ? "+" : "-"}${rounded}% vs last month`;
}

function scoreTrend(current: number | null, previous: number | null) {
  if (current === null || previous === null) {
    return "Not enough data";
  }

  const difference = current - previous;

  if (Math.abs(difference) < 0.05) return "No change vs last month";

  return `${difference > 0 ? "+" : ""}${difference.toFixed(1)} pts vs last month`;
}

function describeActivity(action: string) {
  const descriptions: Record<string, { title: string; description: string }> = {
    ASSISTANT_CREATED: {
      title: "New assistant registered",
      description: "An assistant account was created.",
    },
    ASSISTANT_UPDATED: {
      title: "Assistant information updated",
      description: "Assistant account information was modified.",
    },
    ASSISTANT_ACTIVATED: {
      title: "Assistant activated",
      description: "An assistant account was activated.",
    },
    ASSISTANT_DEACTIVATED: {
      title: "Assistant deactivated",
      description: "An assistant account was deactivated.",
    },
    ASSISTANT_ARCHIVED: {
      title: "Assistant archived",
      description: "An assistant account was archived.",
    },
    DENTIST_APPROVE: {
      title: "Dentist approved",
      description: "A dentist account was approved.",
    },
    DENTIST_REJECT: {
      title: "Dentist rejected",
      description: "A dentist registration was rejected.",
    },
    DENTIST_ACTIVATE: {
      title: "Dentist activated",
      description: "A dentist account was activated.",
    },
    DENTIST_DEACTIVATE: {
      title: "Dentist deactivated",
      description: "A dentist account was deactivated.",
    },
  };

  return descriptions[action] ?? {
    title: "Clinic activity",
    description: "An administrative action was recorded.",
  };
}

export const getAdminDashboard = async () => {
  const { year, month } = getCurrentPeriod();
  const currentRange = getMonthRange(year, month);

  const previousPeriod = getPreviousPeriod(year, month);
  const previousRange = getMonthRange(previousPeriod.year, previousPeriod.month);

  const [
    assistantCount,
    dentistCount,
    currentEvaluationCount,
    previousEvaluationCount,
    currentAverage,
    previousAverage,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        roles: { some: { role: "ASSISTANT" } },
        status: { not: "DELETED" },
      },
    }),

    // Count dentist-only accounts, excluding the Admin account
    // that also has the DENTIST role.
    prisma.user.count({
      where: {
        AND: [
          { roles: { some: { role: "DENTIST" } } },
          { roles: { none: { role: "ADMIN" } } },
        ],
        status: { not: "DELETED" },
      },
    }),

    prisma.evaluation.count({
      where: {
        submittedAt: {
          gte: currentRange.start,
          lt: currentRange.end,
        },
      },
    }),

    prisma.evaluation.count({
      where: {
        submittedAt: {
          gte: previousRange.start,
          lt: previousRange.end,
        },
      },
    }),

    getClinicAverageScore(currentRange.start, currentRange.end),
    getClinicAverageScore(previousRange.start, previousRange.end),
  ]);

  const periods = getLastSixCompletedMonths(year, month);

  const monthlyReports = await prisma.monthlyReport.findMany({
    where: {
      status: "FINALIZED",
      generationType: "AUTOMATIC",
      OR: periods.map((period) => ({
        year: period.year,
        month: period.month,
      })),
    },
    include: {
      assistant: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  const performanceData = periods.map((period) => {
    const reports = monthlyReports.filter(
      (report) =>
        report.year === period.year && report.month === period.month
    );

    const scores = reports
      .map((report) =>
        report.overallScore === null ? null : Number(report.overallScore)
      )
      .filter((score): score is number => score !== null);

    const date = new Date(Date.UTC(period.year, period.month - 1, 1));

    return {
      month: date.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      score: average(scores),
    };
  });

  const monthsWithReports = monthlyReports
    .filter(
      (report) =>
        report.evaluationCount > 0 && report.overallScore !== null
    )
    .sort((a, b) => b.year - a.year || b.month - a.month);

  const latestPeriod = monthsWithReports[0];

  const topAssistants = latestPeriod
    ? monthsWithReports
        .filter(
          (report) =>
            report.year === latestPeriod.year &&
            report.month === latestPeriod.month
        )
        .sort(
          (a, b) => Number(b.overallScore) - Number(a.overallScore)
        )
        .slice(0, 4)
        .map((report) => ({
          name: report.assistant.user.fullName,
          evaluations: report.evaluationCount,
          score: Number(report.overallScore),
        }))
    : [];

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      action: true,
      createdAt: true,
    },
  });

  const recentActivity = auditLogs.map((log) => ({
    ...describeActivity(log.action),
    createdAt: log.createdAt,
  }));

  return {
    currentMonth: new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric", timeZone: "UTC" }
    ),

    stats: [
      {
        title: "Total Assistants",
        value: String(assistantCount),
        description: "Registered assistants",
        trend: "Current registered total",
        positive: true,
        type: "assistants",
      },
      {
        title: "Total Dentists",
        value: String(dentistCount),
        description: "Registered dentists",
        trend: "Current registered total",
        positive: true,
        type: "dentists",
      },
      {
        title: "Evaluations",
        value: String(currentEvaluationCount),
        description: "Submitted this month",
        trend: percentageTrend(currentEvaluationCount, previousEvaluationCount),
        positive: currentEvaluationCount >= previousEvaluationCount,
        type: "evaluations",
      },
      {
        title: "Average Score",
        value: currentAverage === null ? "—" : `${currentAverage.toFixed(1)}%`,
        description: "Clinic-wide approved performance",
        trend: scoreTrend(currentAverage, previousAverage),
        positive:
          currentAverage !== null &&
          previousAverage !== null &&
          currentAverage >= previousAverage,
        type: "score",
      },
    ],

    performanceData,
    topAssistants,
    recentActivity,
  };
};
