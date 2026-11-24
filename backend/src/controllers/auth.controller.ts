import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { registerDentistSchema } from "../validators/auth.validator";
import { registerDentist } from "../services/auth.service";
import { loginSchema } from "../validators/auth.validator";
import { loginUser } from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/prisma";
import { requestPasswordReset, resetPassword } from "../services/auth.service";
import { changePassword } from "../services/auth.service";
import { z } from "zod";

export async function register(req: Request, res: Response) {
  try {
    const validation = registerDentistSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const user = await registerDentist(validation.data);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "An account with this email or license number already exists.",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration.",
    });
  }
}
export async function login(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    const user = await loginUser(email, password);

    const token = generateToken({
          userId: user.id,
          roles: user.roles,
          tokenVersion: user.tokenVersion,
  });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    const { tokenVersion, ...safeUser } = user;
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: safeUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (error.message === "ACCOUNT_NOT_ACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Your account is not active yet",
        });
      }
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
    });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user!.userId,
      },
      include: {
        roles: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles.map((item) => item.role),
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve user information",
    });
  }
}
export async function forgotPassword(req: Request, res: Response) {
  try {
    const schema = z.object({
      email: z.string().email().max(255),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    await requestPasswordReset(validation.data.email);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, reset instructions will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not process your request. Please try again later.",
    });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const schema = z.object({
      token: z.string().min(1),
      password: z.string().min(8).max(128),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request.",
      });
    }

    await resetPassword(
      validation.data.token,
      validation.data.password
    );

    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_OR_EXPIRED_TOKEN"
    ) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not reset your password. Please try again.",
    });
  }
}
export async function changePasswordController(
  req: AuthRequest,
  res: Response
) {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(128),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid password data.",
      });
    }

    await changePassword(
      req.user!.userId,
      validation.data.currentPassword,
      validation.data.newPassword
    );
    res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
   });
    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CURRENT_PASSWORD") {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
    }

    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not change password.",
    });
  }
}