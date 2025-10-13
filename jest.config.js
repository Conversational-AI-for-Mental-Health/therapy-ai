module.exports = {
  // Use ts-jest for running TypeScript tests
  preset: "ts-jest",

  // Collect coverage from all relevant files
  collectCoverage: true,

  // Directories where Jest should look for test files
  roots: ["<rootDir>/backend", "<rootDir>/frontend"],

  // File extensions Jest should look for
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Test environment setup (node for backend, jsdom for frontend)
  projects: [
    {
      displayName: "backend",
      testEnvironment: "node",
      testMatch: ["<rootDir>/backend/**/*.test.ts"],
    },
    {
      displayName: "frontend",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/frontend/**/*.test.tsx"],
    },
  ],
};
