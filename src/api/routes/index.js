const Router = require('koa-router');
const { swaggerRouter } = require('../../middleware/swagger');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config/config');
const contentAnalyzer = require('../controllers/contentAnalyzer');

const router = new Router();

// Swagger setup
swaggerRouter(router);

// Define other routes
router.get('/api', async (ctx) => {
    ctx.body = 'Welcome to the API main route, checkout /swagger to see all the documentation';
});

/**
 * @openapi
 * /1/list:
 *   get:
 *     summary: List all files in the data directory
 *     description: Retrieves a list of files along with their sizes from the specified data directory.
 *     responses:
 *       200:
 *         description: An array of file names with their corresponding sizes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the file
 *                   size:
 *                     type: integer
 *                     description: The size of the file in bytes
 *                   entries:
 *                     type: integer
 *                     description: The number of posts in the file
 *                   posts:
 *                     type: array
 *                     description: The content of the posts in the file
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating why the operation failed
 */
router.get('/1/list', async (ctx) => {
    try {
        const files = await fs.readdir(path.resolve(config.dataPath));

        /* for each file make a collection with also file size */
        const filesWithSize = await Promise.all(files.map(async (file) => {
            const stats = await fs.stat(path.resolve(config.dataPath, file));
            const content = await fs.readFile(path.resolve(config.dataPath, file), 'utf8');
            const posts = contentAnalyzer.getPosts(content);
            return {
                name: file,
                size: stats.size,
                entries: posts.length,
                posts
            };
        }));
        ctx.body = filesWithSize;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to read directory' };
    }
});

/**
 * @openapi
 * /1/stats:
 *   get:
 *     summary: Get statistics over the files available
 *     description: Retrieve statistics such as file number of the files fetched from ARIL.
 *     responses:
 *       200:
 *         description: An object with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFiles:
 *                   type: integer
 *                   description: The number of files
 */
router.get('/1/stats', async (ctx) => {
    try {
        const files = await fs.readdir(path.resolve(config.dataPath));

        ctx.body = {
            totalFiles: files.length,
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to read directory' };
    }
});


router.get

module.exports = router;
