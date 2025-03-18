const Router = require('koa-router');
const { swaggerRouter } = require('../../middleware/swagger');
const config = require('../../config/config');
const debug = require('debug')('rush:routes:2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = new Router();

// Swagger setup
swaggerRouter(router);

/**
 * @openapi
 * /2/:
 *   get:
 *     summary: Root Endpoint - there is a limit in this documentation, since the DB format is at the moment "generic" (not defined)
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

/**
 * @openapi
 * /2/io/{db_name}:
 *   get:
 *     summary: Get all entries
 *     description: Returns all content from the SQLite database with the specified name.
 *     parameters:
 *       - name: db_name
 *         in: path
 *         required: true
 *         description: Name of the database
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/2/io/:db_name', async (ctx) => {
    const dbName = ctx.params.db_name;
    debug(`Fetching all entries from database: ${dbName}`);
    const dbPath = path.join(config.databases, `${dbName}.db`);
    const db = new sqlite3.Database(dbPath);

    db.all("SELECT * FROM entries", [], (err, rows) => {
        if (err) {
            debug(`Error fetching entries: ${err.message}`);
            ctx.status = 500;
            ctx.body = { error: err.message };
            return;
        }
        debug(`Entries fetched successfully: ${JSON.stringify(rows)}`);
        ctx.body = rows;
    });

    db.close();
});

/**
 * @openapi
 * /2/io/{db_name}:
 *   put:
 *     summary: Create a new entry
 *     description: Creates a new entry in the specified SQLite database.
 *     parameters:
 *       - name: db_name
 *         in: path
 *         required: true
 *         description: Name of the database
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *               field2:
 *                 type: string
 *     responses:
 *       200:
 *         description: The ID of the created entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 */
router.put('/2/io/:db_name', async (ctx) => {
    const dbName = ctx.params.db_name;
    const dbPath = path.join(config.databases, `${dbName}.db`);


    // Validate fields from ctx.request.body
    const requestBody = ctx.request.body;
    for (const key of config.expectedKeys) {
        if (!requestBody[key]) {
            debug(`Missing field in the JSON body: ${key}`);
            ctx.status = 400;
            ctx.body = { error: `Missing field in the JSON body: ${key}` };
            return;
        }
    }

    debug(`Creating new entry in database: ${dbName} in ${dbPath}`);
    const db = new sqlite3.Database(dbPath);

    // Construct the query dynamically
    const columns = config.expectedKeys.join(", ");
    const placeholders = config.expectedKeys.map(() => "?").join(", ");
    const values = config.expectedKeys.map(key => requestBody[key]);

    db.run(`INSERT INTO entries (${columns}) VALUES (${placeholders})`, values, function(err) {
        if (err) {
            debug(`Error creating entry: ${err.message}`);
            ctx.status = 500;
            ctx.body = { error: err.message };
            return;
        }
        debug(`Entry created successfully with ID: ${this.lastID}`);
        ctx.body = { id: this.lastID };
    });

    db.close();
});

/**
 * @openapi
 * /2/io/{db_name}/{id}:
 *   post:
 *     summary: Update an entry
 *     description: Updates an entry in the specified SQLite database.
 *     parameters:
 *       - name: db_name
 *         in: path
 *         required: true
 *         description: Name of the database
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the entry to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *               field2:
 *                 type: string
 *     responses:
 *       200:
 *         description: The number of updated entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 */
router.post('/2/io/:db_name/:id', async (ctx) => {
    const dbName = ctx.params.db_name;
    const dbPath = path.join(config.databases, `${dbName}.db`);
    const id = ctx.params.id;
    const { field1, field2 } = ctx.request.body;

    debug(`Updating entry with ID: ${id} in database: ${dbName}`);
    const db = new sqlite3.Database(dbPath);
    db.run("UPDATE entries SET field1 = ?, field2 = ? WHERE id = ?", [field1, field2, id], function(err) {
        if (err) {
            debug(`Error updating entry: ${err.message}`);
            ctx.status = 500;
            ctx.body = { error: err.message };
            return;
        }
        if (this.changes === 0) {
            debug(`ID not found: ${id}`);
            ctx.status = 404;
            ctx.body = { error: "ID not found" };
            return;
        }
        debug(`Entry updated successfully: ${this.changes} changes`);
        ctx.body = { updated: this.changes };
    });

    db.close();
});

/**
 * @openapi
 * /2/io/{db_name}/{id}:
 *   delete:
 *     summary: Delete an entry
 *     description: Deletes an entry from the specified SQLite database.
 *     parameters:
 *       - name: db_name
 *         in: path
 *         required: true
 *         description: Name of the database
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the entry to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The number of deleted entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: integer
 */
router.delete('/2/io/:db_name/:id', async (ctx) => {
    const dbName = ctx.params.db_name;
    const dbPath = path.join(config.databases, `${dbName}.db`);
    const id = ctx.params.id;

    debug(`Deleting entry with ID: ${id} from database: ${dbName}`);
    const db = new sqlite3.Database(dbPath);
    db.run("DELETE FROM entries WHERE id = ?", [id], function(err) {
        if (err) {
            debug(`Error deleting entry: ${err.message}`);
            ctx.status = 500;
            ctx.body = { error: err.message };
            return;
        }
        if (this.changes === 0) {
            debug(`ID not found: ${id}`);
            ctx.status = 404;
            ctx.body = { error: "ID not found" };
            return;
        }
        debug(`Entry deleted successfully: ${this.changes} changes`);
        ctx.body = { deleted: this.changes };
    });

    db.close();
});

/**
 * @openapi
 * /2/initialize/{db_name}:
 *   post:
 *     summary: Initialize the database
 *     description: Initializes the SQLite database with the required table schema.
 *     parameters:
 *       - name: db_name
 *         in: path
 *         required: true
 *         description: Name of the database
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Database initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/2/initialize/:db_name', async (ctx) => {
    const dbName = ctx.params.db_name;
    const dbPath = path.join(config.databases, `${dbName}.db`);

    debug(`Initializing database: ${dbName}`);
    // Initialize the database
    initializeDatabase(dbPath, config.expectedKeys);

    ctx.body = { message: "Database initialized successfully" };
});

// Function to initialize the database
function initializeDatabase(dbPath, config.expectedKeys) {
    const db = new sqlite3.Database(dbPath);
    const columns = config.expectedKeys.map(key => `${key} TEXT`).join(", ");
    const createTableQuery = `CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns})`;

    db.run(createTableQuery, (err) => {
        if (err) {
            debug(`Error creating table: ${err.message}`);
        } else {
            debug(`Table 'entries' ensured in database: ${dbPath}`);
        }
    });

    db.close();
}

module.exports = router;
