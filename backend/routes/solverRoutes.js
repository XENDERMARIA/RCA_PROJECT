const express = require('express');
const router = express.Router();
const {
  searchSolutions,
  getGuidedHelp,
  chatDiagnose,
  submitFeedback,
  getSuggestions
} = require('../controllers/solverController');

// Search for solutions based on problem description
router.post('/search', searchSolutions);

// Get step-by-step guidance for a specific RCA
router.post('/guide', getGuidedHelp);

// Conversational diagnosis
router.post('/chat', chatDiagnose);

// Submit feedback and optionally create new RCA
router.post('/feedback', submitFeedback);

// Get autocomplete suggestions
router.get('/suggest', getSuggestions);

module.exports = router;
