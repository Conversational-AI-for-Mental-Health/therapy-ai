import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Set the base URL for all tests to the local development server, which should be running before executing the tests
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Configure the viewport size to a common desktop resolution to ensure consistent test results across different environments, while also allowing for responsive design testing if needed
    viewportWidth: 1280,
    viewportHeight: 800,

    // Set timeouts to reasonable values to balance test reliability and execution speed, allowing for slower responses from the backend while still failing tests that are truly unresponsive
    defaultCommandTimeout: 10000,
    responseTimeout: 30000,
    requestTimeout: 15000,
    pageLoadTimeout: 30000,

    // Enable video recording of test runs for debugging purposes, with a lower compression level to preserve quality while keeping file sizes manageable
    video: true,
    videoCompression: 32,

    // Configure retries to allow for a single retry of failed tests in CI environments, while keeping retries disabled when running tests interactively to avoid masking issues during development
    retries: {
      runMode: 1,
      openMode: 0,
    },

    env: {
      // API and socket URLs for the backend server, which should match the local development environment configuration
      apiUrl: 'http://localhost:3000/api',
      socketUrl: 'http://localhost:3000',

      // Test user credentials for authentication tests, which should correspond to a test user created in the backend database with known credentials
      testUserEmail: 'cypress-test@therapy-ai.test',
      testUserPassword: 'CypressTest123!',
      testUserName: 'Cypress Tester',
    },

    // Setup Node event listeners for Cypress tasks, such as logging messages from tests to the console for better visibility during test runs
    setupNodeEvents(on, config) {
      on('task', {
        log(message: string) {
          console.log('[cypress]', message);
          return null;
        },
      });

      return config;
    },
  },
});
