const sqlite3 = require('sqlite3').verbose();

const dbName = 'example';
const db = new sqlite3.Database(`./${dbName}.db`);

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field1 TEXT NOT NULL,
    field2 TEXT NOT NULL
)`);

// Insert a fictional entry
db.run("INSERT INTO entries (field1, field2) VALUES (?, ?)", ['Sample Field 1', 'Sample Field 2'], function(err) {
    if (err) {
        console.error('Error inserting entry:', err.message);
        return;
    }
    console.log('Fictional entry created with ID:', this.lastID);
});

db.close();
