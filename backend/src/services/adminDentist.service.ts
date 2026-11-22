
import prisma from "../config/prisma";

type DentistAction =
  | "APPROVE"
  | "REJECT"
  | "ACTIVATE"
  | "DEACTIVATE";

const statusTransitions = {
  APPROVE: { from: "PENDING", to: "ACTIVE" },
  REJECT: { from: "PENDING", to: "REJECTED" },
  ACTIVATE: { from: "INACTIVE", to: "ACTIVE" },
  DEACTIVATE: { from: "ACTIVE", to: "INACTIVE" },
} as const;

export async function updateDentistStatus(
  dentistId: string,
  adminId: string,
  action: DentistAction
) {
  return prisma.$transaction(async (tx) => {
    const dentist = await tx.user.findFirst({
      where: {
        id: dentistId,
        roles: {
          some: { role: "DENTIST" },
          none: { role: "ADMIN" },
        },
      },
      select: {
        id: true,
        status: true,
        fullName: true,
      },
    });

    if (!dentist) {
      throw new Error("DENTIST_NOT_FOUND");
    }

    const transition = statusTransitions[action];

    if (dentist.status !== transition.from) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    await tx.user.update({
      where: { id: dentistId },
      data: { status: transition.to },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `DENTIST_${action}`,
        entityType: "USER",
        entityId: dentistId,
      },
    });

    return {
      id: dentist.id,
      fullName: dentist.fullName,
      status: transition.to,
    };
  });
}
