const request = require('supertest');
const app = require('../../app');

describe('🔐 Tests d\'Authentification', () => {
  test('POST /api/auth/register - devrait créer un nouvel utilisateur', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - devrait se connecter avec des identifiants valides', async () => {
    // Créer un utilisateur d'abord
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123'
      });

    const loginData = {
      email: 'login@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.user.email).toBe(loginData.email);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/register - devrait échouer avec email existant', async () => {
    const userData = {
      name: 'Duplicate User',
      email: 'duplicate@example.com',
      password: 'password123'
    };

    // Créer le premier utilisateur
    await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Essayer de créer le même utilisateur
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.message).toBe('Email déjà utilisé');
  });

  test('POST /api/auth/login - devrait échouer avec mot de passe incorrect', async () => {
    // Créer un utilisateur d'abord
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Wrong Password User',
        email: 'wrongpass@example.com',
        password: 'password123'
      });

    const loginData = {
      email: 'wrongpass@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body.message).toBe('Mot de passe incorrect');
  });
});
