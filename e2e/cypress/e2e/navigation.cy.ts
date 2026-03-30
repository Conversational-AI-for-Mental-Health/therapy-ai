/// <reference types="cypress" />

describe('Landing Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('renders the hero section and CTA buttons', () => {
    cy.contains(/mental health|therapy|Kai/i).should('be.visible');
    cy.contains('button', /Sign Up|Get Started/i).should('be.visible');
    cy.contains('button', /Log In/i).should('be.visible');
  });

  it('renders the nav logo', () => {
    cy.get('nav img[alt="Therapy AI"]').should('be.visible');
  });

  it('renders the Features and How It Works nav links', () => {
    cy.get('a[href="#features"]').should('exist');
    cy.get('a[href="#how-it-works"]').should('exist');
  });

  it('navigates to /login when Log In is clicked', () => {
    cy.get('nav').contains('button', 'Log In').click();
    cy.url().should('include', '/login');
  });

  it('navigates to /signup when Sign Up is clicked', () => {
    cy.get('nav').contains('button', 'Sign Up').click();
    cy.url().should('include', '/signup');
  });

  it('footer contains Privacy Policy link that navigates correctly', () => {
    cy.contains('button', 'Privacy Policy').click();
    cy.url().should('include', '/privacy');
    cy.contains(/privacy/i).should('be.visible');
  });

  it('footer contains Terms & Conditions link that navigates correctly', () => {
    cy.contains('button', 'Terms & Conditions').click();
    cy.url().should('include', '/terms');
    cy.contains(/terms/i).should('be.visible');
  });

  it('footer Our Story link navigates correctly', () => {
    cy.contains('button', 'Our Story').click();
    cy.url().should('include', '/story');
  });

  it('footer Contact Us link navigates correctly', () => {
    cy.contains('button', 'Contact Us').click();
    cy.url().should('include', '/contact');
  });

  it('crisis banner is visible in the footer', () => {
    cy.contains('988').should('be.visible');
    cy.contains('741741').should('be.visible');
  });

  it('dark mode toggle switches theme', () => {
    cy.get('html').should('not.have.class', 'dark');
    cy.get('button').contains('🌙').click();
    cy.get('html').should('have.class', 'dark');
    cy.get('button').contains('☀️').click();
    cy.get('html').should('not.have.class', 'dark');
  });
});

describe('Direct URL Routing (Deep Links)', () => {
  it('loads /login directly', () => {
    cy.visit('/login');
    cy.get('#login-email').should('be.visible');
  });

  it('loads /signup directly', () => {
    cy.visit('/signup');
    cy.get('#signup-name').should('be.visible');
  });

  it('loads /reset-password directly', () => {
    cy.visit('/reset-password');
    cy.get('#reset-email').should('be.visible');
  });

  it('loads /privacy directly', () => {
    cy.visit('/privacy');
    cy.contains(/privacy/i).should('be.visible');
  });

  it('loads /terms directly', () => {
    cy.visit('/terms');
    cy.contains(/terms/i).should('be.visible');
  });

  it('loads /story directly', () => {
    cy.visit('/story');
    cy.url().should('include', '/story');
  });

  it('loads /contact directly', () => {
    cy.visit('/contact');
    cy.url().should('include', '/contact');
  });

  it('falls back to landing page for unknown routes', () => {
    cy.visit('/this-does-not-exist');
    cy.get('[data-cy="not-found-page"]').should('exist');
    cy.contains('404').should('be.visible');
    cy.contains('Page not found').should('be.visible');
  });
});

describe('Mobile Navigation Menu', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.viewport(390, 844); // iPhone 14 Pro
    cy.visit('/');
  });

  it('shows hamburger menu button on mobile', () => {
    cy.get('button.lg\\:hidden').should('exist');
    cy.get('button.hidden.lg\\:block').should('not.be.visible');
  });

  it('opens and closes the mobile sidebar', () => {
    cy.get('button.lg\\:hidden').click();
    cy.get('aside').contains('button', 'Log In').should('be.visible');
    cy.get('aside').contains('button', 'Sign Up').should('be.visible');

    cy.get('aside button').first().click();
    cy.get('aside').contains('button', 'Log In').should('not.be.visible');
  });

  it('mobile sidebar Log In button navigates to /login', () => {
    cy.get('button.lg\\:hidden').click();
    cy.get('aside').contains('button', 'Log In').click();
    cy.url().should('include', '/login');
  });

  it('mobile sidebar Sign Up button navigates to /signup', () => {
    cy.get('button.lg\\:hidden').click();
    cy.get('aside').contains('button', 'Sign Up').click();
    cy.url().should('include', '/signup');
  });

  it('backdrop click closes the mobile sidebar', () => {
    cy.get('button.lg\\:hidden').click();
    cy.get('aside').contains('button', 'Log In').should('be.visible');

    cy.get('div.fixed.inset-0').click({ force: true });
    cy.get('aside').contains('button', 'Log In').should('not.be.visible');
  });
});

describe('Terms Page', () => {
  beforeEach(() => cy.visit('/terms'));

  it('renders terms page content', () => {
    cy.contains(/terms/i).should('be.visible');
  });

  it('contains medical disclaimer section', () => {
    cy.contains(/not a substitute|professional/i).should('exist');
  });
});

describe('Privacy Policy Page', () => {
  beforeEach(() => cy.visit('/privacy'));

  it('renders privacy policy content', () => {
    cy.contains(/privacy/i).should('be.visible');
  });
});