import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { AppError } from "../../middlewares/error.middleware.js";
import type {
  CompilerResult,
  LambdaResponse,
  TestCase,
} from "../../types/index.js";

// -- AWS Lambda Client --
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const FUNCTION_NAME =
  process.env.LAMBDA_FUNCTION_NAME || "ascend-code-executor";
const CODE_TIMEOUT_MS = 5000;

// -- Invoke Lambda --
// Sends JS code to Lambda executor and returns stdout/stderr

const invokeLambda = async (code: string): Promise<LambdaResponse> => {
  const command = new InvokeCommand({
    FunctionName: FUNCTION_NAME,
    InvocationType: "RequestResponse",
    Payload: Buffer.from(JSON.stringify({ code, timeoutMs: CODE_TIMEOUT_MS })),
  });

  const response = await lambdaClient.send(command);

  if (response.FunctionError) {
    const errorPayload = response.Payload
      ? JSON.parse(Buffer.from(response.Payload).toString())
      : {};
    console.error("Lambda function error:", errorPayload);
    throw new AppError("Code execution service error", 502);
  }

  if (!response.Payload) {
    throw new AppError("Empty response from code executor", 502);
  }

  return JSON.parse(Buffer.from(response.Payload).toString());
};

// -- Compose Executable Code --
// Combines user code with all test case invocations into a single

const composeTestScript = (userCode: string, testCases: TestCase[]): string => {
  const testRunner = testCases
    .map(
      (tc) =>
        `try { const __r = ${tc.input}; console.log(typeof __r === "object" ? JSON.stringify(__r) : String(__r)); } catch(e) { console.log("__EXEC_ERROR__"); }`,
    )
    .join("\n");
  return `${userCode}\n\n${testRunner}`;
};

// -- Lambda Public API --
export const executeCodeTest = async (
  userCode: string,
  testCases: TestCase[],
  _validationScript: string,
  _language: string,
): Promise<CompilerResult> => {
  if (!testCases || testCases.length === 0) {
    console.warn("WARNING: Code question executed with ZERO test cases!");
    return { compilerScore: 0, passedCases: 0, totalCases: 0 };
  }

  // compose full script
  const fullCode = composeTestScript(userCode, testCases);

  const result = await invokeLambda(fullCode);

  // Handle timeout
  if (result.timedOut) {
    console.warn("Code execution timed out for user submission");
    return { compilerScore: 0, passedCases: 0, totalCases: testCases.length };
  }

  if (result.stdout) console.log(result.stdout);

  // Parse results
  const outputLines = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let passedCases = 0;
  for (let i = 0; i < testCases.length; i++) {
    const actual = (outputLines[i] || "").replace(/\s+/g, " ").trim();
    const expected = (testCases[i]?.output || "").replace(/\s+/g, " ").trim();
    if (actual === expected) {
      passedCases++;
    }
  }

  // Score ?/50
  const percentagePassed = passedCases / testCases.length;
  const compilerScore = percentagePassed * 50;

  return { compilerScore, passedCases, totalCases: testCases.length };
};
