export { };
/// <reference types="cypress" />

const uniqueEmail = () => `e2e-${Date.now()}@therapy-ai.test`;

describe('Registration', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/signup');
  });

  it('renders the signup form with all required fields', () => {
    cy.get('#signup-name').should('be.visible');
    cy.get('#signup-email').should('be.visible');
    cy.get('#signup-password').should('be.visible');
    cy.contains('button', 'Create Account').should('be.visible');
    cy.contains('Start your journey').should('be.visible');
  });

  it('shows validation error when fields are empty', () => {
    cy.contains('button', 'Create Account').click();
    cy.contains('Please fill in all fields').should('be.visible');
    cy.url().should('include', '/signup');
  });

  it('shows an error when email is already registered', () => {
    cy.registerViaAPI(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword'),
    );
    cy.visit('/signup');

    cy.get('#signup-name').type(Cypress.env('testUserName'));
    cy.get('#signup-email').type(Cypress.env('testUserEmail'));
    cy.get('#signup-password').type(Cypress.env('testUserPassword'));
    cy.contains('button', 'Create Account').click();

    cy.contains(/already|exists|registered/i, { timeout: 8000 }).should('be.visible');
  });

  it('successfully registers a new user and lands on dashboard', () => {
    const email = uniqueEmail();

    cy.get('#signup-name').type('E2E New User');
    cy.get('#signup-email').type(email);
    cy.get('#signup-password').type('NewUserPass123!');
    cy.contains('button', 'Create Account').click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null;
    });
  });

  it('disables the button while the request is in flight', () => {
    cy.intercept('POST', '**/users/register', (req) => {
      req.reply({ delay: 1500, statusCode: 201, body: { success: false, error: 'test' } });
    }).as('slowRegister');

    cy.get('#signup-name').type('Slow User');
    cy.get('#signup-email').type(uniqueEmail());
    cy.get('#signup-password').type('SlowPass123!');
    cy.contains('button', 'Create Account').click();

    cy.contains('button', 'Creating Account...').should('be.disabled');
    cy.wait('@slowRegister');
  });

  it('navigates to login when "Log in" link is clicked', () => {
    cy.contains('Log in').click();
    cy.url().should('include', '/login');
  });

  it('navigates to landing when "Home" link is clicked', () => {
    cy.contains('Home').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });
});

describe('Login', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.seedUser(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword')
    );
    cy.visit('/login');
  });

  it('renders the login form correctly', () => {
    cy.get('#login-email').should('be.visible');
    cy.get('#login-password').should('be.visible');
    cy.contains('button', 'Log In').should('be.visible');
    cy.contains('Welcome Back').should('be.visible');
    cy.contains('Forgot password?').should('be.visible');
  });

  it('shows error when fields are empty', () => {
    cy.contains('button', 'Log In').click();
    cy.contains('Please fill in all fields').should('be.visible');
  });

  it('shows error for invalid credentials', () => {
    cy.get('#login-email').type('notauser@therapy-ai.test');
    cy.get('#login-password').type('WrongPassword999');
    cy.contains('button', 'Log In').click();
    cy.contains(/invalid|incorrect|not found/i, { timeout: 8000 }).should('be.visible');
  });

  it('successfully logs in and redirects to dashboard', () => {
    cy.get('#login-email').type(Cypress.env('testUserEmail'));
    cy.get('#login-password').type(Cypress.env('testUserPassword'));
    cy.contains('button', 'Log In').click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null;
    });
  });

  it('persists auth token in localStorage after login', () => {
    cy.loginViaUI(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));

    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.be.a('string').and.have.length.greaterThan(10);
    });
  });

  it('redirects already authenticated user away from login page', () => {
    cy.loginViaAPI(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
    cy.visit('/login');
    cy.visit('/dashboard');
    cy.get('[data-cy="dashboard-container"]', { timeout: 10000 }).should('exist');
  });

  it('disables button and shows loading state during login', () => {
    cy.intercept('POST', '**/users/login', (req) => {
      req.reply({ delay: 1500, statusCode: 401, body: { success: false, error: 'Wrong' } });
    }).as('slowLogin');

    cy.get('#login-email').type(Cypress.env('testUserEmail'));
    cy.get('#login-password').type('slowpass');
    cy.contains('button', 'Log In').click();

    cy.contains('button', 'Logging in...').should('be.disabled');
    cy.wait('@slowLogin');
  });

  it('navigates to signup when "Sign up" link is clicked', () => {
    cy.contains('Sign up').click();
    cy.url().should('include', '/signup');
  });
});

describe('Logout', () => {
  beforeEach(() => {
    cy.seedAndLogin();
    cy.visit('/dashboard');
    cy.get('[data-cy="dashboard-container"]', { timeout: 10000 }).should('exist');
  });

  it('clears localStorage and redirects on logout', () => {
    cy.get('[data-cy="logout-btn"]').click();

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('user')).to.be.null;
    });

    cy.url().should('not.include', '/dashboard');
  });

  it('cannot access dashboard after logout', () => {
    cy.get('[data-cy="logout-btn"]').click();
    cy.visit('/dashboard');
    cy.get('[data-cy="dashboard-container"]').should('not.exist');
  });
});

describe('Forgot Password Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.seedUser(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword')
    );
    cy.visit('/login');
  });

  it('shows error if email is empty when Forgot password is clicked', () => {
    cy.contains('Forgot password?').click();
    cy.contains('Please enter your email first').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('navigates to reset-password page when a registered email is submitted', () => {
    cy.get('#login-email').type(Cypress.env('testUserEmail'));
    cy.contains('Forgot password?').click();

    cy.url({ timeout: 10000 }).should('include', '/reset-password');
    cy.get('#reset-email').should('have.value', Cypress.env('testUserEmail'));
  });

  it('shows an error for an unregistered email', () => {
    cy.get('#login-email').type('nobody@therapy-ai.test');
    cy.contains('Forgot password?').click();

    cy.contains(/no account|not found/i, { timeout: 8000 }).should('be.visible');
    cy.url().should('include', '/login');
  });
});

describe('Reset Password Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/reset-password');
  });

  it('renders all three fields and the submit button', () => {
    cy.get('#reset-email').should('be.visible');
    cy.get('#reset-password').should('be.visible');
    cy.get('#reset-confirm-password').should('be.visible');
    cy.contains('button', 'Reset Password').should('be.visible');
  });

  it('shows error when fields are empty', () => {
    cy.contains('button', 'Reset Password').click();
    cy.contains('Please fill in all fields').should('be.visible');
  });

  it('shows error when passwords do not match', () => {
    cy.get('#reset-email').type(Cypress.env('testUserEmail'));
    cy.get('#reset-password').type('NewPass123!');
    cy.get('#reset-confirm-password').type('DifferentPass456!');
    cy.contains('button', 'Reset Password').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('shows error when password is too short', () => {
    cy.get('#reset-email').type(Cypress.env('testUserEmail'));
    cy.get('#reset-password').type('short');
    cy.get('#reset-confirm-password').type('short');
    cy.contains('button', 'Reset Password').click();
    cy.contains('at least 8 characters').should('be.visible');
  });

  it('successfully resets password for a registered user', () => {
    cy.seedUser(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword')
    );

    cy.get('#reset-email').type(Cypress.env('testUserEmail'));
    cy.get('#reset-password').type('ResetNewPass789!');
    cy.get('#reset-confirm-password').type('ResetNewPass789!');
    cy.contains('button', 'Reset Password').click();

    cy.contains(/reset successful|can now login/i, { timeout: 8000 }).should('be.visible');
  });

  it('navigates back to login from the "Log In" link', () => {
    cy.contains('Log In').click();
    cy.url().should('include', '/login');
  });
});