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

  const email = `detox_nav_${Date.now()}@test.com`;

  await waitFor(element(by.text('Sign up')))
    .toBeVisible()
    .withTimeout(10000);
  await element(by.text('Sign up')).tap();

  await waitFor(element(by.id('signup-name')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('signup-name')).replaceText('Nav Tester');
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

describe('Navigation & Modals E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
    await ensureOnDashboard();
  });

  it('opens settings modal and sees expected content', async () => {

    await element(by.text('👤')).tap();

    await waitFor(element(by.text('DATA MANAGEMENT')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('Log Out'))).toBeVisible();
    await expect(element(by.text('PRIVACY CONTROLS'))).toBeVisible();
  });

  it('closes settings modal by tapping background in code', async () => {

    await element(by.id('close-settings-modal')).tap();

    await waitFor(element(by.text('AI Chat')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('opens and closes sidebar', async () => {
    await element(by.text('☰')).tap();

    await waitFor(element(by.text('✏️  New Conversation')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.text('✕')).tap();

    await waitFor(element(by.text('AI Chat')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
