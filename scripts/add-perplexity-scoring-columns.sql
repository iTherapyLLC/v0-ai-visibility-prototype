-- Add new columns to audits table for dimension scores
ALTER TABLE audits 
ADD COLUMN IF NOT EXISTS citation_score INTEGER,
ADD COLUMN IF NOT EXISTS position_score INTEGER,
ADD COLUMN IF NOT EXISTS sentiment_score INTEGER,
ADD COLUMN IF NOT EXISTS frequency_score INTEGER;

-- Add new columns to ai_responses table for detailed analysis
ALTER TABLE ai_responses
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS position INTEGER,
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20),
ADD COLUMN IF NOT EXISTS citations JSONB,
ADD COLUMN IF NOT EXISTS citation_sources JSONB,
ADD COLUMN IF NOT EXISTS context TEXT,
ADD COLUMN IF NOT EXISTS detail_score INTEGER,
ADD COLUMN IF NOT EXISTS mention_count INTEGER DEFAULT 0;

-- Update existing records to have default values
UPDATE ai_responses 
SET 
  category = 'general' WHERE category IS NULL,
  sentiment = 'not_mentioned' WHERE sentiment IS NULL,
  citations = '[]'::jsonb WHERE citations IS NULL,
  citation_sources = '{"reddit":0,"reviewSites":0,"ownedWebsite":0,"news":0,"other":0}'::jsonb WHERE citation_sources IS NULL,
  detail_score = 0 WHERE detail_score IS NULL,
  mention_count = 0 WHERE mention_count IS NULL;

-- Create index for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_ai_responses_category ON ai_responses(category);
CREATE INDEX IF NOT EXISTS idx_ai_responses_sentiment ON ai_responses(sentiment);
CREATE INDEX IF NOT EXISTS idx_audits_scores ON audits(overall_score, citation_score, position_score, sentiment_score, frequency_score);
