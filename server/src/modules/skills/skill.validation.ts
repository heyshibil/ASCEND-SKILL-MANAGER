import { z } from "zod";

export const skillCategorySchema = z.enum([
  "Foundational",
  "Framework",
  "Tooling",
  "Language",
]);

export const skillDefinitionCreateSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required").max(80),
  category: skillCategorySchema,
  stabilityConstant: z.coerce.number().min(1).max(365),
  dependsOn: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const skillDefinitionUpdateSchema = skillDefinitionCreateSchema.partial();

export type SkillDefinitionCreateInput = z.infer<
  typeof skillDefinitionCreateSchema
>;
export type SkillDefinitionUpdateInput = z.infer<
  typeof skillDefinitionUpdateSchema
>;
