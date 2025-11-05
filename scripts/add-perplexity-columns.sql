-- Add columns for Perplexity integration and multi-dimensional scoring

-- Add new columns to ai_responses table
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS citations JSONB DEFAULT '[]';
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS citation_sources JSONB DEFAULT '{"reddit":0,"reviewSites":0,"ownedWebsite":0,"news":0,"other":0}';
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) DEFAULT 'not_mentioned';
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS context TEXT;
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS detail_score INTEGER DEFAULT 0;
ALTER TABLE ai_responses ADD COLUMN IF NOT EXISTS mention_count INTEGER DEFAULT 0;

-- Add dimension scores to audits table
ALTER TABLE audits ADD COLUMN IF NOT EXISTS citation_score INTEGER DEFAULT 0;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS position_score INTEGER DEFAULT 0;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS sentiment_score INTEGER DEFAULT 0;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS frequency_score INTEGER DEFAULT 0;

-- Create index for faster category queries
CREATE INDEX IF NOT EXISTS idx_ai_responses_category ON ai_responses(category);
CREATE INDEX IF NOT EXISTS idx_ai_responses_sentiment ON ai_responses(sentiment);
