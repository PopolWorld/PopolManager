// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Decode body from json
router.use(express.json());

// Link subroutes
router.use('/player', require('./player'));
router.use('/server', require('./server'));

// Export
module.exports = router;