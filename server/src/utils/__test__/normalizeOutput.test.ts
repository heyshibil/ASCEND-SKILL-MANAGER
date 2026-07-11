import {
  isDeepEqual,
  normalizeOutput,
  parseOutputValue,
} from "../normalizeOutput.js";

// -- normalizeOutput --
describe("normalizeOutput", () => {
  // Trim spaces
  test("should trim spaces and normalize multiple spaces", () => {
    const result = normalizeOutput("Hello  y    World");
    expect(result).toBe("Hello y World");
  });

  // Normailze JSON array
  test("should normalize JSON array string", () => {
    const result = normalizeOutput("[1,2,3]");
    expect(result).toBe("[1,2,3]");
  });

  test("should handle empty string", () => {
    const result = normalizeOutput("");
    expect(result).toBe("");
  });
});

// -- parseOutputValue --
describe("parseOutputValue", () => {
  // JS true
  test("should parse boolean string true", () => {
    const result = parseOutputValue("true");
    expect(result).toBe(true);
  });

  // Python True
  test("should parse Python style True", () => {
    const result = parseOutputValue("True");
    expect(result).toBe(true);
  });

  test("should parse quoted string", () => {
    const result = parseOutputValue("'hello'");
    expect(result).toBe("hello");
  });
});

// -- isDeepEqual --
describe("isDeepEqual", () => {
  test("should return true for equal arrays", () => {
    const result = isDeepEqual([1, 2], [1, 2]);
    expect(result).toBe(true);
  });

  test("should return true for equal objects", () => {
    const result = isDeepEqual(
      { a: "Hi", b: "world" },
      { a: "Hi", b: "world" },
    );
    expect(result).toBe(true);
  });

  test("should return false for different objects", () => {
    const result = isDeepEqual({ a: 1 }, { a: 2 });
    expect(result).toBe(false);
  });

  test("should return false for different arrays", () => {
    const result = isDeepEqual([1, 2], [1, 3]);
    expect(result).toBe(false);
  });
});

