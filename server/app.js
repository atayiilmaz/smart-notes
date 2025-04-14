var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const notesRouter = require('./routes/notesRouter');
const summarizeRouter = require('./routes/summarizeRouter');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/notes', notesRouter);
app.use('/summarize', summarizeRouter);

module.exports = app;
