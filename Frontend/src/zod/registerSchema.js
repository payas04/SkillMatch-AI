import { z } from "zod";
export const registerSchema = z.object({
  username: z.string().trim().min(2, "username must be atleast 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
