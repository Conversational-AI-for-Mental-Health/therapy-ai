/// <reference types="cypress" />

describe('Dashboard — Unauthenticated Access', () => {
  it('redirects unauthenticated users away from /dashboard', () => {
    cy.clearLocalStorage();
    cy.visit('/dashboard');
    cy.get('[data-cy="dashboard-container"]').should('not.exist');
  });
});

describe('Dashboard — Layout & Structure', () => {
  beforeEach(() => {
    cy.visitDashboard();
  });

  it('renders the dashboard container', () => {
    cy.get('[data-cy="dashboard-container"]').should('be.visible');
  });

  it('shows the app logo in the header', () => {
    cy.get('img[alt="Therapy AI"]').should('be.visible');
  });

  it('renders Chat and Journal tab buttons', () => {
    cy.get('[data-cy="tab-chat"]').should('be.visible');
    cy.get('[data-cy="tab-journal"]').should('be.visible');
  });

  it('shows Chat tab as active by default', () => {
    cy.get('[data-cy="tab-chat"]').should('have.class', 'active');
    cy.get('[data-cy="chat-input"]').should('be.visible');
  });

  it('switching to Journal tab shows journal panel', () => {
    cy.get('[data-cy="tab-journal"]').click();
    cy.get('[data-cy="journal-panel"]').should('be.visible');
    cy.get('[data-cy="chat-input"]').should('not.exist');
  });

  it('switching back to Chat tab shows chat panel', () => {
    cy.get('[data-cy="tab-journal"]').click();
    cy.get('[data-cy="tab-chat"]').click();
    cy.get('[data-cy="chat-input"]').should('be.visible');
  });

  it('renders the settings button', () => {
    cy.get('[data-cy="settings-btn"]').should('be.visible');
  });

  it('renders the logout button', () => {
    cy.get('[data-cy="logout-btn"]').should('be.visible');
  });
});

describe('Dashboard — Sidebar', () => {
  beforeEach(() => {
    cy.visitDashboard();
  });

  it('sidebar toggle button exists', () => {
    cy.get('[data-cy="sidebar-toggle"]').should('exist');
  });

  it('sidebar opens when toggle is clicked', () => {
    cy.viewport('iphone-6');
    cy.get('[data-cy="sidebar-toggle"]').click();
    cy.get('[data-cy="sidebar"]').should('be.visible');
  });

  it('sidebar closes when toggle is clicked again', () => {
    cy.viewport('iphone-6');
    cy.get('[data-cy="sidebar-toggle"]').click();
    cy.get('[data-cy="sidebar"]').should('be.visible');
    cy.get('[data-cy="sidebar-close"]').click({ force: true });
    cy.get('[data-cy="sidebar"]').should('not.be.visible');
  });

  it('sidebar shows "New Chat" button', () => {
    cy.get('[data-cy="sidebar-toggle"]').click();
    cy.get('[data-cy="new-chat-btn"]').should('be.visible');
  });

  it('clicking New Chat resets the chat to a fresh state', () => {
    cy.get('[data-cy="sidebar-toggle"]').click();
    cy.get('[data-cy="new-chat-btn"]').click();
    cy.contains("Hello! I am here to listen").should('be.visible');
  });
});

describe('Dashboard — Conversation History', () => {
  beforeEach(() => {
    cy.visitDashboard();
  });

  it('past conversations appear in the sidebar', () => {
    cy.get('[data-cy="sidebar-toggle"]').click();
    cy.get('[data-cy="chat-sessions-list"]').should('exist');
  });

  it('clicking a past conversation loads it into the chat view', () => {
    cy.intercept('GET', '**/conversations*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'conv-abc-123',
            title: 'My Previous Session',
            started_at: new Date().toISOString(),
            message_count: 2,
            archived: false,
          },
        ],
      },
    }).as('getConvos');

    cy.intercept('GET', '**/conversations/conv-abc-123*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          _id: 'conv-abc-123',
          title: 'My Previous Session',
          messages: [
            { _id: 'm1', sender: 'user', text: 'Hello there', timestamp: new Date().toISOString() },
            { _id: 'm2', sender: 'ai', text: 'Hi! How can I help?', timestamp: new Date().toISOString() },
          ],
        },
      },
    }).as('getConvo');

    cy.reload();
    cy.wait('@getConvos');

    cy.get('[data-cy="sidebar-toggle"]').click();
    cy.contains('My Previous Session').click();

    cy.wait('@getConvo');
    cy.contains('Hello there').should('be.visible');
    cy.contains('Hi! How can I help?').should('be.visible');
  });

  it('deleting a conversation removes it from the sidebar list', () => {
    cy.intercept('GET', '**/conversations*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          { _id: 'conv-del-001', title: 'Session to Delete', started_at: new Date().toISOString(), message_count: 1, archived: false },
        ],
      },
    }).as('getConvos');

    cy.intercept('DELETE', '**/conversations/conv-del-001', {
      statusCode: 200,
      body: { success: true },
    }).as('deleteConvo');

    cy.reload();
    cy.wait('@getConvos');

    cy.get('[data-cy="sidebar-toggle"]').click();
    cy.get(`[data-cy="session-conv-del-001"]`).find('button').last().click();
    cy.get('[data-cy="delete-session-conv-del-001"]').click();
    cy.wait('@deleteConvo');

    cy.contains('Session to Delete').should('not.exist');
  });
});