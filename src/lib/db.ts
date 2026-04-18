import Database from 'better-sqlite3';
import { join } from 'path';

// For the AI Studio preview, we use better-sqlite3.
// In a production environment with MariaDB, replace this with the 'mariadb' package.
const db = new Database('smartplate.db');

// Initialize tables for SQLite
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        quantity REAL DEFAULT 1.0,
        unit TEXT DEFAULT 'unit',
        expiry_date DATE,
        barcode TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS waste_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        quantity REAL,
        action TEXT CHECK(action IN ('consumed', 'wasted')) NOT NULL,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        ingredients TEXT, -- SQLite doesn't have JSON type, so we store as string
        planned_for DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
`);

/**
 * DATABASE REPLACEMENT GUIDE FOR MARIADB:
 * 
 * To switch to MariaDB:
 * 1. Install 'mariadb' npm package.
 * 2. Update this file to use 'mariadb.createConnection()' or 'pool'.
 * 3. Update SQL queries to use '?' for parameters (MariaDB uses the same as SQLite).
 * 
 * example:
 * import mariadb from 'mariadb';
 * const pool = mariadb.createPool({host: 'localhost', user:'root', password: '...', database: 'smartplate'});
 */

export default db;
