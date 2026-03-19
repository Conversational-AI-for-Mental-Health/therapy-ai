# Therapy AI — End-to-End Tests (Cypress)

## Overview

Cypress E2E tests covering every user-facing feature. Tests run against the real frontend, backend, and Python AI service — no mocking of the application itself, only optional stubs for slow operations where noted.

## Prerequisites

- Node 18+, Yarn 4.12.0
- MongoDB running on `localhost:27017`
- Backend running on `localhost:3000`
- Frontend running on `localhost:8080`
- Python AI service running on `localhost:5000`

## Quick Start

```bash
# 1. Start MongoDB (if not already running via Docker)
docker-compose up -d mongo

# 2. Start the Python AI service
cd conversation_ai && pip install -r requirements.txt && python app.py

# 3. Start the backend
cd backend && yarn dev

# 4. Start the frontend
cd frontend && yarn dev

# 5. Run Cypress
cd e2e
yarn install
yarn cy:open        # interactive mode (recommended during development)
yarn cy:run         # headless mode (CI)
```

> **Note:** The chat tests (`chat.cy.ts`) require the Python AI service to be running. Without it, messages will send but the thinking bubble will never appear due to the error message and those tests will time out.

## Test Structure

```
e2e/
├── cypress.config.ts          # Cypress config, env vars, cy.task definitions
├── tsconfig.json
├── package.json
│
└── cypress/
    ├── fixtures/
    │   └── testData.json      # Reusable test data (users, messages, etc.)
    │
    ├── support/
    │   ├── e2e.ts             # Global setup, uncaught exception filters
    │   └── commands.ts        # Custom cy.* commands
    │
    └── e2e/
        ├── api.cy.ts          # Backend API contract tests (no browser UI)
        ├── auth.cy.ts         # Registration, login, logout, forgot/reset password
        ├── chat.cy.ts         # Sending messages, AI response, thinking indicator
        ├── dashboard.cy.ts    # Layout, tabs, sidebar, conversation history
        ├── journal.cy.ts      # Create, edit, delete entries, mood selection
        ├── navigation.cy.ts   # Landing page, routing, footer, mobile menu
        └── settings.cy.ts     # Display name, change password, modal lifecycle
  
```

## Custom Commands

| Command | Description |
|---|---|
| `cy.seedUser(name, email, pw)` | Registers user via API, handles 409 if already exists |
| `cy.seedAndLogin(name?, email?, pw?)` | Seeds user and writes token to localStorage |
| `cy.loginViaAPI(email, pw)` | Logs in via API and seeds localStorage |
| `cy.registerViaAPI(name, email, pw)` | Registers via API and seeds localStorage |
| `cy.loginViaUI(email, pw)` | Logs in through the browser UI |
| `cy.visitDashboard(name?, email?, pw?)` | Seeds login and navigates to `/dashboard` |
| `cy.openSettings()` | Clicks settings button and waits for modal |

## Running Specific Suites

```bash
yarn cy:run:auth        # auth tests only
yarn cy:run:dashboard   # dashboard tests only
yarn cy:run:chat        # chat tests only
yarn cy:run:journal     # journal tests only
yarn cy:run:settings    # settings tests only
yarn cy:run:navigation  # navigation tests only
yarn cy:run:api         # API contract tests only
```

## Test User

A shared test user is seeded automatically before each suite that needs it:

| Field | Value |
|---|---|
| Email | `cypress-test@therapy-ai.test` |
| Password | `CypressTest123!` |
| Name | `Cypress Tester` |

Chat and dashboard tests create isolated users with unique emails per run to avoid session conflicts.

## Environment Variables

Defaults live in `cypress.config.ts`. Override via `cypress.env.json` (gitignored) or CLI flags:

```bash
CYPRESS_API_URL=http://localhost:3000/api yarn cy:run
```

| Variable | Default | Description |
|---|---|---|
| `apiUrl` | `http://localhost:3000/api` | Backend API base |
| `socketUrl` | `http://localhost:3000` | Socket.io server |
| `testUserEmail` | `cypress-test@therapy-ai.test` | Test user email |
| `testUserPassword` | `CypressTest123!` | Test user password |
| `testUserName` | `Cypress Tester` | Test user display name |
