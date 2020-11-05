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
  const team = require('./models/team');

  // Link between models
  team.belongsToMany(player, { through: 'teams_members' });
  player.belongsToMany(team, { through: 'teams_members' })

  // Load the database structure
  await sequelize.sync();

  // Init app
  const app = express();

  // Register routes
  app.use(vhost('api.popolworld.*', require('./routes/api/index')));
  app.use(vhost('popolworld.*', require('./routes/www/index')));

  // Start listening
  app.listen(process.env.PORT || 3000, () => console.log('Web server started!'));

  // Start minecraft servers
  console.log('Starting minecraft servers...')
  const minecraft = require('./models/minecraft');

  // Handle exit
  process.stdin.resume();
  process.on('SIGINT', () => {
    // Stop all servers before stopping process
    console.log('Stopping servers...');
    minecraft.stopAll(() => process.exit(0));
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err)
});