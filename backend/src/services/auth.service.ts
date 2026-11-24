import prisma from "../config/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import crypto from "node:crypto";
import { sendPasswordResetEmail } from "../utils/email";

interface RegisterDentistData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  licenseNumber?: string;
}
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    include: {
      roles: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  const isPasswordValid = await verifyPassword(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roles: user.roles.map((item) => item.role),
    tokenVersion: user.tokenVersion,
  };
}

export async function registerDentist(data: RegisterDentistData) {
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      passwordHash,
      status: "PENDING",

      roles: {
        create: {
          role: "DENTIST",
        },
      },

      dentist: {
        create: {
          licenseNumber: data.licenseNumber || null,
        },
      },
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
}
export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always return the same response, even if the account doesn't exist.
  if (!user || user.status !== "ACTIVE") {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    }),

    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    }),
  ]);

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= new Date()
  ) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    const result = await tx.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });

    if (result.count !== 1) {
      throw new Error("INVALID_OR_EXPIRED_TOKEN");
    }

   await tx.user.update({
  where: { id: resetToken.userId },
  data: {
      passwordHash,
      tokenVersion: { increment: 1 },
     },
    });
  });
}
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("USER_NOT_FOUND");
  }

  const isPasswordValid = await verifyPassword(
    currentPassword,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
      },
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
  });
}