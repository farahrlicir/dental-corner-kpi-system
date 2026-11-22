import prisma from "../config/prisma";
import { hashPassword, verifyPassword } from "../utils/password";

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