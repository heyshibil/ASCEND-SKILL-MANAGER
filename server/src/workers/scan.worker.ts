import { Worker, Job } from "bullmq";
import axios from "axios";
import { redisConnection } from "../config/redis.js";

// Skills Preset
const PRESET_MAPPING: Record<string, string> = {
  react: "React",
  "react-dom": "React",
  express: "Express",
  mongoose: "MongoDB",
  mongodb: "MongoDB",
  typescript: "TypeScript",
  next: "Next.js",
};

const scanWorker = new Worker(
  "GITHUB_SCAN",
  async (job: Job) => {
    const { accessToken, username } = job.data;
    console.log(`[WORKER] 🔍 Analyzing repositories for: ${username}`);

    try {
      const skills = new Set<string>();

      // Fetch user's public repositories
      const { data: repos } = await axios.get(
        "https://api.github.com/user/repos?per_page=50&sort=updated",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      // Identify core languages
      for (const repo of repos) {
        if (repo.language === "JavaScript") skills.add("JavaScript");
        if (repo.language === "TypeScript") skills.add("TypeScript");
        if (repo.language === "Python") skills.add("Python");
      }

      // Filter for JS/TS Repos to analyze dependencies
      const jsRepos = repos.filter((r: any) =>
        ["JavaScript", "TypeScript"].includes(r.language),
      );

      // Fetch package.json for JS repos
      for (const repo of jsRepos) {
        try {
          const { data: fileData } = await axios.get(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/package.json`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );

          // Decode Base64
          const content = Buffer.from(fileData.content, "base64").toString(
            "utf-8",
          );

          const pkg = JSON.parse(content);
          const deps = {
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {}),
          };

          if (Object.keys(deps).length > 0) skills.add("Node.js");
          for (const [depName] of Object.entries(deps)) {
            if (PRESET_MAPPING[depName]) {
              skills.add(PRESET_MAPPING[depName]);
            }
          }
        } catch (error) {
          // No package.json found. Skip safely
          continue;
        }
      }

      console.log(`[WORKER] ✅ Skills Identified:`, Array.from(skills));

      return { status: "completed", predictedSkills: Array.from(skills) };
    } catch (error: any) {
      console.error(`[WORKER] ❌ Scan failed for ${username}:`, error.message);
      throw error; // Let BullMQ handle the retry
    }
  },
  { connection: redisConnection as any },
);


export default scanWorker;
