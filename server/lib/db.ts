import Database from 'better-sqlite3';

const sqliteDb = new Database('smartplate.db');
console.log('Using SQLite database');

// Enable foreign key enforcement
sqliteDb.exec('PRAGMA foreign_keys = ON;');

// ─── Create / ensure all tables exist ─────────────────────────────────────────
sqliteDb.exec(`
    -- Core users
    CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        username        TEXT    NOT NULL UNIQUE,
        email           TEXT    NOT NULL UNIQUE,
        password_hash   TEXT    NOT NULL,
        role            TEXT    DEFAULT 'home',
        status          TEXT    DEFAULT 'active',
        active_theme    TEXT    DEFAULT 'default',
        avatar          TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Inventory
    CREATE TABLE IF NOT EXISTS inventory (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL,
        name            TEXT    NOT NULL,
        category        TEXT,
        quantity        REAL    DEFAULT 1.0,
        unit            TEXT    DEFAULT 'unit',
        price           REAL    DEFAULT 0.0,
        expiry_date     DATE,
        added_date      DATE,
        barcode         TEXT,
        emoji           TEXT,
        insights        TEXT,
        used_recently   BOOLEAN DEFAULT 0,
        expiring_soon   BOOLEAN DEFAULT 0,
        donated         BOOLEAN DEFAULT 0,
        in_hamper       BOOLEAN DEFAULT 0,
        flagged         BOOLEAN DEFAULT 0,
        flag_reason     TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Waste logs
    CREATE TABLE IF NOT EXISTS waste_logs (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL,
        item_name       TEXT    NOT NULL,
        quantity        REAL,
        action          TEXT    NOT NULL CHECK(action IN ('consumed', 'wasted')),
        logged_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Hamper items: junction table linking users to inventory items they want to donate
    -- (donation_hampers kept for backwards compatibility, hamper_items is the new relational approach)
    CREATE TABLE IF NOT EXISTS hamper_items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL,
        inventory_id    INTEGER NOT NULL,
        added_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, inventory_id),
        FOREIGN KEY (user_id)      REFERENCES users(id)     ON DELETE CASCADE,
        FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
    );

    -- Physical donation drop-off locations
    CREATE TABLE IF NOT EXISTS donation_locations (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        name            TEXT    NOT NULL,
        address         TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Time slots for each location
    CREATE TABLE IF NOT EXISTS donation_location_slots (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id     INTEGER NOT NULL,
        slot_time       TEXT    NOT NULL,
        FOREIGN KEY (location_id) REFERENCES donation_locations(id) ON DELETE CASCADE
    );

    -- Community drop-offs posted by users at a location
    CREATE TABLE IF NOT EXISTS community_dropoffs (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id     INTEGER NOT NULL,
        user_id         INTEGER NOT NULL,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES donation_locations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE
    );

    -- Individual items within a community drop-off
    CREATE TABLE IF NOT EXISTS community_dropoff_items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        dropoff_id      INTEGER NOT NULL,
        item_name       TEXT    NOT NULL,
        FOREIGN KEY (dropoff_id) REFERENCES community_dropoffs(id) ON DELETE CASCADE
    );

    -- Requests on a community drop-off item
    CREATE TABLE IF NOT EXISTS donation_requests (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        dropoff_id          INTEGER NOT NULL,
        requester_user_id   INTEGER NOT NULL,
        item_name           TEXT    NOT NULL,
        status              TEXT    DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')),
        created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dropoff_id)        REFERENCES community_dropoffs(id) ON DELETE CASCADE,
        FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Donation complaints filed by users
    CREATE TABLE IF NOT EXISTS donation_complaints (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL,
        type            TEXT    NOT NULL CHECK(type IN ('failed_pickup','complaint')),
        description     TEXT    NOT NULL,
        status          TEXT    DEFAULT 'open' CHECK(status IN ('open','resolved')),
        resolution      TEXT,
        location_name   TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Challenge tiers (admin-editable)
    CREATE TABLE IF NOT EXISTS challenge_tiers (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        threshold       INTEGER NOT NULL,
        reward          TEXT    NOT NULL UNIQUE,
        label           TEXT    NOT NULL,
        emoji           TEXT,
        description     TEXT
    );

    -- Rewards unlocked per user
    CREATE TABLE IF NOT EXISTS user_rewards (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL,
        reward          TEXT    NOT NULL,
        unlocked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, reward),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- AI-generated recipes stored per user
    CREATE TABLE IF NOT EXISTS recipes (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL,
        title           TEXT    NOT NULL,
        time            TEXT,
        difficulty      TEXT,
        emoji           TEXT,
        ingredients     TEXT,
        steps           TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notifications per user
    CREATE TABLE IF NOT EXISTS notifications (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id         INTEGER NOT NULL,
        title           TEXT    NOT NULL,
        message         TEXT    NOT NULL,
        type            TEXT    DEFAULT 'info',
        time            TEXT,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
`);

// ─── Migrate existing tables: add new columns if they don't exist yet ──────────
// SQLite only supports ADD COLUMN — we wrap each in try/catch so the server
// starts fine whether this is a fresh DB or an existing one.
const addColumnIfMissing = (table: string, column: string, definition: string) => {
    try {
        sqliteDb.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch {
        // Column already exists — safe to ignore
    }
};

// users
addColumnIfMissing('users', 'status',       "TEXT DEFAULT 'active'");
addColumnIfMissing('users', 'avatar',       'TEXT');

// inventory
addColumnIfMissing('inventory', 'flagged',    'BOOLEAN DEFAULT 0');
addColumnIfMissing('inventory', 'flag_reason','TEXT');
addColumnIfMissing('inventory', 'in_hamper',  'BOOLEAN DEFAULT 0');

// ─── Async-compatible query helpers ───────────────────────────────────────────
export const query = async (sql: string, params: any[] = []) => {
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(...params);
    } else {
        const result = stmt.run(...params);
        return { insertId: result.lastInsertRowid, affectedRows: result.changes };
    }
};

export const queryOne = async (sql: string, params: any[] = []) => {
    const res = await query(sql, params);
    return Array.isArray(res) ? res[0] : res;
};

export default { query, queryOne };
