const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const isPkg = typeof process.pkg !== 'undefined';
const dbDir = isPkg ? path.dirname(process.execPath) : __dirname;
const dbPath = process.env.DB_PATH || path.join(dbDir, 'radar.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      permissions TEXT DEFAULT 'READ_ONLY'
    )`, (err) => {
      if (err) console.error("Error creating users table:", err);
      else {
        // Migration: Check for permissions column
        db.all("PRAGMA table_info(users)", (err, rows) => {
          if (!err && rows) {
            const hasPermissions = rows.some(row => row.name === 'permissions');
            if (!hasPermissions) {
              db.run("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT 'READ_ONLY'");
            }
          }
        });
        createDefaultAdmin();
      }
    });

    // 2. Technologies Table
    db.run(`CREATE TABLE IF NOT EXISTS technologies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      quadrant TEXT NOT NULL,
      ring TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      attribute TEXT,
      angleParam REAL,
      radiusParam REAL
    )`, (err) => {
      if (err) console.error("Error creating technologies table:", err);
      else {
        // Migration: Check for new columns
        db.all("PRAGMA table_info(technologies)", (err, rows) => {
          if (!err && rows) {
            const hasAngleParam = rows.some(row => row.name === 'angleParam');
            const hasRadiusParam = rows.some(row => row.name === 'radiusParam');
            const hasAttribute = rows.some(row => row.name === 'attribute');

            if (!hasAngleParam) db.run("ALTER TABLE technologies ADD COLUMN angleParam REAL");
            if (!hasRadiusParam) db.run("ALTER TABLE technologies ADD COLUMN radiusParam REAL");
            if (!hasAttribute) db.run("ALTER TABLE technologies ADD COLUMN attribute TEXT");
          }
        });
      }
    });

    // 3. Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`, (err) => {
      if (err) console.error("Error creating settings table:", err);
      else initializeSettings();
    });
  });
}

const createDefaultAdmin = () => {
  const password = 'admin';
  const saltRounds = 10;

  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) return console.error(err.message);

    if (!row) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return console.error(err.message);
        db.run('INSERT INTO users (username, password, permissions) VALUES (?, ?, ?)', ['admin', hash, 'ADMIN'], (err) => {
          if (err) console.error(err.message);
          else console.log('Default admin user created');
        });
      });
    } else {
      if (row.permissions !== 'ADMIN') {
        db.run('UPDATE users SET permissions = ? WHERE username = ?', ['ADMIN', 'admin']);
      }
    }
  });
};

const initializeSettings = () => {
  db.get("SELECT count(*) as count FROM settings", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const defaultSettings = [
        { key: 'backgroundColor', value: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' },
        { key: 'titleColor', value: '#38bdf8' }, // var(--accent-primary)
        { key: 'listTitleColor', value: '#38bdf8' },
        { key: 'listTextColor', value: '#ffffff' },
        { key: 'ringColorBenimse', value: '#22c55e' },
        { key: 'ringColorTestEt', value: '#0ea5e9' },
        { key: 'ringColorDegerlendir', value: '#f59e0b' },
        { key: 'ringColorCik', value: '#ef4444' },
        // Quadrant Names
        { key: 'quadrant1', value: 'Araçlar' },
        { key: 'quadrant2', value: 'Diller ve Çerçeveler' },
        { key: 'quadrant3', value: 'Platformlar' },
        { key: 'quadrant4', value: 'Teknikler' },
        // Ring Names
        { key: 'ring1', value: 'Benimse' },
        { key: 'ring2', value: 'Test Et' },
        { key: 'ring3', value: 'Değerlendir' },
        { key: 'ring4', value: 'Çık' },
        // Status Attribute Names
        { key: 'status1', value: 'Yeni' },
        { key: 'status2', value: 'Halka Atladı' },
        { key: 'status3', value: 'Halka Düştü' },
        { key: 'status4', value: 'Değişiklik Yok' }
      ];

      const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
      defaultSettings.forEach(setting => {
        stmt.run(setting.key, setting.value);
      });
      stmt.finalize();
      console.log("Default settings initialized");
    }
  });
};

module.exports = db;
