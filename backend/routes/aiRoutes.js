const express = require('express');
const router = express.Router();
const {
  findSimilarRCAs,
  assistRCACreation,
  validateRootCause,
  generateSummary
} = require('../controllers/aiController');

// AI-assisted routes
router.post('/similarity', findSimilarRCAs);
router.post('/assist', assistRCACreation);
router.post('/validate-rootcause', validateRootCause);
router.post('/summarize', generateSummary);

module.exports = router;
