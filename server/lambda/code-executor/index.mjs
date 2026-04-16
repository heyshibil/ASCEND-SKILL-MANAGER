import { writeFileSync, unlinkSync } from "fs";
import { execFileSync } from "child_process";
import { randomUUID } from "crypto";
import { join } from "path";
import { tmpdir } from "os";

export const handler = async (event) => {
  const { code, timeoutMs = 5000 } = event;

  const filePath = join(tmpdir(), `exec_${randomUUID()}.js`);

  try {
    writeFileSync(filePath, code, "utf-8");

    const stdout = execFileSync("node", [filePath], {
      timeout: timeoutMs,
      encoding: "utf-8",
      maxBuffer: 1024 * 1024, // 1MB max output
      stdio: ["pipe", "pipe", "pipe"],
    });

    return {
      statusCode: 200,
      stdout: stdout,
      stderr: "",
      timedOut: false,
    };
  } catch (error) {
    // execFileSync throws on non-zero exit OR timeout
    if (error.killed) {
      return {
        statusCode: 200,
        stdout: "",
        stderr: "Execution timed out",
        timedOut: true,
      };
    }

    return {
      statusCode: 200,
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      timedOut: false,
    };
  } finally {
    // Deletes temp file
    try { unlinkSync(filePath); } catch {}
  }
};
