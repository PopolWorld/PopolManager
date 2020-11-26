// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Get models
const player = require('../../models/player');
const job = require('../../models/job');
const { checkToken, getPlayerByUUID, getJobByPlayer } = require('./utils');

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
    job.update({ active: false }, { where: { playerUuid: res.player.uuid } });

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