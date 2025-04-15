const express = require('express');
const router = express.Router();
const summarizeController = require('../controllers/summarizeController');

/**
 * @swagger
 * /summarize:
 *   post:
 *     summary: Generate a summary of the provided text
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content to be summarized
 *     responses:
 *       200:
 *         description: Text summarized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                   description: The generated summary
 *       400:
 *         description: Text is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Text is required
 */
router.route('/')
    .post(summarizeController.summarizeContent);

module.exports = router;
