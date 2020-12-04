// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Get models
const chunk = require('../../models/chunk');
const { checkToken, getTeamByID, getChunkByCoordinates, getChunksByRegion } = require('./utils');

// Get chunks by region
router.get('/region/:x/:z', getChunksByRegion, async (req, res) => {
    res.json(res.region);
});

// Claim chunk by coordinates
router.post('/claim/:x/:z/:id', checkToken, getTeamByID, async (req, res) => {
    // Check that chunk is not already claimed
    const found = await chunk.findOne({
        where: {
            x: req.params.x,
            z: req.params.z
        }
    });

    // Check if chunk was found
    if (found !== null) {
        // If yes, return with a 400
        return res.status(400).json({ message: 'Chunk already claimed' });
    }

    // Claim it
    const created = await chunk.create({
        x: req.params.x,
        z: req.params.z,
        teamId: res.team.id
    });

    // Return created item
    res.status(201).json(created);
});

// Unclaim chunk by coordinates
router.delete('/claim/:x/:z', checkToken, getChunkByCoordinates, async (req, res) => {
    // Delete claim
    res.chunk.destroy();

    // Return new response
    res.json({ message: 'Claim deleted!' });
});

// Export
module.exports = router;