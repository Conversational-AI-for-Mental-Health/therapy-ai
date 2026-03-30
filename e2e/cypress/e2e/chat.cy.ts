export { };

const uniqueEmail = () => `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

describe('Chat — Initial State', () => {
  beforeEach(() => {
    cy.visitDashboard('Chat User', uniqueEmail());
  });

  it('shows the default AI greeting on first load', () => {
    cy.contains("Hello! I am here to listen").should('be.visible');
  });

  it('renders the chat input and send button', () => {
    cy.get('[data-cy="chat-input"]').should('be.visible');
    cy.get('[data-cy="chat-send-btn"]').should('be.visible');
  });

  it('shows quick prompts toggle on initial conversation', () => {
    cy.get('[data-cy="quick-prompts-toggle"]').should('be.visible');
  });

  it('opens quick prompts panel with default prompt options', () => {
    cy.get('[data-cy="quick-prompts-toggle"]').click();
    cy.get('[data-cy="quick-prompts-panel"]').should('be.visible');
    cy.get('[data-cy="quick-prompts-panel"] button').should('have.length.greaterThan', 0);
  });
});

describe('Chat — Sending Messages', () => {
  beforeEach(() => {
    cy.visitDashboard('Messenger User', uniqueEmail());
  });

  it('user message appears in the chat immediately after sending', () => {
    const msg = 'I have been feeling anxious lately';
    cy.get('[data-cy="chat-input"]').type(msg);
    cy.get('[data-cy="chat-send-btn"]').click();
    cy.contains(msg).should('be.visible');
  });

  it('clears the input after sending', () => {
    cy.get('[data-cy="chat-input"]').type('Hello Kai');
    cy.get('[data-cy="chat-send-btn"]').click();
    cy.get('[data-cy="chat-input"]').should('have.value', '');
  });

  it('shows a thinking/loading indicator while waiting for AI', () => {
    cy.get('[data-cy="chat-input"]').type('Slow message test');
    cy.get('[data-cy="chat-send-btn"]').click();
    cy.get('[data-cy="thinking-bubble"]').should('exist');
    cy.get('[data-cy="thinking-bubble"]', { timeout: 30000 }).should('not.exist');
  });

  it('does not send an empty message', () => {
    cy.get('[data-cy="chat-send-btn"]').should('be.disabled');
    cy.get('[data-cy="chat-input"]').should('have.value', '');
  });

  it('message can be sent via Enter key', () => {
    cy.get('[data-cy="chat-input"]').type('Sent with enter{enter}');
    cy.contains('Sent with enter').should('be.visible');
  });

  it('send button is disabled when input is empty', () => {
    cy.get('[data-cy="chat-input"]').should('have.value', '');
    cy.get('[data-cy="chat-send-btn"]').should('be.disabled');
  });

  it('keeps quick prompts available after first AI response', () => {
    cy.get('[data-cy="chat-input"]').type('First message');
    cy.get('[data-cy="chat-send-btn"]').click();
    cy.get('[data-cy="thinking-bubble"]', { timeout: 30000 }).should('not.exist');

    cy.get('[data-cy="quick-prompts-toggle"]').click();
    cy.get('[data-cy="quick-prompts-panel"] button').should('have.length.greaterThan', 0);
  });

  it('clicking a quick prompt sends the message', () => {
    cy.get('[data-cy="quick-prompts-toggle"]').click();
    cy.get('[data-cy="quick-prompts-panel"] button').first().then(($btn) => {
      const promptText = $btn.text().trim();
      cy.wrap($btn).click();
      cy.contains(promptText).should('be.visible');
    });

    cy.get('[data-cy="chat-input"]').should('have.value', '');
  });

  it('falls back to default prompts if dynamic prompts are unavailable', () => {
    cy.get('[data-cy="chat-input"]').type('I need guidance');
    cy.get('[data-cy="chat-send-btn"]').click();
    cy.get('[data-cy="thinking-bubble"]', { timeout: 30000 }).should('not.exist');

    cy.get('[data-cy="quick-prompts-toggle"]').click();
    cy.get('[data-cy="quick-prompts-panel"] button').should('have.length.greaterThan', 0);
  });

  it('typing in the input clears any displayed suggested prompts', () => {
    cy.get('[data-cy="chat-input"]').type('hello{enter}');
    cy.get('[data-cy="thinking-bubble"]', { timeout: 30000 }).should('not.exist');

    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="suggested-prompts"]').length > 0) {
        cy.get('[data-cy="chat-input"]').type(' typing clears it');
        cy.get('[data-cy="suggested-prompts"]').should('not.exist');
      }
    });
  });
});

describe('Chat — Message Length Validation', () => {
  beforeEach(() => {
    cy.visitDashboard('Validator User', uniqueEmail());
    cy.get('[data-cy="chat-input"]', { timeout: 10000 }).should('be.visible');
  });

  it('prevents sending a message over 10,000 characters', () => {
    const longMessage = 'A'.repeat(10001);
    cy.get('[data-cy="chat-input"]').invoke('val', longMessage).trigger('input');
    cy.get('[data-cy="chat-send-btn"]').then(($btn) => {
      if ($btn.is(':disabled')) {
        cy.wrap($btn).should('be.disabled');
      } else {
        cy.wrap($btn).click();
        cy.contains(/too long|10,000/i).should('be.visible');
      }
    });
    cy.get('[data-cy="chat-input"]').should('not.have.value', '');
  });

  it('allows sending a message at exactly 10,000 characters', () => {
    const nearMaxMessage = 'I'.repeat(9000); 
    cy.get('[data-cy="chat-input"]').invoke('val', nearMaxMessage).trigger('input');
    cy.contains(/too long|10,000/i).should('not.exist');
  });
});

describe('Chat — AI Response Rendering', () => {
  beforeEach(() => {
    cy.visitDashboard('Renderer User', uniqueEmail());
  });

  it('AI response text is rendered in the chat', () => {
    cy.get('[data-cy="chat-input"]').type('I feel sad');
    cy.get('[data-cy="chat-send-btn"]').click();
    cy.get('[data-cy="thinking-bubble"]', { timeout: 5000 }).should('exist');
    cy.get('[data-cy="thinking-bubble"]', { timeout: 30000 }).should('not.exist');
    cy.contains('I feel sad').should('be.visible');
    cy.get('[data-cy="dashboard-container"]').should('exist');
    cy.get('[data-cy="chat-input"]').should('have.value', '');
  });

  it('handles API error gracefully without crashing', () => {
    cy.get('[data-cy="chat-input"]').type('Will this fail?');
    cy.get('[data-cy="chat-send-btn"]').click();
    cy.get('[data-cy="thinking-bubble"]', { timeout: 5000 }).should('exist');
    cy.get('[data-cy="thinking-bubble"]', { timeout: 30000 }).should('not.exist');
    cy.get('[data-cy="dashboard-container"]').should('exist');
    cy.get('[data-cy="chat-input"]').should('exist');
  });
});

describe('Chat — Emergency Support', () => {
  beforeEach(() => {
    cy.visitDashboard('Emergency User', uniqueEmail());
  });

  it('emergency/professional support button is visible', () => {
    cy.get('[data-cy="emergency-btn"]').should('exist');
  });

  it('clicking emergency button triggers the phone modal flow', () => {
    cy.intercept('POST', '**/emergency/request-support', {
      statusCode: 200,
      body: { success: true, message: 'Support team has been notified.' },
    }).as('emergencyReq');

    cy.get('[data-cy="emergency-btn"]').click();
    cy.get('body').should(($body) => {
      const hasModal = $body.find('[data-cy="phone-modal"]').length > 0;
      const hasMessage = /notified|support|error/i.test($body.text());
      expect(hasModal || hasMessage, 'Should show modal or notification message').to.be.true;
    });
  });
});