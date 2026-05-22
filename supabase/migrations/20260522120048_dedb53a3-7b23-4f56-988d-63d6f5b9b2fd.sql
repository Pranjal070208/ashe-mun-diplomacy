ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS refunded boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS refunded_amount integer,
ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
ADD COLUMN IF NOT EXISTS refund_status text;