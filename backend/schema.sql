CREATE TABLE IF NOT EXISTS quote_requests (
  id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','failed','sent')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  admin_sent_at TEXT,
  customer_sent_at TEXT,
  amount_cents INTEGER,
  quote_message TEXT,
  approved_at TEXT,
  last_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_quote_ip_created ON quote_requests(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_quote_email_created ON quote_requests(customer_email, created_at);
CREATE INDEX IF NOT EXISTS idx_quote_pending ON quote_requests(status, expires_at);
