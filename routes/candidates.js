const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload fields configuration for 2 images only
const uploadFields = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 }
]);

// Get candidates by type (osis or mpk)
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;

        if (type !== 'osis' && type !== 'mpk') {
            return res.status(400).json({ error: 'Invalid type. Use "osis" or "mpk"' });
        }

        const [candidates] = await db.query(
            'SELECT * FROM candidates WHERE type = ? ORDER BY created_at ASC',
            [type]
        );

        res.json({ success: true, candidates });

    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single candidate by ID
router.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [candidates] = await db.query(
            'SELECT * FROM candidates WHERE id = ?',
            [id]
        );

        if (candidates.length === 0) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.json({ success: true, candidate: candidates[0] });

    } catch (error) {
        console.error('Get candidate error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new candidate
router.post('/', uploadFields, async (req, res) => {
    try {
        const { name, type, vision, mission } = req.body;

        const photo = req.files && req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
        const coverPhoto = req.files && req.files['cover_photo'] ? `/uploads/${req.files['cover_photo'][0].filename}` : null;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        if (type !== 'osis' && type !== 'mpk') {
            return res.status(400).json({ error: 'Invalid type. Use "osis" or "mpk"' });
        }

        const [result] = await db.query(
            'INSERT INTO candidates (name, type, photo, cover_photo, vision, mission) VALUES (?, ?, ?, ?, ?, ?)',
            [name, type, photo, coverPhoto, vision || '', mission || '']
        );

        res.json({
            success: true,
            message: 'Candidate added successfully',
            candidateId: result.insertId
        });

    } catch (error) {
        console.error('Add candidate error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update candidate
router.put('/:id', uploadFields, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, vision, mission } = req.body;

        const photo = req.files && req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : undefined;
        const coverPhoto = req.files && req.files['cover_photo'] ? `/uploads/${req.files['cover_photo'][0].filename}` : undefined;

        if (type && type !== 'osis' && type !== 'mpk') {
            return res.status(400).json({ error: 'Invalid type. Use "osis" or "mpk"' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (type) {
            updates.push('type = ?');
            values.push(type);
        }
        if (photo) {
            updates.push('photo = ?');
            values.push(photo);
        }
        if (coverPhoto) {
            updates.push('cover_photo = ?');
            values.push(coverPhoto);
        }
        if (vision !== undefined) {
            updates.push('vision = ?');
            values.push(vision);
        }
        if (mission !== undefined) {
            updates.push('mission = ?');
            values.push(mission);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);

        await db.query(
            `UPDATE candidates SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ success: true, message: 'Candidate updated successfully' });

    } catch (error) {
        console.error('Update candidate error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete candidate
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM candidates WHERE id = ?', [id]);

        res.json({ success: true, message: 'Candidate deleted successfully' });

    } catch (error) {
        console.error('Delete candidate error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
