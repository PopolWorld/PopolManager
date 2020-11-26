// Import the module
const Sequelize = require('sequelize');

// Import the database
const sequelize = require('./database');

// Create the model
const team_member = sequelize.define('team_member', {
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [['owner', 'admin', 'player']]
    }
  }
}, {
  createdAt: false,
  updatedAt: false
});

// Export
module.exports = team_member;