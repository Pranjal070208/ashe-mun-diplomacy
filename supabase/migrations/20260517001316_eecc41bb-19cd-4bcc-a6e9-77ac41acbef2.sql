ALTER TABLE public.registrations
  ADD COLUMN category TEXT NOT NULL DEFAULT 'mun',
  ADD COLUMN upgrade_category TEXT,
  ADD COLUMN upgrade_payment_id TEXT,
  ADD COLUMN upgrade_amount INTEGER,
  ADD COLUMN upgraded_at TIMESTAMPTZ;