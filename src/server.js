require('dotenv').config();
const { createApp } = require('./app');
const { connectToDatabase } = require('./config/database');

async function start() {
  try {
    await connectToDatabase();
    const app = createApp();
    const port = process.env.PORT ;
    app.listen(port, () => {
      console.log(`API sur http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
}

start();


