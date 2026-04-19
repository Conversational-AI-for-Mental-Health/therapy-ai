/// <reference types="detox" />
async function ensureLoggedOut() {
  try {
    await expect(element(by.text('AI Chat'))).toBeVisible();
    await element(by.text('👤')).tap();

    await waitFor(element(by.text('Log Out'))).toBeVisible().withTimeout(2000);
    await element(by.text('Log Out')).tap();

    await waitFor(element(by.text('Yes, Log Out'))).toBeVisible().withTimeout(2000);
    await element(by.text('Yes, Log Out')).tap();

    await waitFor(element(by.id('login-email'))).toBeVisible().withTimeout(5000);
    return;
  } catch { }

  try {
    await expect(element(by.text('Create Account ✨'))).toBeVisible();
    await element(by.text('Login')).tap();
    await waitFor(element(by.id('login-email'))).toBeVisible().withTimeout(5000);
    return;
  } catch { }
}

describe('Authentication Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await ensureLoggedOut();
  });

  const testEmail = `detox_auth_${Date.now()}@test.com`;
  const testPassword = 'Detox1234Test';

  it('should show the login screen by default', async () => {
    await waitFor(element(by.text('Welcome Back 👋')))
      .toBeVisible()
      .withTimeout(10000);

    await expect(element(by.id('login-email'))).toBeVisible();
    await expect(element(by.id('login-password'))).toBeVisible();
    await expect(element(by.text('Login'))).toBeVisible();
  });

  it('should register a new user and land on dashboard', async () => {
    await waitFor(element(by.text('Sign up')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text('Sign up')).tap();

    await waitFor(element(by.id('signup-name')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('signup-name')).replaceText('Detox User');
    await element(by.id('signup-email')).replaceText(testEmail);
    await element(by.id('signup-password')).replaceText(testPassword);

    try { await element(by.id('signup-password')).tapReturnKey(); } catch {  }

    await waitFor(element(by.text('Create Account')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.text('Create Account')).tap();

    await waitFor(element(by.text('AI Chat')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should login with the registered user', async () => {
    await waitFor(element(by.id('login-email')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('login-email')).replaceText(testEmail);
    await element(by.id('login-password')).replaceText(testPassword);

    try { await element(by.id('login-password')).tapReturnKey(); } catch {  }

    await element(by.text('Login')).tap();

    await waitFor(element(by.text('AI Chat')))
      .toBeVisible()
      .withTimeout(15000);
  });
});
