const express = require('express');
const cors = require('cors');
const { router } = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', router);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };


