import './commands';
import '@testing-library/cypress/add-commands';

Cypress.on('window:confirm', () => true);
Cypress.on('uncaught:exception', (err) => {
    cy.task('log', `UNCAUGHT EXCEPTION: ${err.message}`);
    const ignored = [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed',
        'Cannot read properties of null',
        'socket',
    ];
    if (ignored.some((msg) => err.message.includes(msg))) return false;
    return true;
});

Cypress.on('fail', (err, runnable) => {
    cy.task('log', `TEST FAILED: ${runnable.title} - ERROR: ${err.message}`);
    throw err;
});

beforeEach(() => {
    cy.task('log', `▶ ${Cypress.currentTest.titlePath.join(' > ')}`);

    // Add header to all API requests to bypass rate limiting in backend
    cy.intercept({ url: '**/api/**' }, (req) => {
        req.headers['x-cypress-test'] = 'true';
        req.continue();
    });
});