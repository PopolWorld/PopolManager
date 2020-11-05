// Get models
const player = require('../../models/player');
const server = require('../../models/server');
const team = require('../../models/team');

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
        include: { model: team }
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

    // Check if player was found
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
        include: { model: player }
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

// Export
module.exports = {
    checkToken,
    getPlayerByUUID,
    getServerByID,
    getTeamByID
};