import { z } from "zod";

const usernameSchema = z
  .string({ error: "Username is required" })
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Username can only contain letters, numbers, dots, underscores, and hyphens",
  );

const optionalAvatarUrlSchema = z.union([
  z
    .string()
    .trim()
    .url("Profile image must be a valid URL")
    .max(500, "Profile image URL is too long"),
  z.literal(""),
]);

export const updateProfileSchema = z
  .object({
    username: usernameSchema,
    avatarUrl: optionalAvatarUrlSchema.optional(),
  })
  .strict();

export const requestEmailChangeSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email format"),
  })
  .strict();

export const requestPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string({ error: "New password is required" })
      .min(8, "New password must be at least 8 characters"),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RequestEmailChangeInput = z.infer<
  typeof requestEmailChangeSchema
>;
export type RequestPasswordChangeInput = z.infer<
  typeof requestPasswordChangeSchema
>;
