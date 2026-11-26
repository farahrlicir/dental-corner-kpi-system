
import prisma from "../config/prisma";
import {
  CreateEvaluationInput,
  UpdateEvaluationInput,
} from "../validators/evaluation.validator";

const ratingScore: Record<number, number> = {
  1: 20,
  2: 40,
  3: 60,
  4: 80,
  5: 100,
};

// Calculate normalized weighted score
const calculateEvaluationScore = (
  ratings: { configurationItemId: string; rating: number }[],
  criteria: { id: string; weight: unknown }[]
) => {
  let weightedScoreTotal = 0;
  let selectedWeightTotal = 0;

  const items = ratings.map((rating) => {
    const criterion = criteria.find(
      (item) => item.id === rating.configurationItemId
    );

    if (!criterion) {
      throw new Error("INVALID_EVALUATION_CRITERIA");
    }

    const score = ratingScore[rating.rating];
    const weight = Number(criterion.weight);

    weightedScoreTotal += weight * score;
    selectedWeightTotal += weight;

    return {
      configurationItemId: criterion.id,
      rating: rating.rating,
      score,
    };
  });

  if (selectedWeightTotal <= 0) {
    throw new Error("INVALID_EVALUATION_CRITERIA");
  }

  return {
    overallScore: Number(
      (weightedScoreTotal / selectedWeightTotal).toFixed(2)
    ),
    items,
  };
};

// Validate selected criteria
const validateSelectedCriteria = (
  ratings: { configurationItemId: string; rating: number }[],
  criteria: { id: string }[]
) => {
  const submittedIds = ratings.map(
    (rating) => rating.configurationItemId
  );

  const uniqueIds = new Set(submittedIds);

  if (
    uniqueIds.size !== submittedIds.length ||
    !submittedIds.every((id) =>
      criteria.some((criterion) => criterion.id === id)
    )
  ) {
    throw new Error("INVALID_EVALUATION_CRITERIA");
  }
};

// Get active assistants and the current published KPI configuration
export const getEvaluationFormData = async () => {
  const [assistants, configuration] = await Promise.all([
    prisma.assistant.findMany({
      where: {
        user: { status: "ACTIVE" },
      },
      include: {
        user: {
          select: { fullName: true },
        },
      },
      orderBy: {
        user: { fullName: "asc" },
      },
    }),

    prisma.kpiConfiguration.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { version: "desc" },
      include: {
        criteria: {
          orderBy: { displayOrder: "asc" },
        },
      },
    }),
  ]);

  if (!configuration) {
    throw new Error("NO_PUBLISHED_KPI_CONFIGURATION");
  }

  return {
    assistants: assistants.map((assistant) => ({
      id: assistant.id,
      name: assistant.user.fullName,
    })),
    configuration: {
      id: configuration.id,
      version: configuration.version,
      criteria: configuration.criteria.map((criterion) => ({
        id: criterion.id,
        name: criterion.criterionName,
        weight: Number(criterion.weight),
        displayOrder: criterion.displayOrder,
      })),
    },
  };
};

// Create a new evaluation
export const createEvaluation = async (
  data: CreateEvaluationInput,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const dentist = await tx.dentist.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!dentist) {
      throw new Error("DENTIST_PROFILE_NOT_FOUND");
    }

    const assistant = await tx.assistant.findUnique({
      where: { id: data.assistantId },
      include: {
        user: {
          select: { status: true },
        },
      },
    });

    if (!assistant || assistant.user.status !== "ACTIVE") {
      throw new Error("ASSISTANT_NOT_FOUND_OR_INACTIVE");
    }

    const configuration = await tx.kpiConfiguration.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { version: "desc" },
      include: {
        criteria: true,
      },
    });

    if (!configuration) {
      throw new Error("NO_PUBLISHED_KPI_CONFIGURATION");
    }

    validateSelectedCriteria(data.ratings, configuration.criteria);

    const { overallScore, items } = calculateEvaluationScore(
      data.ratings,
      configuration.criteria
    );

    return tx.evaluation.create({
      data: {
        assistantId: data.assistantId,
        dentistId: dentist.id,
        configurationId: configuration.id,
        status: "PENDING",
        overallScore,
        observation: data.observation || null,
        items: {
          create: items,
        },
      },
      include: {
        assistant: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        dentist: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        items: {
          include: {
            configurationItem: true,
          },
        },
      },
    });
  });
};

// Get pending evaluations for admin review
export const getPendingEvaluations = async () => {
  return prisma.evaluation.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      assistant: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
      dentist: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
      configuration: {
        include: {
          criteria: {
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      },
      items: {
        include: {
          configurationItem: true,
        },
      },
    },
  });
};

// Admin edits a pending evaluation
export const updateEvaluation = async (
  evaluationId: string,
  data: UpdateEvaluationInput
) => {
  return prisma.$transaction(async (tx) => {
    const evaluation = await tx.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        configuration: {
          include: {
            criteria: true,
          },
        },
      },
    });

    if (!evaluation) {
      throw new Error("EVALUATION_NOT_FOUND");
    }

    if (evaluation.status !== "PENDING") {
      throw new Error("EVALUATION_NOT_PENDING");
    }

    validateSelectedCriteria(
      data.ratings,
      evaluation.configuration.criteria
    );

    const { overallScore, items } = calculateEvaluationScore(
      data.ratings,
      evaluation.configuration.criteria
    );

    await tx.evaluationItem.deleteMany({
      where: { evaluationId },
    });

    return tx.evaluation.update({
      where: { id: evaluationId },
      data: {
        overallScore,
        observation: data.observation || null,
        items: {
          create: items,
        },
      },
      include: {
        assistant: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        dentist: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        configuration: {
          select: { version: true },
        },
        items: {
          include: {
            configurationItem: true,
          },
        },
      },
    });
  });
};

// Admin approves a pending evaluation
export const approveEvaluation = async (
  evaluationId: string,
  adminUserId: string
) => {
  const result = await prisma.evaluation.updateMany({
    where: {
      id: evaluationId,
      status: "PENDING",
    },
    data: {
      status: "APPROVED",
      approvedById: adminUserId,
      approvedAt: new Date(),
    },
  });

  if (result.count === 0) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      select: { id: true },
    });

    if (!evaluation) {
      throw new Error("EVALUATION_NOT_FOUND");
    }

    throw new Error("EVALUATION_NOT_PENDING");
  }

  return prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: {
      assistant: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
      dentist: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
      items: {
        include: {
          configurationItem: true,
        },
      },
    },
  });
};

// Admin rejects a pending evaluation
export const rejectEvaluation = async (evaluationId: string) => {
  const result = await prisma.evaluation.updateMany({
    where: {
      id: evaluationId,
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
    },
  });

  if (result.count === 0) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      select: { id: true },
    });

    if (!evaluation) {
      throw new Error("EVALUATION_NOT_FOUND");
    }

    throw new Error("EVALUATION_NOT_PENDING");
  }

  return prisma.evaluation.findUnique({
    where: { id: evaluationId },
  });
};

// Retrieve evaluation history
export const getEvaluationHistory = async (filters: {
  assistantId?: string;
  month?: string;
}) => {
  const where: any = {};

  if (filters.assistantId) {
    where.assistantId = filters.assistantId;
  }

  if (filters.month) {
    const [year, month] = filters.month.split("-").map(Number);
    const algeriaOffset = 60 * 60 * 1000;

    where.submittedAt = {
      gte: new Date(
        Date.UTC(year, month - 1, 1) - algeriaOffset
      ),
      lt: new Date(
        Date.UTC(year, month, 1) - algeriaOffset
      ),
    };
  }

  return prisma.evaluation.findMany({
    where,
    orderBy: {
      submittedAt: "desc",
    },
    include: {
      assistant: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
      dentist: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
      configuration: {
        select: { version: true },
      },
      items: {
        include: {
          configurationItem: true,
        },
      },
    },
  });
};
