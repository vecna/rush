const Router = require('koa-router');
const { swaggerRouter } = require('../../middleware/swagger');
const fs = require('fs').promises;
const path = require('path');
const getSortedFiles = require('../../utils/sortedFiles').getSortedFiles;
const config = require('../../config/config');
const contentAnalyzer = require('../../utils/contentAnalyzer');
const debug = require('debug')('rush:routes:1');

const router = new Router();

// Swagger setup
swaggerRouter(router);

/**
 * @openapi
 * /1/:
 *   get:
 *     summary: Root Endpoint for API set 1
 *     description: Returns a simple text message as a response, it's the logic for API set 1
 *     responses:
 *       200:
 *         description: A simple text response
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Welcome to API version 1"
 */
router.get('/1', async (ctx) => {
    ctx.body = 'API set 1 contains endpoints that return the original content with least modification as possible. Please che /swagger to see all the documentation. The original are meant to be processed by other consumers, and via API set 2 the elaboration can be saved.';
});

/**
 * @openapi
 * /1/content:
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
router.get('/1/content', async (ctx) => {
    try {
        /* this is a consistent old to new file order */
        const files = await getSortedFiles(config.dataPath);

        /* for each file make a collection with also file size */
        const filesWithSize = await Promise.all(files.map(async (file) => {
            const stats = await fs.stat(path.resolve(config.dataPath, file));
            const content = await fs.readFile(path.resolve(config.dataPath, file), 'utf8');
            debug("Analyzing content of [%s]", file);
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
 *                 total_files:
 *                   type: integer
 *                   description: The number of files
 *                 total_size:
 *                   type: integer
 *                   description: The total size of all files in bytes
 *                 files:
 *                   type: array
 *                   description: filename and it's size
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the file
 *                       size:
 *                         type: integer
 *                         description: The size of the file in bytes
 *                       file_number:
 *                         type: integer
 *                         description: Incremental number that identify the file
 */
router.get('/1/stats', async (ctx) => {
    try {
        /* this is a consistent old to new file order */
        const files = await getSortedFiles(config.dataPath);
        let total_size = 0;

        const files_with_size = await Promise.all(files.map(async (file, i) => {
            const stats = await fs.stat(path.resolve(config.dataPath, file));
            total_size += stats.size;
            return {
                name: file,
                size: stats.size,
                file_number: i,
            };
        }));

        ctx.body = {
            total_files: files.length,
            total_size,
            files_with_size
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to read directory' };
    }
});

/**
 * @openapi
 * /1/content/{file_number}:
 *   get:
 *     summary: Get file details by file number
 *     description: Retrieves details of a specific file by file number from a sorted list of files in the data directory. Returns the file's metadata and contents if valid.
 *     parameters:
 *       - in: path
 *         name: file_number
 *         required: true
 *         description: The index number of the file in the sorted list (0-based index).
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the specified file including name, size, and posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the file.
 *                 requested_file_number:
 *                   type: integer
 *                   description: The requested consistet file number.
 *                 posts:
 *                   type: array
 *                   description: An array containing the posts extracted from the file.
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         description: The content of the post.
 *       404:
 *         description: File number out of range or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the file number is out of range or invalid.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating why the operation failed.
 */
router.get('/1/content/:file_number', async (ctx) => {
    let target_fn = ctx.params.file_number;

    // Validate as integer
    if (/^\d+$/.test(target_fn)) {
        target_fn = parseInt(target_fn, 10);
    } 

    /* this is a consistent old to new file order */
    const files = await getSortedFiles(config.dataPath);

    if (target_fn < 0 || target_fn >= files.length) {
        ctx.status = 404;
        ctx.body = { error: 'File Number invalid, max is: ' + files.length -1 };
        return;
    }

    const file = files[target_fn];

    const content = await fs.readFile(path.resolve(config.dataPath, file), 'utf8');
    debug("Analyzing content of [%s]", file);
    const posts = contentAnalyzer.getPosts(content);
    ctx.status = 200;
    ctx.body = {
        name: file,
        requested_file_number: target_fn,
        posts
    };
});

module.exports = router;
