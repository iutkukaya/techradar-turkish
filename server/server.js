const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your-secret-key-change-this-in-prod';

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const checkAdmin = (req, res, next) => {
    if (req.user.permissions === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Turkish Tech Radar API is running' });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                // Token expires in 10 minutes
                const token = jwt.sign({ id: user.id, username: user.username, permissions: user.permissions }, SECRET_KEY, { expiresIn: '10m' });
                res.json({ token, permissions: user.permissions });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });
    });
});

// Refresh Token Endpoint
app.post('/api/auth/refresh', authenticateToken, (req, res) => {
    const user = req.user;
    // Issue new token with 10m expiry
    const token = jwt.sign({ id: user.id, username: user.username, permissions: user.permissions }, SECRET_KEY, { expiresIn: '10m' });
    res.json({ token });
});

// User Management Routes (Admin Only)
app.get('/api/users', authenticateToken, checkAdmin, (req, res) => {
    db.all('SELECT id, username, permissions FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/users', authenticateToken, checkAdmin, (req, res) => {
    const { username, password, permissions } = req.body;
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ error: err.message });

        const sql = `INSERT INTO users (username, password, permissions) VALUES (?, ?, ?)`;
        db.run(sql, [username, hash, permissions], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, username, permissions });
        });
    });
});

app.delete('/api/users/:id', authenticateToken, checkAdmin, (req, res) => {
    // Prevent deleting self
    if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    // Prevent deleting default admin
    db.get('SELECT username FROM users WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'User not found' });

        if (row.username === 'admin') {
            return res.status(403).json({ message: 'Cannot delete the default admin user' });
        }

        db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User deleted' });
        });
    });
});

// Update User (Admin Only - Password Reset & Permissions)
app.put('/api/users/:id', authenticateToken, checkAdmin, (req, res) => {
    const { password, permissions } = req.body;
    const saltRounds = 10;

    if (password) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) return res.status(500).json({ error: err.message });

            // If permissions provided, update both. Else only password.
            if (permissions) {
                db.run('UPDATE users SET password = ?, permissions = ? WHERE id = ?', [hash, permissions, req.params.id], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'User updated successfully' });
                });
            } else {
                db.run('UPDATE users SET password = ? WHERE id = ?', [hash, req.params.id], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Password updated successfully' });
                });
            }
        });
    } else if (permissions) {
        db.run('UPDATE users SET permissions = ? WHERE id = ?', [permissions, req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Permissions updated successfully' });
        });
    } else {
        res.status(400).json({ message: 'Nothing to update' });
    }
});

// Change Own Password
app.put('/api/auth/password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const saltRounds = 10;

    db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ message: 'User not found' });

        bcrypt.compare(currentPassword, user.password, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!result) return res.status(401).json({ message: 'Invalid current password' });

            bcrypt.hash(newPassword, saltRounds, (err, hash) => {
                if (err) return res.status(500).json({ error: err.message });
                db.run('UPDATE users SET password = ? WHERE id = ?', [hash, userId], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Password changed successfully' });
                });
            });
        });
    });
});

// Radar Routes
// Get all technologies (Public)
app.get('/api/radar', (req, res) => {
    db.all('SELECT * FROM technologies WHERE active = 1', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add technology (Protected & RBAC)
app.post('/api/radar', authenticateToken, (req, res, next) => {
    const { quadrant } = req.body;
    // Check permission dynamically based on the quadrant being added
    const userPermissions = req.user.permissions;
    if (userPermissions === 'ADMIN' || userPermissions.includes(quadrant)) {
        next();
    } else {
        res.status(403).json({ message: `You do not have permission to add to ${quadrant}` });
    }
}, (req, res) => {
    const { name, description, quadrant, ring, attribute, angleParam, radiusParam } = req.body;
    const sql = `INSERT INTO technologies (name, description, quadrant, ring, attribute, angleParam, radiusParam) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [name, description, quadrant, ring, attribute, angleParam, radiusParam], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, description, quadrant, ring, attribute, active: 1 });
    });
});
// Update technology (Protected & RBAC)
app.put('/api/radar/:id', authenticateToken, (req, res, next) => {
    // First fetch the tech to check its quadrant (and the new quadrant)
    db.get('SELECT quadrant FROM technologies WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'Technology not found' });

        const currentQuadrant = row.quadrant;
        const newQuadrant = req.body.quadrant || currentQuadrant; // Use current if not provided
        const userPermissions = req.user.permissions;

        // User must have permission for BOTH the current quadrant (to edit it) AND the new quadrant (to move it)
        const canEditCurrent = userPermissions === 'ADMIN' || userPermissions.includes(currentQuadrant);
        const canMoveToNew = userPermissions === 'ADMIN' || (newQuadrant ? userPermissions.includes(newQuadrant) : true);

        if (canEditCurrent && canMoveToNew) {
            next();
        } else {
            res.status(403).json({ message: 'Permission denied' });
        }
    });
}, (req, res) => {
    const { name, description, quadrant, ring, attribute, angleParam, radiusParam } = req.body;

    // Dynamic update query to handle partial updates (like just moving a dot)
    let fields = [];
    let values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (quadrant !== undefined) { fields.push('quadrant = ?'); values.push(quadrant); }
    if (ring !== undefined) { fields.push('ring = ?'); values.push(ring); }
    if (attribute !== undefined) { fields.push('attribute = ?'); values.push(attribute); }
    if (angleParam !== undefined) { fields.push('angleParam = ?'); values.push(angleParam); }
    if (radiusParam !== undefined) { fields.push('radiusParam = ?'); values.push(radiusParam); }

    if (fields.length === 0) return res.status(400).json({ message: 'Nothing to update' });

    values.push(req.params.id);
    const sql = `UPDATE technologies SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated successfully' });
    });
});

// Delete technology (Protected & RBAC)
app.delete('/api/radar/:id', authenticateToken, (req, res, next) => {
    db.get('SELECT quadrant FROM technologies WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'Technology not found' });

        const userPermissions = req.user.permissions;
        if (userPermissions === 'ADMIN' || userPermissions.includes(row.quadrant)) {
            next();
        } else {
            res.status(403).json({ message: 'Permission denied' });
        }
    });
}, (req, res) => {
    const sql = `UPDATE technologies SET active = 0 WHERE id = ?`;
    db.run(sql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
});

// Configure Multer for Logo Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../client/dist')); // Save directly to dist for immediate serving
    },
    filename: function (req, file, cb) {
        cb(null, 'mkk_logo.png'); // Always overwrite this file
    }
});
const upload = multer({ storage: storage });

// Logo Upload Route
app.post('/api/upload/logo', authenticateToken, checkAdmin, upload.single('logo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ message: 'Logo updated successfully' });
});

// Settings Routes
app.get('/api/settings', (req, res) => {
    db.all('SELECT key, value FROM settings', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    });
});

app.put('/api/settings', authenticateToken, checkAdmin, (req, res) => {
    const updates = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        try {
            Object.entries(updates).forEach(([key, value]) => {
                stmt.run(key, value);
            });
            db.run("COMMIT");
            stmt.finalize();
            res.json({ message: 'Settings updated successfully' });
        } catch (error) {
            db.run("ROLLBACK");
            res.status(500).json({ error: error.message });
        }
    });
});

// Serve Static Files (Frontend)
const isPkg = typeof process.pkg !== 'undefined';
const baseDir = isPkg ? path.dirname(process.execPath) : __dirname;
const clientBuildPath = isPkg ? path.join(baseDir, 'public') : path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful Shutdown
const gracefulShutdown = () => {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        db.close((err) => {
            if (err) {
                console.error('Error closing database', err.message);
            } else {
                console.log('Database connection closed');
            }
            process.exit(0);
        });
    });

    // Force close after 10s
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
