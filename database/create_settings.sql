-- Create settings table for system configuration
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default voting mode (manual)
INSERT INTO settings (setting_key, setting_value) 
VALUES ('voting_mode', 'manual')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
