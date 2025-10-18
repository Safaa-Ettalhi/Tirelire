const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('🤝 Tests d\'Accords de Groupe', () => {
  let authToken;
  let userId;
  let groupId;

  beforeEach(async () => {
    // Créer un utilisateur et obtenir un token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Agreement Test User',
        email: 'agreement@example.com',
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
        name: 'Groupe Agreement',
        amount: 50000,
        frequency: 'mensuel',
        members: []
      });

    // Attendre que le groupe soit créé
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (groupResponse.body.group) {
      groupId = groupResponse.body.group._id;
    } else {
      // Si la création échoue, utiliser un ID factice pour le test
      groupId = '507f1f77bcf86cd799439011';
    }
  });

  test('POST /api/agreements/propose - devrait proposer un accord', async () => {
    // Créer un groupe réel pour ce test
    const groupResponse = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Groupe Test Accord',
        amount: 30000,
        frequency: 'mensuel',
        members: []
      });

    const realGroupId = groupResponse.body.group._id;

    const agreementData = {
      groupId: realGroupId,
      type: 'frequency',
      proposedValue: 'hebdomadaire'
    };

    const response = await request(app)
      .post('/api/agreements/propose')
      .set('Authorization', `Bearer ${authToken}`)
      .send(agreementData)
      .expect(200);

    expect(response.body.message).toBe('Accord proposé avec succès');
    expect(response.body.agreement.type).toBe(agreementData.type);
  });

  test('POST /api/agreements/:id/vote - devrait voter sur un accord', async () => {
    // Créer un groupe réel pour ce test
    const groupResponse = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Groupe Test Vote',
        amount: 40000,
        frequency: 'mensuel',
        members: []
      });

    const realGroupId = groupResponse.body.group._id;

    // Créer un accord d'abord
    const agreementResponse = await request(app)
      .post('/api/agreements/propose')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        groupId: realGroupId,
        type: 'amount',
        proposedValue: 60000
      });

    const agreementId = agreementResponse.body.agreement._id;

    const voteData = {
      approved: true
    };

    const response = await request(app)
      .post(`/api/agreements/${agreementId}/vote`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(voteData)
      .expect(200);

    expect(response.body.message).toBe('Vote enregistré');
  });

  test('GET /api/agreements/group/:groupId - devrait lister les accords d\'un groupe', async () => {
    // Créer un accord d'abord
    await request(app)
      .post('/api/agreements/propose')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        group: groupId,
        type: 'frequency',
        proposedValue: 'hebdomadaire'
      });

    const response = await request(app)
      .get(`/api/agreements/group/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.agreements).toBeDefined();
    expect(Array.isArray(response.body.agreements)).toBe(true);
  });

  test('POST /api/agreements/propose - devrait échouer si pas membre du groupe', async () => {
    // Créer un autre utilisateur non membre du groupe
    const otherUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Non Member',
        email: 'nonmember@example.com',
        password: 'password123'
      });

    const otherToken = otherUserResponse.body.token;
    const otherUserId = otherUserResponse.body.user._id;

    // Marquer le deuxième utilisateur comme KYC validé
    await User.findByIdAndUpdate(otherUserId, { isKYCValidated: true });
    await new Promise(resolve => setTimeout(resolve, 100));

    const agreementData = {
      groupId: groupId,
      type: 'amount',
      proposedValue: 75000
    };

    const response = await request(app)
      .post('/api/agreements/propose')
      .set('Authorization', `Bearer ${otherToken}`)
      .send(agreementData)
      .expect(403);

    expect(response.body.message).toBe('Vous devez être membre du groupe');
  });
});