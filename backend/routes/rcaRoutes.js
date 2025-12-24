const express = require('express');
const router = express.Router();
const {
  createRCA,
  getAllRCAs,
  getRCAById,
  updateRCA,
  deleteRCA,
  searchRCAs,
  getRCAStats
} = require('../controllers/rcaController');

// Statistics route (must be before /:id to avoid conflict)
router.get('/stats', getRCAStats);

// Search route
router.get('/search', searchRCAs);

// CRUD routes
router.route('/')
  .get(getAllRCAs)
  .post(createRCA);

router.route('/:id')
  .get(getRCAById)
  .put(updateRCA)
  .delete(deleteRCA);

module.exports = router;
