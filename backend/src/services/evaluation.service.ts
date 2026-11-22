
import prisma from "../config/prisma";
import { CreateEvaluationInput } from "../validators/evaluation.validator";

const ratingScore: Record<number, number> = {
  1: 60,
  2: 70,
  3: 80,
  4: 90,
  5: 100,
};

// Get active assistants and the current published KPI configuration
export const getEvaluationFormData = async () => {
  const [assistants, configuration] = await Promise.all([
    prisma.assistant.findMany({
      where: {
        user: {
          status: "ACTIVE",
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        user: {
          fullName: "asc",
        },
      },
    }),

    prisma.kpiConfiguration.findFirst({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        version: "desc",
      },
      include: {
        criteria: {
          orderBy: {
            displayOrder: "asc",
          },
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
  data: CreateEvaluationInput
) => {
  return prisma.$transaction(async (tx) => {
    const assistant = await tx.assistant.findUnique({
      where: {
        id: data.assistantId,
      },
      include: {
        user: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!assistant || assistant.user.status !== "ACTIVE") {
      throw new Error("ASSISTANT_NOT_FOUND_OR_INACTIVE");
    }

    const configuration = await tx.kpiConfiguration.findFirst({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        version: "desc",
      },
      include: {
        criteria: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    if (!configuration) {
      throw new Error("NO_PUBLISHED_KPI_CONFIGURATION");
    }

    const criteria = configuration.criteria;
    const submittedIds = data.ratings.map(
      (rating) => rating.configurationItemId
    );

    const uniqueIds = new Set(submittedIds);

    if (
      uniqueIds.size !== criteria.length ||
      submittedIds.length !== criteria.length ||
      !criteria.every((criterion) =>
        uniqueIds.has(criterion.id)
      )
    ) {
      throw new Error("INVALID_EVALUATION_CRITERIA");
    }

    let overallScore = 0;

    const evaluationItems = data.ratings.map((rating) => {
      const criterion = criteria.find(
        (item) => item.id === rating.configurationItemId
      );

      if (!criterion) {
        throw new Error("INVALID_EVALUATION_CRITERIA");
      }

      const score = ratingScore[rating.rating];

      overallScore +=
        (Number(criterion.weight) * score) / 100;

      return {
        configurationItemId: criterion.id,
        rating: rating.rating,
        score,
      };
    });

    overallScore = Number(overallScore.toFixed(2));

    return tx.evaluation.create({
      data: {
        assistantId: data.assistantId,
        configurationId: configuration.id,
        overallScore,
        observation: data.observation || null,
        items: {
          create: evaluationItems,
        },
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
        items: {
          include: {
            configurationItem: true,
          },
        },
      },
    });
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

    const startDate = new Date(
      Date.UTC(year, month - 1, 1)
    );

    const endDate = new Date(
      Date.UTC(year, month, 1)
    );

    where.submittedAt = {
      gte: startDate,
      lt: endDate,
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
            select: {
              fullName: true,
            },
          },
        },
      },
      configuration: {
        select: {
          version: true,
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
