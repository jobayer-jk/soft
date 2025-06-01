const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InvoiceMaster Pro API",
      version: "1.0.0",
      description: "API documentation for the InvoiceMaster Pro backend application.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: "Development server",
      },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        bearerAuth: []
    }]
  },
  // Path to the API docs
  // Make sure this points to your route files where you define API endpoints
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

