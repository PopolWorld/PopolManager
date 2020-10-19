// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Register routes
router.use('/server', require('./api/server'));
router.use('/player', require('./api/player'));

// Export
module.exports = router;