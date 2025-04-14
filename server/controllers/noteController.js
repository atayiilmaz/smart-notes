const Note = require('../models/Note');

// Get all notes with pagination
const getAllNotes = async (req, res) => {
    try {
        // Parse query parameters with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination metadata
        const totalCount = await Note.countDocuments();

        // Get paginated notes
        const notes = await Note.find()
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
    const note = new Note({
        title: req.body.title,
        content: req.body.content
    });

    try {
        const newNote = await note.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get one note by ID
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (note == null) {
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
        const note = await Note.findById(req.params.id);
        if (note == null) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (req.body.title != null) {
            note.title = req.body.title;
        }
        if (req.body.content != null) {
            note.content = req.body.content;
        }

        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (note == null) {
            return res.status(404).json({ message: 'Note not found' });
        }
        await note.deleteOne();
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote
};
