const { summarizeText } = require('../utils/summarizeText');

// Summarize text
const summarizeContent = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const summary = summarizeText(text);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    summarizeContent
};
