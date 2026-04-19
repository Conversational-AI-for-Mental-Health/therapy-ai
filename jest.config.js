module.exports = {
  // Directories where Jest should look for jest unit test files
  roots: ["<rootDir>/backend", "<rootDir>/frontend", "<rootDir>/mobile"],

  
  projects: [
    "<rootDir>/backend",
    "<rootDir>/frontend",
    "<rootDir>/mobile"
  ],

  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
