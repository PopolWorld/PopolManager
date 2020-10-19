// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Get the server model
const server = require('../../models/server');

// Get minecraft server instance
const MinecraftServer = require('../../models/minecraft');

// Middleware to get server by id
async function getServerByID(req, res, next) {
  // Get server from database
  const found = await server.findOne({
    where: { id: req.params.id }
  });

  // Check if player was found
  if (found == undefined) {
    // If not, return with a 404
    return res.status(404).json({ message: 'Server not found' })
  }

  // Save server and continue
  res.token = found.token;
  found.token = undefined;
  res.server = found;
  next();
}

// Get all servers
router.get('/', async (req, res) => {
  const servers = await server.findAll({
    attributes: { exclude: ['token'] }
  });
  res.json(servers);
});

// Get server by id
router.get('/:id', getServerByID, async (req, res) => {
  res.json(res.server);
});

// Update server by id
router.put('/:id', getServerByID, async (req, res) => {
  // Check access (via token)
  if (res.token != req.header('token')) {
    return res.status(403).json({ message: 'Access denied' })
  }

  // Update server data
  if (req.body.status) {
    res.server.status = req.body.status;
  }
  await res.server.save({ fields: ['status'] });

  // Return new response
  res.json(res.server);
});

// Export
module.exports = router;