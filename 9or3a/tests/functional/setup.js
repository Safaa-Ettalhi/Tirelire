const mongoose = require('mongoose');

beforeAll(async () => {
  // Utiliser la base de données de test directement
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/9or3a_test');
  }
}, 30000);

afterAll(async () => {
  // Nettoyer après les tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}, 30000);

beforeEach(async () => {
  // Nettoyer toutes les collections avant chaque test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});