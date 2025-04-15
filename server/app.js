require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const auth = require('./middleware/auth');

const notesRouter = require('./routes/notesRouter');
const summarizeRouter = require('./routes/summarizeRouter');
const authRouter = require('./routes/authRouter');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true

}));
app.use(logger('dev'));
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public routes (no auth required)
app.use('/api/auth', authRouter);

// Auth middleware - protect all routes after this
app.use(auth);

// Protected routes
app.use('/api/notes', notesRouter);
app.use('/api/summarize', summarizeRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
