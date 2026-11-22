
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const criteria = [
  { name: "Room Turnover Time", weight: 10 },
  { name: "On-Time Seating Rate", weight: 8 },
  { name: "Chart Prep Completion", weight: 10 },
  { name: "Lab Case Tracking", weight: 8 },
  { name: "X-Ray & Image Quality", weight: 10 },
  { name: "Post-Op Call Success", weight: 9 },
  { name: "Ready-to-Work Punctuality", weight: 7 },
  { name: "Uniform & Hygiene Standards", weight: 8 },
  { name: "Overtime Management", weight: 4 },
  { name: "Emergency & Late Flexibility", weight: 6 },
  { name: "In-Chair Waiting Time", weight: 8 },
  { name: "Patient Comfort & Tone", weight: 12 },
];

async function main() {
  const configurationId = await prisma.$transaction(async (tx) => {
    const existing = await tx.kpiConfiguration.findUnique({
      where: { version: 1 },
    });

    if (existing && existing.status !== "DRAFT") {
      throw new Error(
        "Version 1 already exists and is not a draft. No changes made."
      );
    }

    const otherDraft = await tx.kpiConfiguration.findFirst({
      where: {
        status: "DRAFT",
        ...(existing ? { id: { not: existing.id } } : {}),
      },
    });

    if (otherDraft) {
      throw new Error(
        "Another draft already exists. Resolve it before creating version 1."
      );
    }

    const configuration =
      existing ??
      (await tx.kpiConfiguration.create({
        data: {
          version: 1,
          status: "DRAFT",
        },
      }));

    for (const [index, item] of criteria.entries()) {
      const criterion = await tx.kpiCriterion.upsert({
        where: { name: item.name },
        update: {},
        create: { name: item.name },
      });

      await tx.kpiConfigurationItem.upsert({
        where: {
          configurationId_criterionId: {
            configurationId: configuration.id,
            criterionId: criterion.id,
          },
        },
        update: {
          criterionName: item.name,
          weight: item.weight,
          displayOrder: index + 1,
        },
        create: {
          configurationId: configuration.id,
          criterionId: criterion.id,
          criterionName: item.name,
          weight: item.weight,
          displayOrder: index + 1,
        },
      });
    }

    return configuration.id;
  });

  console.log("Initial KPI configuration created successfully.");
  console.log("Configuration ID:", configurationId);
  console.log("Version: 1 | Status: DRAFT");
  console.log("Criteria:", criteria.length);
  console.log(
    "Total weight:",
    criteria.reduce((sum, item) => sum + item.weight, 0)
  );
}

main()
  .catch((error) => {
    console.error("KPI SEED ERROR:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
