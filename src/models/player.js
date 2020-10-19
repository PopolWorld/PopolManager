// Import the module
const Sequelize = require('sequelize');

// Import the database
const sequelize = require('./database');

// Create the model
const player = sequelize.define('player', {
  uuid: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  money: {
    type: Sequelize.BIGINT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  createdAt: 'first_login',
  updatedAt: false
});

// Export
module.exports = player;