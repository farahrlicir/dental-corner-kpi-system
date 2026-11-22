
import prisma from "../config/prisma";
import { hashPassword } from "../utils/password";

interface CreateAssistantData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

interface UpdateAssistantData {
  fullName: string;
  email: string;
  phone?: string;
}

export async function getAssistants() {
  return prisma.user.findMany({
    where: {
      roles: { some: { role: "ASSISTANT" } },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAssistant(
  data: CreateAssistantData,
  adminId: string
) {
  const email = data.email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    const passwordHash = await hashPassword(data.password);

    const assistant = await tx.user.create({
      data: {
        fullName: data.fullName,
        email,
        phone: data.phone || null,
        passwordHash,
        status: "ACTIVE",
        roles: {
          create: { role: "ASSISTANT" },
        },
        assistant: {
          create: {},
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "ASSISTANT_CREATED",
        entityType: "USER",
        entityId: assistant.id,
      },
    });

    return assistant;
  });
}

export async function updateAssistant(
  assistantId: string,
  data: UpdateAssistantData,
  adminId: string
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findFirst({
      where: {
        id: assistantId,
        roles: { some: { role: "ASSISTANT" } },
      },
    });

    if (!existing) throw new Error("ASSISTANT_NOT_FOUND");
    if (existing.status === "DELETED") {
      throw new Error("ASSISTANT_ARCHIVED");
    }

    const assistant = await tx.user.update({
      where: { id: assistantId },
      data: {
        fullName: data.fullName,
        email: data.email.trim().toLowerCase(),
        phone: data.phone || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "ASSISTANT_UPDATED",
        entityType: "USER",
        entityId: assistantId,
      },
    });

    return assistant;
  });
}

export async function updateAssistantStatus(
  assistantId: string,
  action: "ACTIVATE" | "DEACTIVATE" | "ARCHIVE",
  adminId: string
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findFirst({
      where: {
        id: assistantId,
        roles: { some: { role: "ASSISTANT" } },
      },
    });

    if (!existing) throw new Error("ASSISTANT_NOT_FOUND");
    if (existing.status === "DELETED") {
      throw new Error("ASSISTANT_ARCHIVED");
    }

    const transitions = {
      ACTIVATE: { from: "INACTIVE", to: "ACTIVE" },
      DEACTIVATE: { from: "ACTIVE", to: "INACTIVE" },
      ARCHIVE: { from: ["ACTIVE", "INACTIVE"], to: "DELETED" },
    } as const;

    const transition = transitions[action];

    const valid =
      Array.isArray(transition.from)
        ? transition.from.includes(existing.status as "ACTIVE" | "INACTIVE")
        : existing.status === transition.from;

    if (!valid) throw new Error("INVALID_STATUS_TRANSITION");

    const assistant = await tx.user.update({
      where: { id: assistantId },
      data: { status: transition.to },
      select: {
        id: true,
        fullName: true,
        status: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `ASSISTANT_${action}D`,
        entityType: "USER",
        entityId: assistantId,
      },
    });

    return assistant;
  });
}
