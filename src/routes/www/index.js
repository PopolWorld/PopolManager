// Import modules
const express = require('express');
const expressVue = require('express-vue');
const path = require('path');

// Create a router
const router = express.Router();

// Register vuejs
router.use(expressVue.init({
    rootPath: path.join(__dirname, './')
}));

// Register views
router.get('/', async (req, res) => res.renderVue('home.vue'));

// Custom redirections
router.get('/discord', async (req, res) => res.redirect(301, 'https://discord.gg/gvpsnrc6D3'));

// Export
module.exports = router;