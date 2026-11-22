
import prisma from "../config/prisma";

export const getKpiConfigurations = async () => {
  const [draft, history] = await Promise.all([
    prisma.kpiConfiguration.findFirst({
      where: { status: "DRAFT" },
      include: {
        criteria: {
          orderBy: { displayOrder: "asc" },
        },
      },
    }),

    prisma.kpiConfiguration.findMany({
      where: { status: { in: ["PUBLISHED", "ARCHIVED"] } },
      include: {
        criteria: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { version: "desc" },
    }),
  ]);

  return { draft, history };
};

type SaveKpiConfigurationInput = {
  criteria: {
    name: string;
    weight: number;
    displayOrder: number;
  }[];
};

export const saveKpiConfiguration = async (
  configurationId: string,
  data: SaveKpiConfigurationInput
) => {
  return prisma.$transaction(async (tx) => {
    const configuration = await tx.kpiConfiguration.findUnique({
      where: { id: configurationId },
    });

    if (!configuration) {
      throw new Error("KPI_CONFIGURATION_NOT_FOUND");
    }

    if (configuration.status !== "DRAFT") {
      throw new Error("KPI_CONFIGURATION_NOT_EDITABLE");
    }

    const normalizedNames = data.criteria.map((item) =>
      item.name.trim().toLowerCase()
    );

    if (new Set(normalizedNames).size !== normalizedNames.length) {
      throw new Error("DUPLICATE_KPI_CRITERION");
    }

    if (
      new Set(data.criteria.map((item) => item.displayOrder)).size !==
      data.criteria.length
    ) {
      throw new Error("DUPLICATE_DISPLAY_ORDER");
    }

    await tx.kpiConfigurationItem.deleteMany({
      where: { configurationId },
    });

    for (const item of data.criteria) {
      const criterion = await tx.kpiCriterion.upsert({
        where: { name: item.name },
        update: {},
        create: { name: item.name },
      });

      await tx.kpiConfigurationItem.create({
        data: {
          configurationId,
          criterionId: criterion.id,
          criterionName: item.name,
          weight: item.weight,
          displayOrder: item.displayOrder,
        },
      });
    }

    return tx.kpiConfiguration.findUnique({
      where: { id: configurationId },
      include: {
        criteria: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  });
};

export const publishKpiConfiguration = async (
  configurationId: string
) => {
  return prisma.$transaction(async (tx) => {
    const configuration = await tx.kpiConfiguration.findUnique({
      where: { id: configurationId },
      include: { criteria: true },
    });

    if (!configuration) {
      throw new Error("KPI_CONFIGURATION_NOT_FOUND");
    }

    if (configuration.status !== "DRAFT") {
      throw new Error("KPI_CONFIGURATION_NOT_EDITABLE");
    }

    if (configuration.criteria.length === 0) {
      throw new Error("EMPTY_KPI_CONFIGURATION");
    }

    const totalWeight = configuration.criteria.reduce(
      (total, item) => total + Number(item.weight),
      0
    );

    if (Math.abs(totalWeight - 100) > 0.001) {
      throw new Error("KPI_WEIGHTS_MUST_EQUAL_100");
    }

    return tx.kpiConfiguration.update({
      where: { id: configurationId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      include: {
        criteria: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  });
};

export const createKpiDraft = async () => {
  return prisma.$transaction(async (tx) => {
    const existingDraft = await tx.kpiConfiguration.findFirst({
      where: { status: "DRAFT" },
    });

    if (existingDraft) {
      throw new Error("KPI_DRAFT_ALREADY_EXISTS");
    }

    const latestPublished = await tx.kpiConfiguration.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { version: "desc" },
      include: { criteria: true },
    });

    if (!latestPublished) {
      throw new Error("NO_PUBLISHED_KPI_CONFIGURATION");
    }

    const newVersion = await tx.kpiConfiguration.aggregate({
      _max: { version: true },
    });

    const draft = await tx.kpiConfiguration.create({
      data: {
        version: (newVersion._max.version ?? 0) + 1,
        status: "DRAFT",
        criteria: {
          create: latestPublished.criteria.map((item) => ({
            criterionId: item.criterionId,
            criterionName: item.criterionName,
            weight: item.weight,
            displayOrder: item.displayOrder,
          })),
        },
      },
      include: {
        criteria: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    return draft;
  });
};
