export { };

/// <reference types="cypress" />

const API_URL = Cypress.env('apiUrl') || 'http://localhost:3000/api';

const CYPRESS_HEADERS = { 'x-cypress-test': 'true' };

Cypress.Commands.add('registerViaAPI', (name: string, email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/users/register`,
    body: { name, email, password },
    headers: CYPRESS_HEADERS,
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 201 || res.body.success) {
      window.localStorage.setItem('token', res.body.data.token);
      if (res.body.data.refreshToken) {
        window.localStorage.setItem('refreshToken', res.body.data.refreshToken);
      }
      window.localStorage.setItem('user', JSON.stringify(res.body.data.user));
    }
  });
});

Cypress.Commands.add('loginViaAPI', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/users/login`,
    body: { email, password },
    headers: CYPRESS_HEADERS,
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.body.success, 'loginViaAPI: login should succeed').to.be.true;
    window.localStorage.setItem('token', res.body.data.token);
    if (res.body.data.refreshToken) {
      window.localStorage.setItem('refreshToken', res.body.data.refreshToken);
    }
    window.localStorage.setItem('user', JSON.stringify(res.body.data.user));
  });
});

Cypress.Commands.add('seedUser', (name: string, email: string, password: string) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}/users/register`,
    body: { name, email, password },
    headers: CYPRESS_HEADERS,
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 201 || res.body.success) {
      return res.body.data;
    }

    if (res.status === 409 || (res.body.error && res.body.error.toLowerCase().includes('already'))) {
      return cy.request({
        method: 'POST',
        url: `${API_URL}/users/login`,
        body: { email, password },
        headers: CYPRESS_HEADERS,
        failOnStatusCode: false,
      }).then((loginRes) => {
        if (loginRes.status === 200 && loginRes.body.success) {
          return loginRes.body.data;
        }

        if (loginRes.status === 401) {
          return cy.request({
            method: 'POST',
            url: `${API_URL}/users/reset-password`,
            body: { email, password },
            headers: CYPRESS_HEADERS,
          }).then(() => {
            return cy.request({
              method: 'POST',
              url: `${API_URL}/users/login`,
              body: { email, password },
              headers: CYPRESS_HEADERS,
            }).then((retryRes) => retryRes.body.data);
          });
        }
        throw new Error(`seedUser login failed with status ${loginRes.status}`);
      });
    }
    throw new Error(`seedUser registration failed with status ${res.status}`);
  });
});

Cypress.Commands.add('seedAndLogin', (name?: string, email?: string, password?: string) => {
  const seedEmail = email || Cypress.env('testUserEmail');
  const seedPassword = password || Cypress.env('testUserPassword');
  const seedName = name || Cypress.env('testUserName');

  cy.seedUser(seedName, seedEmail, seedPassword).then((data: any) => {
    if (data?.token) {
      window.localStorage.setItem('token', data.token);
      window.localStorage.setItem('user', JSON.stringify(data.user || { name: seedName, email: seedEmail }));
    }
  });
});

Cypress.Commands.add('loginViaUI', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('#login-email').type(email);
  cy.get('#login-password').type(password);
  cy.contains('button', 'Log In').click();
  cy.url({ timeout: 10000 }).should('include', '/dashboard');
});

Cypress.Commands.add('signupViaUI', (name: string, email: string, password: string) => {
  cy.visit('/signup');
  cy.get('#signup-name').type(name);
  cy.get('#signup-email').type(email);
  cy.get('#signup-password').type(password);
  cy.contains('button', 'Create Account').click();
});

Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  cy.visit('/');
});

Cypress.Commands.add('visitDashboard', (name?: string, email?: string, password?: string) => {
  cy.seedAndLogin(name, email, password);
  cy.visit('/dashboard');
  cy.get('[data-cy="dashboard-container"]', { timeout: 10000 }).should('exist');
});

Cypress.Commands.add('openSettings', () => {
  cy.get('[data-cy="settings-btn"]').click();
  cy.get('[data-cy="settings-modal"]', { timeout: 5000 }).should('be.visible');
});

Cypress.Commands.add('sendChatMessage', (message: string) => {
  cy.get('[data-cy="chat-input"]').clear().type(message);
  cy.get('[data-cy="chat-send-btn"]').click();
  cy.get('[data-cy="thinking-bubble"]', { timeout: 30000 }).should('not.exist');
});

Cypress.Commands.add('stubAIResponse', (message = 'I hear you. Tell me more.') => {
  cy.intercept('POST', `${API_URL}/chat`, {
    statusCode: 200,
    body: { success: true, response: message },
  }).as('chatAPI');
});

declare global {
  namespace Cypress {
    interface Chainable {
      registerViaAPI(name: string, email: string, password: string): Cypress.Chainable<any>;
      loginViaAPI(email: string, password: string): Cypress.Chainable<any>;
      seedUser(name: string, email: string, password: string): Cypress.Chainable<any>;
      seedAndLogin(name?: string, email?: string, password?: string): Cypress.Chainable<any>;
      loginViaUI(email: string, password: string): Cypress.Chainable<any>;
      signupViaUI(name: string, email: string, password: string): Cypress.Chainable<any>;
      logout(): Cypress.Chainable<any>;
      visitDashboard(name?: string, email?: string, password?: string): Cypress.Chainable<any>;
      openSettings(): Cypress.Chainable<any>;
      sendChatMessage(message: string): Cypress.Chainable<any>;
      stubAIResponse(message?: string): Cypress.Chainable<any>;
    }
  }
}