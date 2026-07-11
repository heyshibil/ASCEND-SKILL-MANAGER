/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // Use ESM preset
  testEnvironment: "node",
  transform: {
    // Tell ts-jest to compile TS files using ES Modules
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  // Map relative imports ending with `.js` back to `.ts` files
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
