/// <reference types="detox" />
async function ensureOnDashboard() {

  await device.disableSynchronization();

  try {
    await waitFor(element(by.text('AI Chat')))
      .toBeVisible()
      .withTimeout(8000);
    await device.enableSynchronization();
    return;
  } catch {

  }

  const email = `detox_journal_${Date.now()}@test.com`;

  await waitFor(element(by.text('Sign up')))
    .toBeVisible()
    .withTimeout(10000);
  await element(by.text('Sign up')).tap();

  await waitFor(element(by.id('signup-name')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('signup-name')).replaceText('Journal Tester');
  await element(by.id('signup-email')).replaceText(email);
  await element(by.id('signup-password')).replaceText('Detox1234Test');
  try { await element(by.id('signup-password')).tapReturnKey(); } catch {  }

  await waitFor(element(by.text('Create Account')))
    .toBeVisible()
    .withTimeout(3000);
  await element(by.text('Create Account')).tap();

  await waitFor(element(by.text('AI Chat')))
    .toBeVisible()
    .withTimeout(15000);

  await device.enableSynchronization();
}

describe('Journal Core E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
    await ensureOnDashboard();
  });

  it('navigates to journal tab', async () => {
    await element(by.text('Journal')).tap();

    await waitFor(element(by.text('How are you feeling today?')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('creates a journal entry', async () => {

    await element(by.text('😊')).tap();

    await element(by.id('journal-input')).replaceText('Feeling great today about writing tests!');
    await element(by.text('Save Entry')).tap();

    await waitFor(element(by.text('Feeling great today about writing tests!')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
