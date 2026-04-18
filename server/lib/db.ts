import * as mariadb from 'mariadb';
import Database from 'better-sqlite3';

const useMariaDB = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

let pool: any = null;
let sqliteDb: any = null;

if (useMariaDB) {
  pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectionLimit: 5
  });
  console.log('Connected to MariaDB Pool');
} else {
  sqliteDb = new Database('smartplate.db');
  console.log('Using SQLite fallback');
  
  sqliteDb.exec(`
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
        ingredients TEXT, 
        planned_for DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

// Wrapper to handle both DBs with a similar async interface
export const query = async (sql: string, params: any[] = []) => {
  if (pool) {
    let conn;
    try {
      conn = await pool.getConnection();
      const res = await conn.query(sql, params);
      return res;
    } finally {
      if (conn) conn.release();
    }
  } else {
    // Convert SQLite to async-like
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params);
    } else {
      const result = stmt.run(...params);
      return { insertId: result.lastInsertRowid, affectedRows: result.changes };
    }
  }
};

export const queryOne = async (sql: string, params: any[] = []) => {
  const res = await query(sql, params);
  return Array.isArray(res) ? res[0] : res;
};

export default { query, queryOne };
