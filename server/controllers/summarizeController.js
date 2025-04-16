const { summarizeText } = require('../utils/summarizeText');

// Summarize text
const summarizeContent = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const summary = await summarizeText(text);
        res.json({ summary });
    } catch (error) {
        console.error('Error in summarizeContent:', error);
        res.status(500).json({ message: error.message || 'Failed to summarize text' });
    }
};

module.exports = {
    summarizeContent
};
