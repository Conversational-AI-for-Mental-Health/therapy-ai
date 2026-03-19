/// <reference types="cypress" />

describe('Settings — Modal Lifecycle', () => {
  beforeEach(() => {
    cy.visitDashboard();
  });

  it('settings modal is hidden by default', () => {
    cy.get('[data-cy="settings-modal"]').should('not.exist');
  });

  it('opens settings modal when settings button is clicked', () => {
    cy.openSettings();
    cy.get('[data-cy="settings-modal"]').should('be.visible');
  });

  it('closes settings modal when X button is clicked', () => {
    cy.openSettings();
    cy.get('[data-cy="settings-modal"]')
      .find('div.flex.justify-end button').click();
    cy.get('[data-cy="settings-modal"]').should('not.exist');
  });

  it('closes settings modal when clicking the backdrop overlay', () => {
    cy.openSettings();
    cy.get('[data-cy="settings-modal"]').click('topLeft', { force: true });
    cy.get('[data-cy="settings-modal"]').should('not.exist');
  });
});

describe('Settings — User Info Display', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.openSettings();
  });

  it('shows the user avatar initial', () => {
    cy.get('[data-cy="settings-modal"]').find('img[src*="ui-avatars.com"]').should('exist');
  });

  it('shows the user email', () => {
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user') || '{}');
      if (user.email) {
        cy.get('[data-cy="settings-modal"]').contains(user.email).should('be.visible');
      }
    });
  });
});

describe('Settings — Display Name', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.openSettings();
  });

  it('shows the display name input field', () => {
    cy.get('[data-cy="settings-modal"]')
      .find('input[placeholder="Your name"]')
      .should('be.visible');
  });

  it('updates display name successfully', () => {
    cy.intercept('PATCH', '**/users/name', {
      statusCode: 200,
      body: { success: true, data: { name: 'Updated Cypress Name' } },
    }).as('updateName');

    cy.get('[data-cy="settings-modal"]')
      .find('input[placeholder="Your name"]')
      .clear()
      .type('Updated Cypress Name')
      .blur();

    cy.wait('@updateName').its('request.body').should('deep.include', { name: 'Updated Cypress Name' });
  });

  it('shows error when name update fails', () => {
    cy.intercept('PATCH', '**/users/name', {
      statusCode: 500,
      body: { success: false, error: 'Failed to update name.' },
    }).as('failName');

    cy.get('[data-cy="settings-modal"]')
      .find('input[placeholder="Your name"]')
      .clear()
      .type('Will fail')
      .blur();

    cy.wait('@failName');
    cy.contains('Failed to update name').should('be.visible');
  });

  it('does not call API when name is unchanged', () => {
    cy.intercept('PATCH', '**/users/name').as('nameReq');

    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user') || '{}');
      const currentName = user.name || '';

      cy.get('[data-cy="settings-modal"]')
        .find('input[placeholder="Your name"]')
        .clear()
        .type(currentName)
        .blur();

      cy.wait(500);
      cy.get('@nameReq.all').should('have.length', 0);
    });
  });
});

describe('Settings — Change Password', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.openSettings();
    cy.contains('button', /change password/i).click();
    cy.get('[data-cy="password-modal"]', { timeout: 5000 }).should('be.visible');
  });

  it('shows Change Password modal when button is clicked', () => {
    cy.get('[data-cy="password-modal"]').should('be.visible');
  });

  it('shows all three password fields', () => {
    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="Current Password"]')
      .should('be.visible');
    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="New Password"]')
      .should('be.visible');
  });

  it('shows error when fields are empty', () => {
    cy.get('[data-cy="password-modal"]').contains('button', /save/i).click();
    cy.contains(/required|fill in/i).should('be.visible');
  });

  it('shows error when current password is wrong', () => {
    cy.intercept('PATCH', '**/users/password', {
      statusCode: 400,
      body: { success: false, error: 'Current password is incorrect' },
    }).as('wrongPw');

    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="Current Password"]').type('WrongPass!');
    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="New Password"]').type('NewPass123!');
    cy.get('[data-cy="password-modal"]').contains('button', /save/i).click();

    cy.wait('@wrongPw');
    cy.contains(/incorrect|wrong/i).should('be.visible');
  });

  it('successfully changes password', () => {
    cy.intercept('PATCH', '**/users/password', {
      statusCode: 200,
      body: { success: true, message: 'Password updated successfully' },
    }).as('updatePw');

    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="Current Password"]').type(Cypress.env('testUserPassword'));
    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="New Password"]').type('UpdatedPass456!');
    cy.get('[data-cy="password-modal"]').contains('button', /save/i).click();

    cy.wait('@updatePw');
    cy.get('[data-cy="password-modal"]').should('not.exist');
  });

  it('closes the password modal after successful update', () => {
    cy.intercept('PATCH', '**/users/password', {
      statusCode: 200,
      body: { success: true, message: 'Password updated successfully' },
    }).as('updatePw');

    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="Current Password"]').type(Cypress.env('testUserPassword'));
    cy.get('[data-cy="password-modal"]')
      .find('input[placeholder="New Password"]').type('ClosedModal789!');
    cy.get('[data-cy="password-modal"]').contains('button', /save/i).click();

    cy.wait('@updatePw');
    cy.get('[data-cy="password-modal"]').should('not.exist');
  });
});