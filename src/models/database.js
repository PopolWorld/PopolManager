// Import modules
const Sequelize = require('sequelize');

// Init database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

// Export
module.exports = sequelize;