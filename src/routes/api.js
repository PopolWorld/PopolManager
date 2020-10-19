// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Decode body from json
router.use(express.json());

// Register routes
router.use('/server', require('./api/server'));
router.use('/player', require('./api/player'));

// Export
module.exports = router;