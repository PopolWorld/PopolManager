// Import the module
const Sequelize = require('sequelize');

// Import the database
const sequelize = require('./database');

// Create the model
const team = sequelize.define('team', {
  id: {
    type: Sequelize.BIGINT,
    allowNull: false,
    autoIncrement: true,
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
  createdAt: false,
  updatedAt: false
});

// Export
module.exports = team;