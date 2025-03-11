// cache.js

const crypto = require('crypto');

class Cache {
    constructor() {
        this.cache = new Map();
    }

    generateKey(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    get(content) {
        const key = this.generateKey(content);
        return this.cache.get(key);
    }

    set(content, data) {
        const key = this.generateKey(content);
        this.cache.set(key, data);
    }
}

module.exports = new Cache();

