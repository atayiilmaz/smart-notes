const express = require('express');
const router = express.Router();
const { 
    getAllNotes,
    createNote,
    getNoteById,
    updateNote,
    deleteNote
} = require('../controllers/noteController');

// Root route group - GET all notes and POST new note
router.route('/')
    .get(getAllNotes)
    .post(createNote);

// ID route group - GET, PATCH, and DELETE specific note
router.route('/:id')
    .get(getNoteById)
    .patch(updateNote)
    .delete(deleteNote);

module.exports = router;
