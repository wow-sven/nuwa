CREATE TABLE cap_sync_state (
  event_type TEXT PRIMARY KEY,
  cursor TEXT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cap_data (
  car_uri TEXT NOT NULL,
  name TEXT NOT NULL,
  id TEXT NOT NULL,
  cid TEXT NOT NULL,
  display_name TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  submitted_at BIGINT NULL,
  homepage TEXT NULL,
  repository TEXT NULL,
  thumbnail TEXT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  version INT NOT NULL DEFAULT 0,
  PRIMARY KEY (car_uri)
);


-- Create index on cid for faster queries
CREATE INDEX IF NOT EXISTS idx_cap_data_cid ON cap_data(cid);

-- Create index on name for search queries
CREATE INDEX IF NOT EXISTS idx_cap_data_name ON cap_data(name);

-- Create GIN index on tags for efficient array operations and filtering
CREATE INDEX IF NOT EXISTS idx_cap_data_tags ON cap_data USING GIN (tags);

-- Create index on display_name for search queries
CREATE INDEX IF NOT EXISTS idx_cap_data_display_name ON cap_data(display_name);

