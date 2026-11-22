import dotenv from "dotenv";

dotenv.config();

import prisma from "../config/prisma";
import { hashPassword } from "../utils/password";

async function createAdmin() {
  const fullName = process.env.ADMIN_FULL_NAME;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!fullName || !email || !password) {
    throw new Error("Missing admin environment variables.");
  }

  if (password.length < 8) {
    throw new Error("Admin password must contain at least 8 characters.");
  }

  const existingAdmin = await prisma.user.findFirst({
    where: {
      status: "ACTIVE",
      roles: {
        some: { role: "ADMIN" },
      },
    },
  });

  if (existingAdmin) {
    throw new Error("An active administrator already exists.");
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      status: "ACTIVE",

      roles: {
        create: [
          { role: "ADMIN" },
          { role: "DENTIST" },
        ],
      },

      dentist: {
        create: {},
      },
    },
  });

  console.log("Administrator created successfully:", admin.email);
}

createAdmin()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });