const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Smart Notes API',
            version: '1.0.0',
            description: 'A REST API for managing notes with AI-powered summarization',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
