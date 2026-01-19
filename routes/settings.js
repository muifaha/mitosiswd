const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get setting by key
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const [rows] = await db.query(
            'SELECT setting_value FROM settings WHERE setting_key = ?',
            [key]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Setting not found'
            });
        }

        res.json({
            success: true,
            value: rows[0].setting_value
        });
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch setting'
        });
    }
});

// Update setting
router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;

        // Validate voting_mode values
        if (key === 'voting_mode' && !['manual', 'auto'].includes(value)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid voting mode. Must be "manual" or "auto"'
            });
        }

        await db.query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP',
            [key, value, value]
        );

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update setting'
        });
    }
});

module.exports = router;
