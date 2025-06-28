import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduResolve API',
      version: '1.0.0',
      description: 'API documentation for EduResolve application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./Routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(options);
export default swaggerSpecs;
