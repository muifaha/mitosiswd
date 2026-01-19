const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/database');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Get admin from database
        const [admins] = await db.query(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = admins[0];

        // Compare password
        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return success (in production, you'd create a session/JWT here)
        res.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize admin (for first-time setup)
router.post('/init-admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if admin already exists
        const [existing] = await db.query('SELECT id FROM admins WHERE username = ?', [username]);

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin
        await db.query(
            'INSERT INTO admins (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.json({ success: true, message: 'Admin created successfully' });

    } catch (error) {
        console.error('Init admin error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
