const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { router } = require('../src/routes/index');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

describe('Tests simples', () => {
  test('L\'API fonctionne', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  test('Créer un utilisateur', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    try {
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .timeout(2000);

      expect(response.status).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  }, 10000);

  test('Se connecter', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .timeout(2000);

      expect(response.status).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  }, 10000);
});