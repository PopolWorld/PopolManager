// Get models
const server = require('../../models/server');

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

// Export
module.exports = checkToken;