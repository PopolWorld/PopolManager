// Import modules
const express = require('express');

// Create a router
const router = express.Router();

// Get the player model
const player = require('../../models/player');

// Middleware to get player by uuid
async function getPlayerByUUID(req, res, next) {
  // Get player from database
  const found = await player.findOne({
    where: { uuid: req.params.uuid }
  });

  // Check if player was found
  if (found == undefined) {
    // If not, return with a 404
    return res.status(404).json({ message: 'Player not found' })
  }

  // Save player and continue
  res.player = found;
  next();
}

// Get player by uuid
router.get('/:uuid', getPlayerByUUID, async (req, res) => {
  res.json(res.player);
});

// Export
module.exports = router;