// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Get models
const team = require('../../models/team');
const checkToken = require('./checkToken');

// Middleware to get team by id
async function getTeamByID(req, res, next) {
    // Get team from database
    const found = await team.findOne({
        where: { id: req.params.id }
    });

    // Check if team was found
    if (found === null) {
        // If not, return with a 404
        return res.status(404).json({ message: 'Team not found' });
    }

    // Save team and continue
    res.team = found;
    next();
}

// Get team leaderboard
router.get('/leaderboard/:limit', async (req, res) => {
    // Check limit
    const limit = parseInt(req.params.limit);
    if (limit === null || isNaN(limit)) {
        // Limit is invalid
        return res.status(400).json({ message: 'Invalid limit!' });
    }

    // Get first n teams
    const leaderboard = await team.findAll({
        order: [['money', 'DESC']],
        limit: limit
    });

    // Return content
    res.json(leaderboard);
});

// Get team by id
router.get('/:id', getTeamByID, async (req, res) => {
    res.json(res.team);
});

// Create a team
router.post('/', checkToken, async (req, res) => {
    // Check if the name is not already taken
    const sameName = await team.findOne({
        where: { name: req.body.name }
    });
    if (sameName !== null) {
        // Name already taken
        return res.status(400).json({ message: 'Name already taken!' });
    }

    // Everything is okay, create the team
    const created = await team.create({ name: req.body.name });

    // Return the created item
    res.status(201).json(created);
});

// Update team by id
router.put('/:id', checkToken, getTeamByID, async (req, res) => {
    // Update values
    if (req.body.name !== undefined) {
        res.team.name = req.body.name;
    }
    if (req.body.money !== undefined) {
        res.team.money = req.body.money;
    }
    await res.team.save({ fields: ['name', 'money'] });

    // Return new response
    res.json(res.team);
});

// Export
module.exports = router;