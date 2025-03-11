const { koaSwagger } = require('koa2-swagger-ui');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = require('../swaggerDef');

// Options for swagger-jsdoc 
const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./src/api/routes/*.js', './src/api/controllers/*.js'],
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);

function swaggerRouter(router) {
    router.get('/swagger', koaSwagger({
        routePrefix: false, // disable koa-router
        swaggerOptions: { spec: swaggerSpec },
    }));
}

module.exports = { swaggerRouter };

