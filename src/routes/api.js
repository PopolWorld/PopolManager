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

/**
 * Middlewares
 */

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

/**
 * Servers
 */

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
    if (req.body.status !== undefined) {
        res.server.status = req.body.status;
    }
    if (req.body.players !== undefined) {
        res.server.players = req.body.players;
    }
    await res.server.save({ fields: ['status', 'players'] });

    // Return new response
    res.json(res.server);
});

/**
 * Player
 */

// Get player by uuid
router.get('/player/:uuid', getPlayerByUUID, async (req, res) => {
    res.json(res.player);
});

// Update player by id
router.put('/player/:uuid', checkToken, async (req, res) => {
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