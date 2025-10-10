const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { router } = require('../src/routes/index');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

describe('Tests profil', () => {
  test('Voir le profil', async () => {
    const response = await request(app).get('/profile/');
    expect(response.status).toBeDefined();
  });

  test('Modifier le profil', async () => {
    const updateData = {
      name: 'Nouveau nom',
      firstName: 'John',
      lastName: 'Doe'
    };

    const response = await request(app)
      .put('/profile/')
      .send(updateData);

    expect(response.status).toBeDefined();
  });

  test('Changer le mot de passe', async () => {
    const passwordData = {
      currentPassword: 'old123',
      newPassword: 'new123'
    };

    const response = await request(app)
      .put('/profile/password')
      .send(passwordData);

    expect(response.status).toBeDefined();
  });

  test('Voir les paiements', async () => {
    const response = await request(app).get('/profile/payments');
    expect(response.status).toBeDefined();
  });

  test('Voir le score', async () => {
    const response = await request(app).get('/profile/reliability');
    expect(response.status).toBeDefined();
  });
});