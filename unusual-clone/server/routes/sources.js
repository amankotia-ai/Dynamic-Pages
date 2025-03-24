const express = require('express');
const router = express.Router();
const {
  getSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource
} = require('../controllers/sourceController');
const auth = require('../middlewares/auth');

// All routes are protected with auth middleware

// @route   GET /api/sources
// @desc    Get all sources for current user
// @access  Private
router.get('/', auth, getSources);

// @route   GET /api/sources/:id
// @desc    Get a source by id
// @access  Private
router.get('/:id', auth, getSourceById);

// @route   POST /api/sources
// @desc    Create a new source
// @access  Private
router.post('/', auth, createSource);

// @route   PUT /api/sources/:id
// @desc    Update a source
// @access  Private
router.put('/:id', auth, updateSource);

// @route   DELETE /api/sources/:id
// @desc    Delete a source
// @access  Private
router.delete('/:id', auth, deleteSource);

module.exports = router; 