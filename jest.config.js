module.exports = {
  // Directories where Jest should look for jest unit test files
  roots: ["<rootDir>/backend", "<rootDir>/frontend"],

  
  projects: [
    "<rootDir>/backend",
    "<rootDir>/frontend"
  ],

  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
