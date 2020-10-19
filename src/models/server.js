// Import the module
const Sequelize = require('sequelize');

// Import the database
const sequelize = require('./database');

// Create the model
const server = sequelize.define('server', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  software: {
    type: Sequelize.STRING,
    allowNull: false
  },
  slot: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: -1
  },
  icon: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'stone'
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'offline'
  },
  token: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: ''
  }
}, {
  createdAt: false,
  updatedAt: false,
  defaultScope: {
    attributes: { exclude: ['token'] },
  }
});

// Export
module.exports = server;