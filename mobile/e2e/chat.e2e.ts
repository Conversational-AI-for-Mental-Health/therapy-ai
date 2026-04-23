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

  const email = `detox_chat_${Date.now()}@test.com`;

  await waitFor(element(by.text('Sign up')))
    .toBeVisible()
    .withTimeout(10000);
  await element(by.text('Sign up')).tap();

  await waitFor(element(by.id('signup-name')))
    .toBeVisible()
    .withTimeout(5000);

  await element(by.id('signup-name')).replaceText('Chat Tester');
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

describe('Chat Core E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
    await ensureOnDashboard();
  });

  it('can type and send a chat message', async () => {
    await expect(element(by.text('AI Chat'))).toBeVisible();

    await element(by.id('chat-input')).replaceText('Hello how are you?');
    await element(by.text('➤')).tap();

    await waitFor(element(by.text('Hello how are you?')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('can open sidebar and see New Conversation button', async () => {
    await element(by.text('☰')).tap();

    await waitFor(element(by.text('✏️  New Conversation')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('can start a new conversation from sidebar', async () => {

    await element(by.text('✏️  New Conversation')).tap();

    await waitFor(element(by.text('Hello! I am here to listen. How are you feeling today?')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
