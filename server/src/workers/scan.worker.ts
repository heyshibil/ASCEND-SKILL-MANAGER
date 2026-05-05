import { Worker, Job } from "bullmq";
import axios from "axios";
import { redisConnection } from "../config/redis.js";

// Extended Skills Preset for different ecosystems
const PRESET_MAPPING: Record<string, string> = {
  // JS/TS Ecosystem
  react: "React",
  "react-dom": "React",
  express: "Express",
  mongoose: "MongoDB",
  mongodb: "MongoDB",
  typescript: "TypeScript",
  next: "Next.js",
  vue: "Vue.js",
  // Python Ecosystem
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  pandas: "Pandas",
  numpy: "NumPy",
  // .NET Ecosystem
  "microsoft.aspnetcore": "ASP.NET",
  entityframework: "Entity Framework",
};

// Map languages to files we should look for
const LANGUAGE_FILES: Record<string, string[]> = {
  JavaScript: ["package.json"],
  TypeScript: ["package.json"],
  Python: ["requirements.txt", "Pipfile"],
  Java: ["pom.xml", "build.gradle"],
};

const scanWorker = new Worker(
  "GITHUB_SCAN",
  async (job: Job) => {
    const { accessToken, username } = job.data;
    console.log(`[WORKER] 🔍 Analyzing repositories for: ${username}`);

    try {
      const skills = new Set<string>();
      const coreLanguages = new Set<string>();

      // Fetch user's public repositories - 25 repos
      const { data: repos } = await axios.get(
        "https://api.github.com/user/repos?per_page=25&sort=updated",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      // Identify base core languages
      for (const repo of repos) {
        if (
          [
            "JavaScript",
            "TypeScript",
            "Python",
            "Java",
            "Go",
            "Ruby",
            "C++",
            "C#",
          ].includes(repo.language)
        ) {
          const coreLang = repo.language === "C#" ? "C#" : repo.language;
          coreLanguages.add(coreLang);
          skills.add(coreLang);
        }
      }

      // Deep dive into dependencies for supported languages
      for (const repo of repos) {
        if (repo.language === "C#") {
          try {
            const { data: rootContents } = await axios.get(
              `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            const csprojFile = rootContents.find((f: any) =>
              f.name.endsWith(".csproj"),
            );
            if (csprojFile) {
              const { data: fileData } = await axios.get(
                `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/${csprojFile.name}`,
                { headers: { Authorization: `Bearer ${accessToken}` } },
              );
              const content = Buffer.from(fileData.content, "base64").toString(
                "utf-8",
              );
              if (content.includes("Microsoft.AspNetCore"))
                skills.add("ASP.NET");
              if (content.includes("EntityFramework"))
                skills.add("Entity Framework");
            }
          } catch (e) {
            // Safely ignore if no contents or .csproj is in a subfolder
          }
          continue;
        }

        if (!repo.language || typeof repo.language !== "string") {
          continue;
        }

        const filesToLookFor = LANGUAGE_FILES[repo.language] || [];

        for (const file of filesToLookFor) {
          try {
            const { data: fileData } = await axios.get(
              `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/${file}`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );

            const content = Buffer.from(fileData.content, "base64").toString(
              "utf-8",
            );

            if (file === "package.json") {
              const pkg = JSON.parse(content);
              const deps = {
                ...(pkg.dependencies || {}),
                ...(pkg.devDependencies || {}),
              };
              if (Object.keys(deps).length > 0) skills.add("Node.js");
              for (const dep of Object.keys(deps)) {
                if (PRESET_MAPPING[dep]) skills.add(PRESET_MAPPING[dep]);
              }
            } else if (file === "requirements.txt" || file === "Pipfile") {
              // Basic python package mapping
              for (const dep of Object.keys(PRESET_MAPPING)) {
                if (content.toLowerCase().includes(dep))
                  skills.add(PRESET_MAPPING[dep] as string);
              }
            }
          } catch (error) {
            continue;
          }
        }
      }

      const finalCores = Array.from(coreLanguages);

      return {
        status: "completed",
        predictedSkills: Array.from(skills),
        coreLanguages: finalCores.length > 0 ? finalCores : ["JavaScript"], // Default fallback
      };
    } catch (error: any) {
      console.error(`[WORKER] ❌ Scan failed for ${username}:`, error.message);
      throw error;
    }
  },
  { connection: redisConnection as any },
);

export default scanWorker;
