// Import modules
const express = require('express');
const { Op } = require('sequelize');

// Create a router
const router = express.Router();

// Get models
const team = require('../../models/team');
const player = require('../../models/player');
const team_member = require('../../models/team_member');
const { checkToken, getPlayerByUUID, getTeamByID } = require('./utils');

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
        where: {
            money: {
                [Op.gt]: 0
            }
        },
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

    // Get owner
    if (req.body.owner === undefined) {
        // No owner specified
        return res.status(400).json({ message: 'No owner specified!' });
    }
    const owner = await player.findOne({
        where: { uuid: req.body.owner }
    });
    if (owner === null) {
        // Owner does not exist
        return res.status(400).json({ message: 'Owner does not exist!' });
    }

    // Everything is okay, create the team
    const created = await team.create({ name: req.body.name }, {
        include: {
            model: player,
            through: {
                attributes: ['role']
            }
        }
    });

    // Add owner to team
    await created.addPlayer(owner, { through: { role: 'owner' } });

    // Return the created item
    await created.reload();
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

// Delete a team by id
router.delete('/:id', checkToken, getTeamByID, async (req, res) => {
    // Delete team
    res.team.destroy();

    // Return new response
    res.json({ message: 'Team deleted!' });
});

// Add team member
router.post('/:id/:uuid', checkToken, getTeamByID, getPlayerByUUID, async (req, res) => {
    // Add player to team
    await res.team.addPlayer(res.player, { through: { role: req.body.role !== undefined ? req.body.role : 'player' } });

    // Return new response
    await res.team.reload();
    res.json(res.team);
});

// Remove team member
router.delete('/:id/:uuid', checkToken, getTeamByID, getPlayerByUUID, async (req, res) => {
    // Remove player from team
    await res.team.removePlayer(res.player);

    // Return new response
    await res.team.reload();
    res.json(res.team);
});

// Edit team member
router.put('/:id/:uuid', checkToken, getTeamByID, getPlayerByUUID, async (req, res) => {
    // Get team member
    const found = await team_member.findOne({
        where: {
            teamId: res.team.id,
            playerUuid: res.player.uuid
        }
    });

    // Check if team member was found
    if (found === null) {
        // If not, return with a 404
        return res.status(404).json({ message: 'This player is not in this team!' });
    }

    // Update values
    if (req.body.role !== undefined) {
        found.role = req.body.role;
    }
    await found.save({ fields: ['role'] });

    // Return new response
    await res.team.reload();
    res.json(res.team);
});

// Export
module.exports = router;