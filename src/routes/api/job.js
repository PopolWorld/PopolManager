// Import modules
const express = require('express');
const { Op } = require('sequelize');

// Create a router
const router = express.Router();

// Get models
const player = require('../../models/player');
const job = require('../../models/job');
const { checkToken, getPlayerByUUID, getJobByPlayer, getJobsByPlayer } = require('./utils');

// Get jobs leaderboard
router.get('/leaderboard/:limit', async (req, res) => {
    // Check limit
    const limit = parseInt(req.params.limit);
    if (limit === null || isNaN(limit)) {
        // Limit is invalid
        return res.status(400).json({ message: 'Invalid limit!' });
    }

    // Get first n teams
    const leaderboard = await job.findAll({
        where: {
            experience: {
                [Op.gt]: 0
            }
        },
        order: [['experience', 'DESC']],
        limit: limit,
        include: {
            model: player,
            attributes: ['name']
        }
    });

    // Return content
    res.json(leaderboard);
});

// Get job by player
router.get('/:uuid', getPlayerByUUID, getJobsByPlayer, async (req, res) => {
    res.json(res.jobs);
});

// Get job by player and name
router.get('/:uuid/:job', getPlayerByUUID, getJobByPlayer, async (req, res) => {
    res.json(res.job);
});

// Edit job by player and name
router.put('/:uuid/:job', checkToken, getPlayerByUUID, getJobByPlayer, async (req, res) => {
    // Update values
    if (req.body.experience !== undefined) {
        res.job.experience = req.body.experience;
    }
    if (req.body.active !== undefined) {
        res.job.active = req.body.active;
    }
    await res.job.save({ fields: ['experience', 'active'] });

    // Return new response
    res.json(res.job);
});

// Create job for player
router.post('/:uuid/:job', checkToken, getPlayerByUUID, async (req, res) => {
    // Check that job does not already exist
    const found = await job.findOne({
        where: {
            job: req.params.job,
            playerUuid: res.player.uuid
        }
    });

    // Stop if already exists
    if (found !== null) {
        // If not, return with a 400
        return res.status(400).json({ message: 'This job already exists for this player' });
    }

    // Disable currently active job (if there is one)
    await job.update({ active: false }, { where: { playerUuid: res.player.uuid } });

    // Create the job
    const created = await job.create({
        job: req.params.job,
        playerUuid: res.player.uuid,
        active: true
    });

    // Return created item
    res.json(created);
});

// Export
module.exports = router;