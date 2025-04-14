var express = require('express');
var router = express.Router();

// **GET /api/v1/notes** - Retrieve all notes

// **POST /api/v1/notes** - Create a new note

// **GET /api/v1/notes/{id}** - Retrieve a specific note by ID

// **PUT /api/v1/notes/{id}** - Update a specific note

// **DELETE /api/v1/notes/{id}** - Delete a specific note

router.route('/')
  .get(function(req, res) {
    res.json({
      message: 'Retrieve all notes'
    });
  })
  .post(function(req, res) {
    res.json({
      message: 'Create a new note'
    });
  });

router.route('/:id')
  .get(function(req, res) {
    res.json({
      message: 'Retrieve a specific note by ID'
    });
  })
  .patch(function(req, res) {
    res.json({
      message: 'Update a specific note'
    });
  })
  .delete(function(req, res) {
    res.json({
      message: 'Delete a specific note'
    });
  });


module.exports = router;
