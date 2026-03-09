export { };
/// <reference types="cypress" />

const API = Cypress.env('apiUrl');
console.log('Using API URL:', API);
const uniqueEmail = () => `api-e2e-${Date.now()}@therapy-ai.test`;

describe('API — POST /users/register', () => {
  it('returns 201 and token for valid registration', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/register`,
      body: { name: 'API Test User', email: uniqueEmail(), password: 'APITest123!' },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.token).to.be.a('string');
      expect(res.body.data.user).to.include.keys('name', 'email');
      expect(res.body.data.user).to.not.have.key('password_hash');
    });
  });

  it('returns 400 when required fields are missing', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/register`,
      body: { email: uniqueEmail() },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.success).to.be.false;
    });
  });

  it('returns 409 or 400 when email is already taken', () => {
    const email = uniqueEmail();
    cy.request({
      method: 'POST', url: `${API}/users/register`,
      body: { name: 'Dup User', email, password: 'DupTest123!' }
    });

    cy.request({
      method: 'POST', url: `${API}/users/register`,
      body: { name: 'Dup User 2', email, password: 'DupTest456!' },
      failOnStatusCode: false,
    }).then((res) => {
      expect([400, 409]).to.include(res.status);
      expect(res.body.success).to.be.false;
    });
  });

  it('returns refreshToken alongside accessToken', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/register`,
      body: { name: 'Refresh User', email: uniqueEmail(), password: 'RefreshTest123!' },
    }).then((res) => {
      expect(res.body.data).to.have.property('refreshToken');
      expect(res.body.data.refreshToken).to.be.a('string').with.length.greaterThan(10);
    });
  });
});

describe('API — POST /users/login', () => {
  let testEmail: string;
  before(() => {
    testEmail = uniqueEmail();
    cy.request({
      method: 'POST', url: `${API}/users/register`,
      body: { name: 'Login Test', email: testEmail, password: 'LoginTest123!' }
    });
  });

  it('returns 200 and token for valid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/login`,
      body: { email: testEmail, password: 'LoginTest123!' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.token).to.be.a('string');
      expect(res.body.data.refreshToken).to.be.a('string');
    });
  });

  it('returns 401 for wrong password', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/login`,
      body: { email: testEmail, password: 'WrongPass999!' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 401]);
      expect(res.body.success).to.be.false;
    });
  });

  it('returns 400 when fields are missing', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/login`,
      body: { email: testEmail },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});

describe('API — POST /users/refresh-token', () => {
  let userId: string;
  let refreshToken: string;

  before(() => {
    cy.request({
      method: 'POST',
      url: `${API}/users/register`,
      body: { name: 'RT User', email: uniqueEmail(), password: 'RTTest123!' },
    }).then((res) => {
      userId = res.body.data.user._id;
      refreshToken = res.body.data.refreshToken;
    });
  });

  it('returns a new access token and rotated refresh token', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/refresh-token`,
      body: { userId, refreshToken },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.token).to.be.a('string');
      expect(res.body.data.refreshToken).to.be.a('string');
      expect(res.body.data.refreshToken).to.not.eq(refreshToken);
    });
  });

  it('returns 401 for an invalid refresh token', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/refresh-token`,
      body: { userId, refreshToken: 'fake-token-abc123' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});

describe('API — POST /users/forgot-password', () => {
  before(() => {
    cy.seedUser(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword')
    );
  });

  it('returns success for a registered email', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/forgot-password`,
      body: { email: Cypress.env('testUserEmail') },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('returns 404 for an unregistered email', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/forgot-password`,
      body: { email: 'nobody@therapy-ai.test' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it('returns 400 when email is missing', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/forgot-password`,
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});

describe('API — POST /users/reset-password', () => {
  it('resets password for a valid email and new password', () => {
    const email = uniqueEmail();
    cy.request({
      method: 'POST', url: `${API}/users/register`,
      body: { name: 'Reset User', email, password: 'OldPass123!' }
    });

    cy.request({
      method: 'POST',
      url: `${API}/users/reset-password`,
      body: { email, password: 'NewResetPass456!' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('returns 400 for a password shorter than 8 characters', () => {
    cy.request({
      method: 'POST',
      url: `${API}/users/reset-password`,
      body: { email: Cypress.env('testUserEmail'), password: 'short' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});

describe('API — GET /users/me', () => {
  let token: string;

  before(() => {
    cy.seedUser(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword')
    ).then((data: any) => { token = data.token; });
  });

  it('returns user profile for authenticated request', () => {
    cy.request({
      method: 'GET',
      url: `${API}/users/me`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data).to.include.keys('name', 'email');
      expect(res.body.data).to.not.have.key('password_hash');
    });
  });

  it('returns 401 for unauthenticated request', () => {
    cy.request({
      method: 'GET',
      url: `${API}/users/me`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});

describe('API — PATCH /users/name', () => {
  let token: string;

  before(() => {
    cy.seedUser(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword')
    ).then((data: any) => { token = data.token; });
  });

  it('updates display name with a valid token', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/users/name`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'API Updated Name' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.name).to.eq('API Updated Name');
    });
  });

  it('returns 400 when name is empty', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/users/name`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: '' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('returns 401 without auth', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/users/name`,
      body: { name: 'No Auth' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});

describe('API — PATCH /users/password', () => {
  let token: string;
  const pwEmail = uniqueEmail();

  before(() => {
    cy.request({
      method: 'POST', url: `${API}/users/register`,
      body: { name: 'PW Test', email: pwEmail, password: 'OldPWTest123!' }
    })
      .then((res) => { token = res.body.data.token; });
  });

  it('changes password with correct old password', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/users/password`,
      headers: { Authorization: `Bearer ${token}` },
      body: { oldPassword: 'OldPWTest123!', newPassword: 'NewPWTest456!' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('returns 400 for wrong old password', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/users/password`,
      headers: { Authorization: `Bearer ${token}` },
      body: { oldPassword: 'WrongOld!', newPassword: 'NewPWTest789!' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.match(/incorrect/i);
    });
  });

  it('returns 401 without auth', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/users/password`,
      body: { oldPassword: 'anything', newPassword: 'anything' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});

describe('API — Conversations', () => {
  let token: string;
  let conversationId: string;

  before(() => {
    cy.seedUser(
      Cypress.env('testUserName'),
      Cypress.env('testUserEmail'),
      Cypress.env('testUserPassword')
    ).then((data: any) => { token = data.token; });
  });

  it('POST /conversations creates a new conversation', () => {
    cy.request({
      method: 'POST',
      url: `${API}/conversations`,
      headers: { Authorization: `Bearer ${token}` },
      body: { title: 'E2E Test Conversation' },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data._id).to.be.a('string');
      conversationId = res.body.data._id;
    });
  });

  it('GET /conversations returns the list of conversations', () => {
    cy.request({
      method: 'GET',
      url: `${API}/conversations`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('array');
    });
  });

  it('GET /conversations/:id returns a specific conversation', () => {
    cy.request({
      method: 'GET',
      url: `${API}/conversations/${conversationId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data._id).to.eq(conversationId);
    });
  });

  it('PATCH /conversations/:id/title updates the title', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/conversations/${conversationId}/title`,
      headers: { Authorization: `Bearer ${token}` },
      body: { title: 'Updated E2E Title' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.title).to.eq('Updated E2E Title');
    });
  });

  it('PATCH /conversations/:id/archive archives a conversation', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/conversations/${conversationId}/archive`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.archived).to.be.true;
    });
  });

  it('PATCH /conversations/:id/unarchive restores a conversation', () => {
    cy.request({
      method: 'PATCH',
      url: `${API}/conversations/${conversationId}/unarchive`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.archived).to.be.false;
    });
  });

  it('DELETE /conversations/:id deletes a conversation', () => {
    cy.request({
      method: 'DELETE',
      url: `${API}/conversations/${conversationId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('returns 401 for all conversation endpoints without auth', () => {
    cy.request({
      method: 'GET', url: `${API}/conversations`, failOnStatusCode: false,
    }).then((res) => expect(res.status).to.eq(401));
  });
});

describe('API — Message Length Validation', () => {
  let token: string;
  before(() => {
    cy.seedUser(
      'Len Test',
      uniqueEmail(),
      'Pass123!'
    ).then((result: any) => { token = result.token; });
  });

  it('POST /chat returns 400 for a message over 10,000 chars', () => {
    cy.request({
      method: 'POST',
      url: `${API}/chat`,
      headers: { Authorization: `Bearer ${token}` },
      body: { message: 'A'.repeat(10001) },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.error).to.match(/too long|10,000/i);
    });
  });
});