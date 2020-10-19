// Import modules
const express = require('express');
const vhost = require('vhost')
const fs = require('fs');

// Check if .env is present
try {
  if (fs.existsSync('.env')) {
    // Load .env file
    const dotenv = require('dotenv');
    dotenv.config();
  }
} catch (err) {
  console.error(err);
}

// Get database
const sequelize = require('./models/database');
sequelize.authenticate().then(async () => {
  // We are connected!
  console.log('Database connected!')

  // Load all models
  const player = require('./models/player');
  const server = require('./models/server');

  // Load the database structure
  await sequelize.sync();

  // Init app
  const app = express();

  // Register routes
  app.use(vhost('api.*.*', require('./routes/api')));

  // Start listening
  app.listen(process.env.PORT || 3000, () => console.log('Web server started!'));

  // Start minecraft servers
  console.log('Starting minecraft servers...')
  const MinecraftServer = require('./models/minecraft');
  const servers = await server.findAll();
  servers.forEach(serv => new MinecraftServer(serv))
}).catch(err => {
  console.error('Unable to connect to the database:', err)
});