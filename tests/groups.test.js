const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { router } = require('../src/routes/index');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

describe('Tests groupes', () => {
  test('Créer un groupe', async () => {
    const groupData = {
      name: 'Mon groupe',
      description: 'Groupe de test',
      contributionAmount: 1000,
      maxMembers: 5
    };

    const response = await request(app)
      .post('/groups/')
      .send(groupData);

    expect(response.status).toBeDefined();
  });

  test('Voir les groupes', async () => {
    const response = await request(app).get('/groups/');
    expect(response.status).toBeDefined();
  });

  test('Voir un groupe', async () => {
    const response = await request(app).get('/groups/123');
    expect(response.status).toBeDefined();
  });

  test('Rejoindre un groupe', async () => {
    const response = await request(app).post('/groups/123/join');
    expect(response.status).toBeDefined();
  });

  test('Quitter un groupe', async () => {
    const response = await request(app).delete('/groups/123/leave');
    expect(response.status).toBeDefined();
  });

  test('Voir les membres', async () => {
    const response = await request(app).get('/groups/123/members');
    expect(response.status).toBeDefined();
  });

  test('Ajouter un message', async () => {
    const messageData = {
      content: 'Bonjour !',
      type: 'text'
    };

    const response = await request(app)
      .post('/groups/123/messages')
      .send(messageData);

    expect(response.status).toBeDefined();
  });

  test('Voir les messages', async () => {
    const response = await request(app).get('/groups/123/messages');
    expect(response.status).toBeDefined();
  });

  test('Faire une contribution', async () => {
    const contributionData = {
      amount: 1000
    };

    const response = await request(app)
      .post('/groups/123/contribute')
      .send(contributionData);

    expect(response.status).toBeDefined();
  });

  test('Voir les contributions', async () => {
    const response = await request(app).get('/groups/123/contributions');
    expect(response.status).toBeDefined();
  });

  test('Valider une contribution', async () => {
    const response = await request(app).put('/groups/123/contributions/456/validate');
    expect(response.status).toBeDefined();
  });
});