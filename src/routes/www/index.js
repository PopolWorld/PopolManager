// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Test home page
router.get('/', async (req, res) => {
    res.send('Hello popolworld!');
})

// Export
module.exports = router;