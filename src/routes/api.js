// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Decode body from json
router.use(express.json());

// Get models
const server = require('../models/server');
const player = require('../models/player');
const minecraft = require('../models/minecraft');

// Middleware to get player by uuid
async function getPlayerByUUID(req, res, next) {
    // Get player from database
    const found = await player.findOne({
        where: { uuid: req.params.uuid }
    });

    // Check if player was found
    if (found == undefined) {
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
    if (found == undefined) {
        // If not, return with a 404
        return res.status(404).json({ message: 'Server not found' });
    }

    // Save server and continue
    res.token = found.token;
    found.token = undefined;
    res.server = found;
    next();
}

// Middleware to check server token
async function checkToken(req, res, next) {
    // Get server from database
    const found = await server.findOne({
        where: { token: req.header('token') }
    });

    // Check if server was found
    if (found == undefined) {
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

// Get all servers
router.get('/server/', async (req, res) => {
    const servers = await server.findAll({
        attributes: { exclude: ['token'] }
    });
    res.json(servers);
});

// Get server by id
router.get('/server/:id', getServerByID, async (req, res) => {
    res.json(res.server);
});

// Update server by id
router.put('/server/:id', getServerByID, checkToken, async (req, res) => {
    // Update server data
    if (req.body.status) {
        res.server.status = req.body.status;
    }
    if (req.body.players) {
        res.server.players = req.body.players;
    }
    await res.server.save({ fields: ['status', 'players'] });

    // Return new response
    res.json(res.server);
});

// Get player by uuid
router.get('/player/:uuid', getPlayerByUUID, async (req, res) => {
    res.json(res.player);
});

// Export
module.exports = router;