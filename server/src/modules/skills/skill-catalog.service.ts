import mongoose from "mongoose";
import { AppError } from "../../middlewares/error.middleware.js";
import { SkillDefinition } from "../../models/SkillDefinition.js";
import { getSkillDefaults } from "../../utils/skillMap.js";
import type {
  SkillDefinitionCreateInput,
  SkillDefinitionUpdateInput,
} from "./skill.validation.js";

export const normalizeSkillName = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

const INITIAL_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "Python",
  "Django",
  "PostgreSQL",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "C#",
  ".NET",
  "SQL Server",
];

export const ensureDefaultSkillDefinitions = async () => {
  const count = await SkillDefinition.estimatedDocumentCount();
  if (count > 0) return;

  await SkillDefinition.insertMany(
    INITIAL_SKILLS.map((name) => {
      const defaults = getSkillDefaults(name);
      return {
        name,
        normalizedName: normalizeSkillName(name),
        category: defaults.category,
        stabilityConstant: defaults.stabilityConstant,
        dependsOn: [],
        isActive: true,
      };
    }),
    { ordered: false },
  );
};

export const getActiveSkillDefinitions = async () => {
  await ensureDefaultSkillDefinitions();

  return SkillDefinition.find({ isActive: true })
    .sort({ category: 1, name: 1 })
    .lean();
};

export const getAdminSkillDefinitions = async (search?: string) => {
  await ensureDefaultSkillDefinitions();

  const query: Record<string, unknown> = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  return SkillDefinition.find(query)
    .populate("dependsOn", "name category")
    .sort({ createdAt: -1 })
    .lean();
};

const validateDependsOn = async (dependsOn: string[] = [], currentId?: string) => {
  const uniqueIds = [...new Set(dependsOn.filter(Boolean))];

  if (currentId && uniqueIds.includes(currentId)) {
    throw new AppError("A skill cannot depend on itself", 400);
  }

  if (uniqueIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new AppError("Invalid dependency skill selected", 400);
  }

  if (uniqueIds.length === 0) return [];

  const count = await SkillDefinition.countDocuments({ _id: { $in: uniqueIds } });
  if (count !== uniqueIds.length) {
    throw new AppError("One or more dependency skills do not exist", 400);
  }

  return uniqueIds.map((id) => new mongoose.Types.ObjectId(id));
};

export const createSkillDefinition = async (
  input: SkillDefinitionCreateInput,
) => {
  const normalizedName = normalizeSkillName(input.name);
  const exists = await SkillDefinition.findOne({ normalizedName });

  if (exists) {
    throw new AppError("A skill with this name already exists", 409);
  }

  const dependsOn = await validateDependsOn(input.dependsOn);

  return SkillDefinition.create({
    name: input.name.trim().replace(/\s+/g, " "),
    normalizedName,
    category: input.category,
    stabilityConstant: input.stabilityConstant,
    dependsOn,
    isActive: input.isActive,
  });
};

export const updateSkillDefinition = async (
  id: string,
  input: SkillDefinitionUpdateInput,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid skill id", 400);
  }

  const skill = await SkillDefinition.findById(id);
  if (!skill) {
    throw new AppError("Skill preset not found", 404);
  }

  if (input.name !== undefined) {
    const normalizedName = normalizeSkillName(input.name);
    const duplicate = await SkillDefinition.findOne({
      normalizedName,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new AppError("A skill with this name already exists", 409);
    }

    skill.name = input.name.trim().replace(/\s+/g, " ");
    skill.normalizedName = normalizedName;
  }

  if (input.category !== undefined) skill.category = input.category;
  if (input.stabilityConstant !== undefined) {
    skill.stabilityConstant = input.stabilityConstant;
  }
  if (input.isActive !== undefined) skill.isActive = input.isActive;
  if (input.dependsOn !== undefined) {
    skill.dependsOn = await validateDependsOn(input.dependsOn, id);
  }

  return skill.save();
};

export const deleteSkillDefinition = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid skill id", 400);
  }

  const usedAsDependency = await SkillDefinition.exists({ dependsOn: id });
  if (usedAsDependency) {
    throw new AppError(
      "Remove this skill from other dependency lists before deleting it",
      400,
    );
  }

  const deleted = await SkillDefinition.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError("Skill preset not found", 404);
  }

  return deleted;
};
