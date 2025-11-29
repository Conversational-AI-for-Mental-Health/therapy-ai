module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  coverageDirectory: 'coverage',
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 60000,
  maxWorkers: 1,
  detectOpenHandles: true,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        isolatedModules: false,
      },
    ],
  },
};
