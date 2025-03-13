const Router = require('koa-router');
const { swaggerRouter } = require('../../middleware/swagger');
const config = require('../../config/config');
const debug = require('debug')('rush:routes:2');

const router = new Router();

// Swagger setup
swaggerRouter(router);

/**
 * @openapi
 * /2/:
 *   get:
 *     summary: Root Endpoint
 *     description: Returns a simple text message as a response.
 *     responses:
 *       200:
 *         description: A simple text response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Welcome to API version 2"
 */
router.get('/2', async (ctx) => {
    ctx.body = 'These API are saving the material and allow retrival in a second stage';
});

module.exports = router;
