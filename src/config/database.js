require('dotenv').config();
const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Mongoose connecté avec succès');
  } catch (error) {
    console.error('Erreur lors de la connexion à MongoDB (Mongoose):', error);
    throw error;
  }
}

function getDatabase() {
  return mongoose.connection.db;
}

module.exports = {
  connectToDatabase,
  getDatabase
};
