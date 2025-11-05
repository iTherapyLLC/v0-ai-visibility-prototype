-- Create audit_jobs table for asynchronous processing
CREATE TABLE IF NOT EXISTS audit_jobs (
  id VARCHAR(36) PRIMARY KEY,
  audit_id VARCHAR(36) NOT NULL REFERENCES audits(id),
  status VARCHAR(20) DEFAULT 'queued', -- queued, processing, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100 percentage
  current_prompt INTEGER DEFAULT 0,
  total_prompts INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_jobs_audit_id ON audit_jobs(audit_id);
CREATE INDEX idx_audit_jobs_status ON audit_jobs(status);
