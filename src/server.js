const { createApp } = require('./app');
const { ENV } = require('./config/env');

const app = createApp();
app.listen(ENV.PORT, () => {
  console.log(`API démarrée sur le port ${ENV.PORT}`);
});


