// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Decode body from json
router.use(express.json());

// Link subroutes
router.use('/player', require('./player'));
router.use('/server', require('./server'));
router.use('/team', require('./team'));

// Export
module.exports = router;