CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT NOT NULL,
  class TEXT NOT NULL,
  preference_1 TEXT NOT NULL,
  preference_2 TEXT NOT NULL,
  preference_3 TEXT NOT NULL,
  experience TEXT,
  razorpay_payment_id TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 1000,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON public.registrations FOR SELECT USING (true);