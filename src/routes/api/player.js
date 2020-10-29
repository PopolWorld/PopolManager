// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Get models
const player = require('../../models/player');
const checkToken = require('./checkToken');

// Middleware to get player by uuid
async function getPlayerByUUID(req, res, next) {
    // Get player from database
    const found = await player.findOne({
        where: { uuid: req.params.uuid }
    });

    // Check if player was found
    if (found === null) {
        // If not, return with a 404
        return res.status(404).json({ message: 'Player not found' });
    }

    // Save player and continue
    res.player = found;
    next();
}

// Get player by uuid
router.get('/:uuid', getPlayerByUUID, async (req, res) => {
    res.json(res.player);
});

// Update player by id
router.put('/:uuid', checkToken, async (req, res) => {
    // Get player from database
    let found = await player.findOne({
        where: { uuid: req.params.uuid }
    });

    // Check if player exists
    if (found !== null) {
        // Update it
        if (req.body.name !== undefined) {
            found.name = req.body.name;
        }
        if (req.body.money !== undefined) {
            found.money = req.body.money;
        }
        await found.save({ fields: ['name', 'money'] });
    } else if (req.body.name !== undefined) {
        // Create it
        found = await player.create({
            uuid: req.params.uuid.toLowerCase(),
            name: req.body.name,
            level: '' // TODO: Get default when level system is done
        });

        // Change HTTP status to 201 Created
        res.status(201);
    } else {
        // Missing arguments
        return res.status(400).json({ message: 'Missing player name!' });
    }

    // Return new response
    res.json(found);
});

// Export
module.exports = router;