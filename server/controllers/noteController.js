const Note = require('../models/Note');

// Get all notes with pagination
const getAllNotes = async (req, res) => {
    try {
        // Parse query parameters with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination metadata (only user's notes)
        const totalCount = await Note.countDocuments({ user: req.user._id });

        // Get paginated notes (only user's notes)
        const notes = await Note.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            data: notes,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                limit,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new note
const createNote = async (req, res) => {
    try {
        const note = new Note({
            ...req.body,
            user: req.user._id // Add user reference
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get single note by ID
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a note
const updateNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Update allowed fields
        const updates = req.body;
        const allowedUpdates = ['title', 'content', 'summary'];

        Object.keys(updates).forEach((update) => {
            if (allowedUpdates.includes(update)) {
                note[update] = updates[update];
            }
        });

        await note.save();
        res.json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Summarize note content
const summarizeNote = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text is required for summarization' });
        }

        const { summarizeText } = require('../utils/summarizeText');
        const summary = await summarizeText(text);
        res.json({ summary });
    } catch (error) {
        console.error('Error in summarize route:', error);
        res.status(500).json({ message: 'Failed to generate summary' });
    }
};

module.exports = {
    getAllNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote,
    summarizeNote
};
