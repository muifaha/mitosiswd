const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper function to generate random token code
function generateTokenCode() {
    // Characters excluding I, 1, O, 0 to avoid confusion
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate tokens
router.post('/generate', async (req, res) => {
    try {
        const { count } = req.body;

        if (!count || count < 1 || count > 1000) {
            return res.status(400).json({ error: 'Invalid count (1-1000)' });
        }

        const tokens = [];
        const generatedCodes = new Set();

        // Generate unique token codes
        while (tokens.length < count) {
            const tokenCode = generateTokenCode();

            // Ensure uniqueness in this batch
            if (!generatedCodes.has(tokenCode)) {
                generatedCodes.add(tokenCode);
                tokens.push([tokenCode]);
            }
        }

        // Insert tokens
        await db.query(
            'INSERT INTO tokens (token_code) VALUES ?',
            [tokens]
        );

        res.json({
            success: true,
            message: `${count} tokens generated successfully`,
            count: count
        });

    } catch (error) {
        console.error('Generate tokens error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all tokens
router.get('/', async (req, res) => {
    try {
        const [tokens] = await db.query(
            'SELECT id, token_code, is_used, used_at, created_at FROM tokens ORDER BY created_at DESC'
        );

        res.json({ success: true, tokens });

    } catch (error) {
        console.error('Get tokens error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Validate token
router.post('/validate', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const [tokens] = await db.query(
            'SELECT id, is_used FROM tokens WHERE token_code = ?',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        if (tokens[0].is_used) {
            return res.status(400).json({ error: 'Token already used' });
        }

        res.json({
            success: true,
            tokenId: tokens[0].id,
            message: 'Token is valid'
        });

    } catch (error) {
        console.error('Validate token error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get available token (for auto mode)
router.get('/available', async (req, res) => {
    try {
        const [tokens] = await db.query(
            'SELECT id, token_code FROM tokens WHERE is_used = 0 ORDER BY created_at ASC LIMIT 1'
        );

        if (tokens.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No available tokens'
            });
        }

        // Mark token as used immediately
        await db.query(
            'UPDATE tokens SET is_used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ?',
            [tokens[0].id]
        );

        res.json({
            success: true,
            tokenId: tokens[0].id,
            tokenCode: tokens[0].token_code
        });

    } catch (error) {
        console.error('Get available token error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete all tokens
router.delete('/delete-all', async (req, res) => {
    try {
        // Get count before deleting
        const [countResult] = await db.query('SELECT COUNT(*) as count FROM tokens');
        const deletedCount = countResult[0].count;

        // Delete all tokens
        await db.query('DELETE FROM tokens');

        res.json({
            success: true,
            message: 'All tokens deleted successfully',
            deletedCount: deletedCount
        });

    } catch (error) {
        console.error('Delete all tokens error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete token
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM tokens WHERE id = ?', [id]);

        res.json({ success: true, message: 'Token deleted' });

    } catch (error) {
        console.error('Delete token error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
