const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('👥 Tests de Gestion des Groupes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Créer un utilisateur et obtenir un token pour chaque test
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Group Test User',
        email: 'group@example.com',
        password: 'password123',
        role: 'Admin'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user._id;

    // Marquer l'utilisateur comme KYC validé pour les tests
    await User.findByIdAndUpdate(userId, { isKYCValidated: true, role: 'Admin' });

    // Attendre un peu pour que la mise à jour soit prise en compte
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  test('POST /api/groups - devrait créer un nouveau groupe', async () => {
    const groupData = {
      name: 'Groupe Test',
      amount: 50000,
      frequency: 'mensuel',
      members: []
    };

    const response = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send(groupData)
      .expect(200);

    expect(response.body.message).toBe('Groupe créé');
    expect(response.body.group.name).toBe(groupData.name);
    expect(response.body.group.amount).toBe(groupData.amount);
  });

  test('GET /api/groups - devrait lister les groupes', async () => {
    // Créer un groupe d'abord
    await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Groupe Liste',
        amount: 30000,
        frequency: 'mensuel',
        members: []
      });

    const response = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.groups).toBeDefined();
    expect(Array.isArray(response.body.groups)).toBe(true);
  });

  test('POST /api/groups/:id/join - devrait rejoindre un groupe', async () => {
    // Créer un groupe d'abord
    const groupResponse = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Groupe Test Join',
        amount: 50000,
        frequency: 'mensuel',
        members: []
      });

    const realGroupId = groupResponse.body.group._id;

    // Créer un autre utilisateur
    const otherUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        role: 'Admin'
      });

    const otherToken = otherUserResponse.body.token;
    const otherUserId = otherUserResponse.body.user._id;
    
    // Marquer le deuxième utilisateur comme KYC validé
    await User.findByIdAndUpdate(otherUserId, { isKYCValidated: true, role: 'Admin' });
    await new Promise(resolve => setTimeout(resolve, 300));

    const response = await request(app)
      .post(`/api/groups/${realGroupId}/join`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);

    expect(response.body.message).toBe('Rejoint le groupe');
  });
});
