import sqlite3 from 'sqlite3';
sqlite3.verbose();
import path from 'path';
const __dirname = path.resolve();

// User database setup
const db = new sqlite3.Database(__dirname + '/userDb.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, uuid TEXT UNIQUE)");
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, uuid TEXT, msgFrom TEXT, message TEXT, time TEXT NOT NULL DEFAULT current_timestamp)");
});

export default db;