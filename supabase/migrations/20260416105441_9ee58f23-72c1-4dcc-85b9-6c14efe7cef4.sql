ALTER TABLE public.registrations
ADD COLUMN delegation_type TEXT NOT NULL DEFAULT 'individual',
ADD COLUMN delegation_group_id UUID;