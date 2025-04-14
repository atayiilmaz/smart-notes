// Mock summarization function (returns first 15 words + ...)
const summarizeText = (text) => {
    const words = text.split(' ');
    if (words.length <= 15) return text;
    return words.slice(0, 15).join(' ') + '...';
};

module.exports = {
    summarizeText
};
