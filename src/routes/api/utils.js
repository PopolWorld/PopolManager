// Import modules
const { Op } = require('sequelize');

// Get models
const player = require('../../models/player');
const server = require('../../models/server');
const team = require('../../models/team');
const job = require('../../models/job');
const chunk = require('../../models/chunk');

// Middleware to check server token
async function checkToken(req, res, next) {
    // Check token is specified and not empty
    if (req.header('token') === undefined || req.header('token') === '') {
        return res.status(403).json({ message: 'Access denied' });
    }

    // Get server from database
    const found = await server.findOne({
        where: { token: req.header('token') }
    });

    // Check if server was found
    if (found === null) {
        // If not, return with a 403
        return res.status(403).json({ message: 'Access denied' });
    }

    // Eventually check id if specified
    if (res.server !== undefined && res.server.id != found.id) {
        return res.status(403).json({ message: 'Access denied' });
    }

    // Continue
    next();
}

// Middleware to get player by uuid
async function getPlayerByUUID(req, res, next) {
    // Get player from database
    const found = await player.findOne({
        where: { uuid: req.params.uuid },
        include: [
            {
                model: team,
                through: {
                    attributes: ['role']
                }
            },
            {
                model: job
            }
        ]
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

// Middleware to get server by id
async function getServerByID(req, res, next) {
    // Get server from database
    const found = await server.findOne({
        where: { id: req.params.id }
    });

    // Check if server was found
    if (found === null) {
        // If not, return with a 404
        return res.status(404).json({ message: 'Server not found' });
    }

    // Save server and continue
    res.token = found.token;
    found.token = undefined;
    res.server = found;
    next();
}

// Middleware to get team by id
async function getTeamByID(req, res, next) {
    // Get team from database
    const found = await team.findOne({
        where: { id: req.params.id },
        include: {
            model: player,
            through: {
                attributes: ['role']
            }
        }
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

// Middleware to get job by player
async function getJobByPlayer(req, res, next) {
    // Get job from database
    const found = await job.findOne({
        where: {
            job: req.params.job,
            playerUuid: res.player.uuid
        }
    });

    // Check if job was found
    if (found === null) {
        // If not, return with a 404
        return res.status(404).json({ message: 'Job not found for this player' });
    }

    // Save job and continue
    res.job = found;
    next();
}

// Middleware to get jobs by player
async function getJobsByPlayer(req, res, next) {
    // Get jobs from database
    res.jobs = await job.findAll({
        where: {
            playerUuid: res.player.uuid
        }
    });

    // Continue
    next();
}

// Middleware to get chunk by coordinates
async function getChunkByCoordinates(req, res, next) {
    // Get chunk from database
    const found = await chunk.findOne({
        where: {
            x: req.params.x,
            z: req.params.z
        }
    });

    // Check if chunk was found
    if (found === null) {
        // If not, return with a 404
        return res.status(404).json({ message: 'Chunk not found' });
    }

    // Save chunk and continue
    res.chunk = found;
    next();
}

// Middleware to get chunks by region
async function getChunksByRegion(req, res, next) {
    // Convert params to numbers
    const x = parseInt(req.params.x);
    const z = parseInt(req.params.z);

    // Get chunks from database
    res.region = await chunk.findAll({
        where: {
            x: { [Op.between]: [x * 32, (x + 1) * 32 - 1] },
            z: { [Op.between]: [z * 32, (z + 1) * 32 - 1] }
        }
    });

    // Continue
    next();
}

// Export
module.exports = {
    checkToken,
    getPlayerByUUID,
    getServerByID,
    getTeamByID,
    getJobByPlayer,
    getJobsByPlayer,
    getChunkByCoordinates,
    getChunksByRegion
};