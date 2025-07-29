-- Create the ipfs_data table with proper constraints
CREATE TABLE IF NOT EXISTS ipfs_data (
    id SERIAL PRIMARY KEY,
    name TEXT,
    cid TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on cid for faster queries
CREATE INDEX IF NOT EXISTS idx_ipfs_data_cid ON ipfs_data(cid);

-- Create index on name for search queries
CREATE INDEX IF NOT EXISTS idx_ipfs_data_name ON ipfs_data(name);

-- Optional: Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ipfs_data_updated_at 
    BEFORE UPDATE ON ipfs_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 