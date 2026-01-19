-- Migration script to remove title_photo column
-- Run this to simplify to only 2 images: cover_photo and photo

USE pemilu_db;

-- Remove title_photo column (MySQL doesn't support IF EXISTS for columns)
-- Check if column exists first, then drop it
ALTER TABLE candidates DROP COLUMN title_photo;

-- Verify the changes
DESCRIBE candidates;
