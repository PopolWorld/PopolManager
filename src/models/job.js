// Import the module
const Sequelize = require('sequelize');

// Import the database
const sequelize = require('./database');

// Create the model
const job = sequelize.define('job', {
    id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    job: {
        type: Sequelize.STRING,
        allowNull: false
    },
    experience: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    createdAt: false,
    updatedAt: false
});

// Export
module.exports = job;