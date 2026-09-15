import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter Valid Email"),
  password: z.string().trim().min(1, "Password is required"),
});
