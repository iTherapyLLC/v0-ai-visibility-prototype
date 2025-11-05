-- Create audits table
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY,
  website_url VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  overall_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  schema_health_score INTEGER,
  speed_performance_score INTEGER,
  citation_count INTEGER
);

-- Create ai_responses table
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID PRIMARY KEY,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  mentioned BOOLEAN NOT NULL,
  competitors TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255),
  mention_count INTEGER NOT NULL,
  visibility_score INTEGER
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  estimated_impact VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audits_website_url ON audits(website_url);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_ai_responses_audit_id ON ai_responses(audit_id);
CREATE INDEX IF NOT EXISTS idx_competitors_audit_id ON competitors(audit_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_audit_id ON recommendations(audit_id);
