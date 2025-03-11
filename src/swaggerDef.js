// src/swaggerDef.js

module.exports = {
    openapi: '3.0.0', // Specify the OpenAPI spec version
    info: {
        title: 'RUSH experimental tool API',
        version: '1.0.0',
        description: 'These API are for internal use and should just grow during our research',
    },
    servers: [
        {
            url: 'http://127.0.0.1:3000', // URL of the server where the API is hosted
            description: 'Local server',
        },
    ],
    basePath: '/',
};

