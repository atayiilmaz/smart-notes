const express = require('express');
const router = express.Router();
const { summarizeContent } = require('../controllers/summarizeController');

// Root route group - POST for summarization
router.route('/')
    .post(summarizeContent);

module.exports = router;
