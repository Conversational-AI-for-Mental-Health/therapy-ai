module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: [
    '**/tests/**/*.test.[jt]s?(x)',
    '!**/tests/mocks/**',
    '!**/tests/helpers/**',
  ],
  moduleNameMapper: {
    '^@therapy-ai/shared$': '<rootDir>/../packages/shared/src',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
  ],
};
