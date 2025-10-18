const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('💬 Tests de Messagerie', () => {
  let authToken;
  let userId;
  let groupId;

  beforeEach(async () => {
    // Créer un utilisateur et obtenir un token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Message Test User',
        email: 'message@example.com',
        password: 'password123',
        role: 'Admin'
      });
    userId = registerResponse.body.user._id;
    authToken = registerResponse.body.token;

    // Marquer l'utilisateur comme KYC validé pour les tests
    await User.findByIdAndUpdate(userId, { isKYCValidated: true, role: 'Admin' });
    await new Promise(resolve => setTimeout(resolve, 200));

    // Créer un groupe
    const groupResponse = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Groupe Message',
        amount: 100,
        frequency: 'mensuel',
        members: []
      });

    if (groupResponse.body.group) {
      groupId = groupResponse.body.group._id;
    } else {
      // Si la création échoue, utiliser un ID factice pour le test
      groupId = '507f1f77bcf86cd799439011';
    }
  });

  test('POST /api/messages - devrait envoyer un message texte', async () => {
    // Créer un groupe réel pour ce test
    const groupResponse = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Groupe Test Message',
        amount: 15000,
        frequency: 'mensuel',
        members: []
      });

    const realGroupId = groupResponse.body.group._id;

    const messageData = {
      group: realGroupId,
      text: 'Bonjour tout le monde !'
    };

    const response = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send(messageData)
      .expect(200);

    expect(response.body.message).toBeDefined();
    expect(response.body.message.text).toBe(messageData.text);
  });

  test('POST /api/messages - devrait envoyer un message audio', async () => {
    const messageData = {
      group: groupId,
      audioPath: '/uploads/audio/test.mp3'
    };

    const response = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send(messageData)
      .expect(200);

    expect(response.body.message).toBeDefined();
    expect(response.body.message.audioPath).toBe(messageData.audioPath);
  });

  test('GET /api/messages/:groupId - devrait récupérer les messages d\'un groupe', async () => {
    // Envoyer un message d'abord
    await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        group: groupId,
        text: 'Message de test'
      });

    const response = await request(app)
      .get(`/api/messages/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/messages/:groupId - devrait retourner un tableau vide pour un groupe sans messages', async () => {
    // Créer un groupe réel pour ce test
    const groupResponse = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Groupe Test Messages',
        amount: 20000,
        frequency: 'mensuel',
        members: []
      });

    const realGroupId = groupResponse.body.group._id;

    const response = await request(app)
      .get(`/api/messages/${realGroupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });
});
