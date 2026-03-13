module.exports = {
  preset: 'ts-jest',

  testEnvironment: 'jsdom',

  roots: ['<rootDir>/src'],

  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^ansi-regex$': '<rootDir>/src/tests/mocks/ansi-regex.ts',

    '^framer-motion$': '<rootDir>/src/tests/mocks/framer-motion.tsx',
    '^react-markdown$': '<rootDir>/src/tests/mocks/react-markdown.tsx',

    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/tests/mocks/fileMock.ts',
  },

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // Keep the pattern relative to roots so it works consistently on Windows paths.
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/index.tsx',
    '!src/**/*.stories.tsx',
    '!src/**/*.config.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],

  coverageDirectory: 'coverage',

  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  verbose: true,

  maxWorkers: '50%',

  clearMocks: true,

  restoreMocks: true,

  resetMocks: true,
};
