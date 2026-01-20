-- Add in_progress column to tokens table
-- This column tracks tokens that are currently being used in voting but haven't completed yet

USE pemiluwd;

-- Add the in_progress column
ALTER TABLE tokens 
ADD COLUMN in_progress BOOLEAN DEFAULT FALSE AFTER is_used;

-- Add index for better query performance
CREATE INDEX idx_in_progress ON tokens(in_progress);

-- Verify the change
DESCRIBE tokens;

-- Show current tokens status
SELECT id, token_code, is_used, in_progress, used_at 
FROM tokens 
ORDER BY created_at DESC 
LIMIT 10;
