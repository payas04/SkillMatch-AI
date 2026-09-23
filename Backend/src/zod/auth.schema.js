import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username is too long"),

  email: z.string().trim().email("Invalid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});
export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Invalid email"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),

  password: z.string().min(1, "Password is required"),
});
