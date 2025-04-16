const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const summarizeText = async (text) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that summarizes text concisely. Keep summaries brief and to the point."
                },
                {
                    role: "user",
                    content: `Please summarize the following text in 2-3 sentences:\n\n${text}`
                }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error in summarization:', error);
        
        // If it's a quota/rate limit error, use mock implementation
        if (error.message.includes('quota') || error.message.includes('RateLimit')) {
            console.log('Using mock implementation due to API quota/rate limit');
            // Mock implementation - create a simple summary
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            if (sentences.length > 0) {
                const summary = sentences.slice(0, 2).join('. ') + '.';
                return summary;
            }
        }
        
        // Fallback to simple word-based summarization
        const words = text.split(' ');
        if (words.length <= 15) return text;
        return words.slice(0, 15).join(' ') + '...';
    }
};

module.exports = {
    summarizeText
};
