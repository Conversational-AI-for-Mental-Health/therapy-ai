/// <reference types="cypress" />

describe('Journal — Panel Access', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.get('[data-cy="tab-journal"]').click();
    cy.get('[data-cy="journal-panel"]').should('be.visible');
  });

  it('shows the journal entry text area', () => {
    cy.get('[data-cy="journal-text-input"]').should('be.visible');
  });

  it('shows the mood selection options', () => {
    cy.get('[data-cy="mood-options"]').should('be.visible');
    cy.get('[data-cy="mood-options"] div').should('have.length.greaterThan', 2);
  });

  it('shows the Save Entry button', () => {
    cy.contains('button', /save entry/i).should('be.visible');
  });
});

describe('Journal — Creating Entries', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.get('[data-cy="tab-journal"]').click();
  });

  it('shows alert/error when saving without selecting a mood', () => {
    cy.get('[data-cy="journal-text-input"]').type('A journal entry without a mood');
    cy.contains('button', /save entry/i).click();
    cy.contains(/select a mood|please/i)
      .scrollIntoView()
      .should('exist');
  });

  it('shows alert/error when saving without entering text', () => {
    cy.get('[data-cy="mood-options"] div').first().click();
    cy.contains('button', /save entry/i).click();
    cy.contains(/write an entry|please/i)
      .scrollIntoView()
      .should('exist');
  });

  it('successfully creates a new journal entry', () => {
    cy.get('[data-cy="mood-options"] div').contains('😌').click();
    cy.get('[data-cy="journal-text-input"]').type('Today was a calm and peaceful day.');
    cy.contains('button', /save entry/i).click();

    cy.contains('Today was a calm and peaceful day.').should('be.visible');
  });

  it('clears the input after saving', () => {
    cy.get('[data-cy="mood-options"] div').first().click();
    cy.get('[data-cy="journal-text-input"]').type('Entry that should clear');
    cy.contains('button', /save entry/i).click();

    cy.get('[data-cy="journal-text-input"]').should('have.value', '');
  });

  it('clears mood selection after saving', () => {
    cy.get('[data-cy="mood-options"] div').first().click();
    cy.get('[data-cy="journal-text-input"]').type('Mood reset test');
    cy.contains('button', /save entry/i).click();

    cy.get('[data-cy="mood-options"] div.selected')
      .should('have.length', 0);
  });

  it('new entry appears at the top of the entries list', () => {
    cy.get('[data-cy="mood-options"] div').first().click();
    cy.get('[data-cy="journal-text-input"]').type('I am the newest entry');
    cy.contains('button', /save entry/i).click();

    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .should('contain', 'I am the newest entry');
  });

  it('can create multiple entries in sequence', () => {
    const entries = ['First entry', 'Second entry', 'Third entry'];

    entries.forEach((text) => {
      cy.get('[data-cy="mood-options"] div').first().click();
      cy.get('[data-cy="journal-text-input"]').clear().type(text);
      cy.contains('button', /save entry/i).click();
    });

    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]')
      .should('have.length.greaterThan', 2);
  });
});

describe('Journal — Editing Entries', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.get('[data-cy="tab-journal"]').click();

    cy.get('[data-cy="mood-options"] div').first().click();
    cy.get('[data-cy="journal-text-input"]').type('Original entry text');
    cy.contains('button', /save entry/i).click();
    cy.contains('Original entry text').should('be.visible');
  });

  it('edit button makes entry text editable', () => {
    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('[data-cy="edit-entry-btn"]').click();

    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('textarea, input[type="text"]').should('be.visible');
  });

  it('updated text is saved and displayed after editing', () => {
    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('[data-cy="edit-entry-btn"]').click();

    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('textarea, input[type="text"]')
      .clear()
      .type('Updated entry text');

    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('[data-cy="save-edit-btn"]').click();

    cy.contains('Updated entry text').scrollIntoView().should('exist');
    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .should('not.contain', 'Original entry text');
  });
});

describe('Journal — Deleting Entries', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.get('[data-cy="tab-journal"]').click();

    cy.get('[data-cy="mood-options"] div').first().click();
    cy.get('[data-cy="journal-text-input"]').type('Entry to be deleted');
    cy.contains('button', /save entry/i).click();
    cy.contains('Entry to be deleted').should('be.visible');
  });

  it('delete button removes the entry from the list', () => {
    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('[data-cy="delete-entry-btn"]').click();

    cy.contains('Entry to be deleted').should('not.exist');
  });
});

describe('Journal — Mood Selection', () => {
  beforeEach(() => {
    cy.visitDashboard();
    cy.get('[data-cy="tab-journal"]').click();
  });

  it('only one mood can be selected at a time', () => {
    cy.get('[data-cy="mood-options"] div').eq(0).click();
    cy.get('[data-cy="mood-options"] div').eq(1).click();

    cy.get('[data-cy="mood-options"] div.selected')
      .should('have.length', 1);
  });

  it('selected mood is visually highlighted', () => {
    cy.get('[data-cy="mood-options"] div').first().click();
    cy.get('[data-cy="mood-options"] div').first()
      .should('have.class', 'selected')
      
  });
});

describe('Journal — AI Insights', () => {
  const longText = 'I have been feeling overwhelmed with work this week and it has been really affecting my mental health in ways that I did not expect. Every morning I wake up with a sense of dread about the day ahead and it is hard to find motivation to get started. I have been trying to practice mindfulness and take short breaks but it does not seem to be helping as much as I hoped it would. I need to find better coping strategies going forward because this level of stress is not sustainable for me in the long run at all.';

  beforeEach(() => {
    cy.visitDashboard();
    cy.get('[data-cy="tab-journal"]').click();

    cy.get('[data-cy="mood-options"] div').first().click();
    cy.get('[data-cy="journal-text-input"]').type(longText);
    cy.contains('button', /save entry/i).click();

    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('button[title="View full entry"]').click();
  });

  it('Get Insights button is visible on a saved entry', () => {
    cy.get('[data-cy="journal-entries"] [data-cy^="journal-entry-"]').first()
      .find('[data-cy="insights-btn"]').should('exist');
  });
});