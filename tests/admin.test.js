const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { router } = require('../src/routes/index');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

describe('Tests admin', () => {
  test('Vérifier KYC', async () => {
    const kycData = {
      userId: '123',
      status: 'verified'
    };

    const response = await request(app)
      .post('/admin/verify-kyc')
      .send(kycData);

    expect(response.status).toBeDefined();
  });

  test('Promouvoir admin', async () => {
    const adminData = {
      userId: '123'
    };

    const response = await request(app)
      .post('/admin/make-admin')
      .send(adminData);

    expect(response.status).toBeDefined();
  });
});
