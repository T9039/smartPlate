/**
 * smartPlate Database Schema (SQLite)
 * Auto-created in db.ts, but kept here for reference.
 * Last updated: 2026-05-01
 */

-- ─── Core Users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL UNIQUE,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    DEFAULT 'home',       -- 'home' | 'admin'
    status          TEXT    DEFAULT 'active',     -- 'active' | 'suspended'
    active_theme    TEXT    DEFAULT 'default',    -- 'default' | 'eco' | 'premium'
    avatar          TEXT,                         -- URI / base64 for profile pic
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Inventory ─────────────────────────────────────────────────────────────────
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
    flagged         BOOLEAN DEFAULT 0,            -- admin moderation flag
    flag_reason     TEXT,                         -- admin flag reason
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Waste / Action Logs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waste_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    item_name       TEXT    NOT NULL,
    quantity        REAL,
    action          TEXT    NOT NULL CHECK(action IN ('consumed', 'wasted')),
    logged_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Donation Hampers (user's personal outgoing donations) ─────────────────────
CREATE TABLE IF NOT EXISTS donation_hampers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    name            TEXT    NOT NULL,
    quantity        TEXT,
    source_type     TEXT    DEFAULT 'manual',     -- 'manual' | 'inventory'
    ready_status    BOOLEAN DEFAULT 0,
    emoji           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Donation Locations (community drop-off points) ────────────────────────────
CREATE TABLE IF NOT EXISTS donation_locations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    address         TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_location_slots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id     INTEGER NOT NULL,
    slot_time       TEXT    NOT NULL,             -- e.g. '08:00 – 10:00'
    FOREIGN KEY (location_id) REFERENCES donation_locations(id) ON DELETE CASCADE
);

-- ─── Community Drop-Offs (items posted by users at a location) ─────────────────
CREATE TABLE IF NOT EXISTS community_dropoffs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id     INTEGER NOT NULL,
    user_id         INTEGER NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES donation_locations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_dropoff_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    dropoff_id      INTEGER NOT NULL,
    item_name       TEXT    NOT NULL,
    FOREIGN KEY (dropoff_id) REFERENCES community_dropoffs(id) ON DELETE CASCADE
);

-- ─── Donation Requests (users requesting items from community drop-offs) ────────
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

-- ─── Donation Complaints ────────────────────────────────────────────────────────
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

-- ─── Challenge Tiers (admin-editable, previously hardcoded) ────────────────────
CREATE TABLE IF NOT EXISTS challenge_tiers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    threshold       INTEGER NOT NULL,             -- items needed to unlock
    reward          TEXT    NOT NULL UNIQUE,      -- 'icon' | 'eco_theme' | 'premium_theme'
    label           TEXT    NOT NULL,
    emoji           TEXT,
    description     TEXT
);

-- ─── User Rewards (unlocked rewards per user) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_rewards (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    reward          TEXT    NOT NULL,             -- matches challenge_tiers.reward
    unlocked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, reward),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Recipes (AI-generated, stored per user) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS recipes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    title           TEXT    NOT NULL,
    time            TEXT,
    difficulty      TEXT,
    emoji           TEXT,
    ingredients     TEXT,                         -- JSON string
    steps           TEXT,                         -- JSON string
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    title           TEXT    NOT NULL,
    message         TEXT    NOT NULL,
    type            TEXT    DEFAULT 'info',       -- 'info' | 'warning' | 'success'
    time            TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
