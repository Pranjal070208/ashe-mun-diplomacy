
## Plan: Categories + Upgrade Flow

### 1. Email changes (`send-thank-you-email`)
- Remove "(if applicable)" from the bullet list.
- Accept `paymentId` (and `category`) in the request body.
- Add a paragraph: "Your Payment ID: **{paymentId}** — please save this. You can use it later to upgrade your registration to a higher category."
- Update both HTML and plain-text builders.
- New edge function `send-upgrade-email` with similar template confirming the upgrade (old → new category, new payment ID, new amount).

### 2. Database migration
Add to `registrations`:
- `category TEXT NOT NULL DEFAULT 'mun'` — values: `'mun'` | `'mun_comedy_general'` | `'mun_comedy_fanpit'`
- `upgrade_category TEXT` (nullable)
- `upgrade_payment_id TEXT` (nullable)
- `upgrade_amount INTEGER` (nullable)
- `upgraded_at TIMESTAMPTZ` (nullable)

Add a SELECT RLS policy scoped for the upgrade lookup edge function (which will use service role, so no public SELECT needed).

### 3. Pricing constants (shared in frontend + edge functions)
```
mun                  → ₹4   (400 paise)
mun_comedy_general   → ₹5   (500 paise)
mun_comedy_fanpit    → ₹6   (600 paise)
```
**Confirm:** are these really ₹4/5/6, or should they be ₹400/500/600 / ₹4000/5000/6000? Current registration fee is ₹10. I'll proceed assuming ₹4/5/6 unless you say otherwise.

### 4. Registration flow updates (`RegistrationModal.tsx`)
- Add a **category selector** (3 cards) inside the Individual + School flows — shown after the existing Individual/School tabs. For School, the same category applies to all delegates in the group.
- Compute total = `delegates × categoryPrice`.
- Save `category` on every inserted row.
- On Razorpay success, call `send-thank-you-email` with `paymentId` and `category` (one email per delegate, each receiving their own payment ID — which is the same Razorpay payment ID for the group).

### 5. New "Upgrade" tab in RegistrationModal
Add a 3rd tab next to **Individual / School**: **Upgrade**.

Flow:
1. **Step 1 — Payment ID input:** "Enter the Payment ID we sent you in your confirmation email."
2. **Step 2 — Lookup + confirm:** Call new edge function `lookup-registration` (service role) that returns matching rows by `razorpay_payment_id`. Show the delegate(s) name/email/school/current category. "Is this you? Confirm to continue."
3. **Step 3 — Upgrade options:**
   - Current `mun` → choose `mun_comedy_general` (pay ₹1) or `mun_comedy_fanpit` (pay ₹2)
   - Current `mun_comedy_general` → choose `mun_comedy_fanpit` (pay ₹1)
   - Current `mun_comedy_fanpit` → "You are already on the highest tier. No upgrade available."
   - Already upgraded → show current `upgrade_category`, no further upgrade unless eligible.
   - **Amount charged = difference between new and current category price × number of delegates in the group.**
4. **Step 4 — Razorpay payment** for the diff.
5. **Step 5 — On success:** call new edge function `apply-upgrade` (service role) that:
   - Updates all matching rows (by original `razorpay_payment_id` or `delegation_group_id`) setting `upgrade_category`, `upgrade_payment_id`, `upgrade_amount`, `upgraded_at`.
   - Triggers `send-upgrade-email` to each delegate.

### 6. New edge functions
- **`lookup-registration`** (service role, verify_jwt=false): `{ paymentId }` → returns delegate rows (name, email, school, category, upgrade_category, delegation_type, group size). No sensitive data beyond what the user already submitted.
- **`apply-upgrade`** (service role, verify_jwt=false): `{ originalPaymentId, newCategory, newPaymentId, newAmount }` → validates eligibility server-side (re-checks current category < new category), updates rows, calls `send-upgrade-email`.
- **`send-upgrade-email`**: similar shape to thank-you, mentions old category, new category, new payment ID, new amount.

Server-side eligibility re-check in `apply-upgrade` prevents tampering (client can't downgrade-then-upgrade or skip the price diff).

### 7. Admin panel (`Admin.tsx`)
Add columns:
- **Category** (badge: MUN / MUN+Comedy G / MUN+Comedy F)
- **Upgraded To** (— or new category badge)
- **Upgrade Payment ID**
- **Upgrade Amount**
- **Upgraded At**

Include all in XLSX export.

### 8. `get-registrations` edge function
No code change needed if it returns `*` — the new columns flow through automatically. Verify it uses `select('*')`.

---

### Files touched
- **Migration:** new SQL file adding 5 columns.
- **Edit:** `supabase/functions/send-thank-you-email/index.ts`, `src/components/RegistrationModal.tsx`, `src/pages/Admin.tsx`, `supabase/config.toml` (register new functions with `verify_jwt = false`).
- **Create:** `supabase/functions/send-upgrade-email/index.ts`, `supabase/functions/lookup-registration/index.ts`, `supabase/functions/apply-upgrade/index.ts`.

### Open question
Are the prices really **₹4 / ₹5 / ₹6**, or did you mean ₹400/500/600 (or ₹4000/5000/6000)? I'll use ₹4/5/6 unless you correct me before approving.
