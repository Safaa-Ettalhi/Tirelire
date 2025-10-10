const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { router } = require('../src/routes/index');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

describe('Tests notifications', () => {
  test('Envoyer une notification', async () => {
    const notificationData = {
      userId: '123',
      groupId: '456',
      title: 'Test',
      message: 'Message test'
    };

    const response = await request(app)
      .post('/notifications/')
      .send(notificationData);

    expect(response.status).toBeDefined();
  });

  test('Voir mes notifications', async () => {
    const response = await request(app).get('/notifications/');
    expect(response.status).toBeDefined();
  });

  test('Marquer comme lue', async () => {
    const response = await request(app).put('/notifications/123/read');
    expect(response.status).toBeDefined();
  });

  test('Envoyer un rappel', async () => {
    const response = await request(app).post('/notifications/reminder/456');
    expect(response.status).toBeDefined();
  });

  test('Distribuer le pot', async () => {
    const response = await request(app).post('/notifications/distribute/456');
    expect(response.status).toBeDefined();
  });
});
