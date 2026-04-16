

## Plan: Registration Database + Admin Dashboard

### 1. Create `registrations` table (SQL migration)

```sql
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

-- Allow anonymous inserts (registration happens without auth)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.registrations FOR INSERT WITH CHECK (true);
-- Select policy for reading (will be used via service role in edge function, but also allow anon for simplicity since admin is client-side gated)
CREATE POLICY "Allow anonymous select" ON public.registrations FOR SELECT USING (true);
```

### 2. Update `RegistrationModal.tsx`

After successful Razorpay payment (inside `handler`), insert a row into `registrations` table with form data + `razorpay_payment_id` + timestamp.

### 3. Create `/admin` page

- Simple login gate: username/password form (client-side check against hardcoded `ASAdmin` / `20@AdminAS@26`)
- Once authenticated (stored in React state), show a table of all registrations fetched from Supabase
- Columns: Name, Mobile, Email, School, Class, Pref 1/2/3, Experience, Payment ID, Paid At
- No Navbar/Footer on this page for a clean admin feel

### 4. Add route in `App.tsx`

Add `<Route path="/admin" element={<Admin />} />` to the router.

### Security Note

The admin page uses a simple client-side password gate — not true server-side authentication. The registration data in the table is publicly readable. This is a simple setup suitable for a small event. If you need stronger security later, we can add proper Supabase auth.

