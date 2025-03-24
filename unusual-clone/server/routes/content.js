const express = require('express');
const router = express.Router();
const { getContent } = require('../controllers/contentController');

// @route   POST /api/content/get_content
// @desc    Get personalized content based on referrer and URL
// @access  Public
router.post('/get_content', getContent);

module.exports = router; 