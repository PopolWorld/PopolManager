// Import the module
const Sequelize = require('sequelize');

// Import the database
const sequelize = require('./database');

// Create the model
const chunk = sequelize.define('chunk', {
    id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    x: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    z: {
        type: Sequelize.BIGINT,
        allowNull: false
    }
}, {
    createdAt: false,
    updatedAt: false
});

// Export
module.exports = chunk;