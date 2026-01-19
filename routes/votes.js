const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Submit vote
router.post('/', async (req, res) => {
    try {
        const { tokenId, candidateId } = req.body;

        if (!tokenId || !candidateId) {
            return res.status(400).json({ error: 'Token ID and Candidate ID are required' });
        }

        // Check if token exists and is not used
        const [tokens] = await db.query(
            'SELECT id, is_used FROM tokens WHERE id = ?',
            [tokenId]
        );

        if (tokens.length === 0) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        if (tokens[0].is_used) {
            return res.status(400).json({ error: 'Token already used' });
        }

        // Check if candidate exists and get type
        const [candidates] = await db.query(
            'SELECT id, type FROM candidates WHERE id = ?',
            [candidateId]
        );

        if (candidates.length === 0) {
            return res.status(404).json({ error: 'Invalid candidate' });
        }

        const candidateType = candidates[0].type;

        // Check if user already voted for this type with this token
        const [existingVotes] = await db.query(`
            SELECT v.id 
            FROM votes v
            JOIN candidates c ON v.candidate_id = c.id
            WHERE v.token_id = ? AND c.type = ?
        `, [tokenId, candidateType]);

        if (existingVotes.length > 0) {
            return res.status(400).json({ error: `You have already voted for ${candidateType.toUpperCase()}` });
        }

        // Insert vote
        await db.query(
            'INSERT INTO votes (token_id, candidate_id) VALUES (?, ?)',
            [tokenId, candidateId]
        );

        // Check if user has now voted for both OSIS and MPK
        const [voteCount] = await db.query(`
            SELECT 
                COUNT(DISTINCT c.type) as types_voted
            FROM votes v
            JOIN candidates c ON v.candidate_id = c.id
            WHERE v.token_id = ?
        `, [tokenId]);

        // Only mark token as used if user has voted for both types
        if (voteCount[0].types_voted >= 2) {
            await db.query(
                'UPDATE tokens SET is_used = TRUE, used_at = NOW() WHERE id = ?',
                [tokenId]
            );
        }

        res.json({
            success: true,
            message: 'Vote submitted successfully',
            votesComplete: voteCount[0].types_voted >= 2
        });

    } catch (error) {
        console.error('Submit vote error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get voting statistics
router.get('/statistics', async (req, res) => {
    try {
        // Get OSIS statistics
        const [osisStats] = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.photo,
        COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      WHERE c.type = 'osis'
      GROUP BY c.id, c.name, c.photo
      ORDER BY vote_count DESC
    `);

        // Get MPK statistics
        const [mpkStats] = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.photo,
        COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      WHERE c.type = 'mpk'
      GROUP BY c.id, c.name, c.photo
      ORDER BY vote_count DESC
    `);

        // Get total votes
        const [totalVotes] = await db.query('SELECT COUNT(*) as total FROM votes');

        // Get total tokens
        const [totalTokens] = await db.query('SELECT COUNT(*) as total FROM tokens');

        // Get used tokens
        const [usedTokens] = await db.query('SELECT COUNT(*) as total FROM tokens WHERE is_used = TRUE');

        res.json({
            success: true,
            statistics: {
                osis: osisStats,
                mpk: mpkStats,
                totalVotes: totalVotes[0].total,
                totalTokens: totalTokens[0].total,
                usedTokens: usedTokens[0].total,
                remainingTokens: totalTokens[0].total - usedTokens[0].total
            }
        });

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
