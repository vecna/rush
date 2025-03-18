const Router = require('koa-router');
const { swaggerRouter } = require('../../middleware/swagger');
const debug = require('debug')('rush:routes:2');
const { MongoClient, ObjectId } = require('mongodb');

const router = new Router();
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'rush';

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
 * /2/io/{collection_name}:
 *   get:
 *     summary: Get all entries
 *     description: Returns all content from the specified collection.
 *     parameters:
 *       - name: collection_name
 *         in: path
 *         required: true
 *         description: Name of the collection
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
router.get('/2/io/:collection_name', async (ctx) => {
    const collectionName = ctx.params.collection_name;
    debug(`Fetching all entries from collection: ${collectionName}`);

    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const entries = await collection.find({}).toArray();
        debug(`Entries fetched successfully: ${JSON.stringify(entries)}`);
        ctx.body = entries;
    } catch (err) {
        debug(`Error fetching entries: ${err.message}`);
        ctx.status = 500;
        ctx.body = { error: err.message };
    } finally {
        await client.close();
    }
});

/**
 * @openapi
 * /2/io/{collection_name}:
 *   put:
 *     summary: Create a new entry
 *     description: Creates a new entry in the specified collection.
 *     parameters:
 *       - name: collection_name
 *         in: path
 *         required: true
 *         description: Name of the collection
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: The ID of the created entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 */
router.put('/2/io/:collection_name', async (ctx) => {
    const collectionName = ctx.params.collection_name;
    const requestBody = ctx.request.body;

    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const result = await collection.insertOne(requestBody);
        debug(`Entry created successfully with ID: ${result.insertedId}`);
        ctx.body = { id: result.insertedId };
    } catch (err) {
        debug(`Error creating entry: ${err.message}`);
        ctx.status = 500;
        ctx.body = { error: err.message };
    } finally {
        await client.close();
    }
});

/**
 * @openapi
 * /2/io/{collection_name}/{id}:
 *   post:
 *     summary: Update an entry
 *     description: Updates an entry in the specified collection.
 *     parameters:
 *       - name: collection_name
 *         in: path
 *         required: true
 *         description: Name of the collection
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the entry to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
router.post('/2/io/:collection_name/:id', async (ctx) => {
    const collectionName = ctx.params.collection_name;
    const id = ctx.params.id;
    const requestBody = ctx.request.body;

    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: requestBody });
        if (result.matchedCount === 0) {
            debug(`ID not found: ${id}`);
            ctx.status = 404;
            ctx.body = { error: "ID not found" };
            return;
        }
        debug(`Entry updated successfully: ${result.modifiedCount} changes`);
        ctx.body = { updated: result.modifiedCount };
    } catch (err) {
        debug(`Error updating entry: ${err.message}`);
        ctx.status = 500;
        ctx.body = { error: err.message };
    } finally {
        await client.close();
    }
});

/**
 * @openapi
 * /2/io/{collection_name}/{id}:
 *   delete:
 *     summary: Delete an entry
 *     description: Deletes an entry from the specified collection.
 *     parameters:
 *       - name: collection_name
 *         in: path
 *         required: true
 *         description: Name of the collection
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the entry to delete
 *         schema:
 *           type: string
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
router.delete('/2/io/:collection_name/:id', async (ctx) => {
    const collectionName = ctx.params.collection_name;
    const id = ctx.params.id;

    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            debug(`ID not found: ${id}`);
            ctx.status = 404;
            ctx.body = { error: "ID not found" };
            return;
        }
        debug(`Entry deleted successfully: ${result.deletedCount} changes`);
        ctx.body = { deleted: result.deletedCount };
    } catch (err) {
        debug(`Error deleting entry: ${err.message}`);
        ctx.status = 500;
        ctx.body = { error: err.message };
    } finally {
        await client.close();
    }
});

/**
 * @openapi
 * /2/initialize/{collection_name}:
 *   post:
 *     summary: Initialize the collection
 *     description: Initializes the collection with the required schema.
 *     parameters:
 *       - name: collection_name
 *         in: path
 *         required: true
 *         description: Name of the collection
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/2/initialize/:collection_name', async (ctx) => {
    const collectionName = ctx.params.collection_name;

    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        await collection.createIndex({ id: 1 }, { unique: true });
        debug(`Collection '${collectionName}' initialized successfully`);
        ctx.body = { message: "Collection initialized successfully" };
    } catch (err) {
        debug(`Error initializing collection: ${err.message}`);
        ctx.status = 500;
        ctx.body = { error: err.message };
    } finally {
        await client.close();
    }
});

module.exports = router;
