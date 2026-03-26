import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  username: z
    .string({ error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),
  careerGoal: z
    .string()
    .default("Fullstack Developer"),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ error: "Password is required" }),
});

// Type inference
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
