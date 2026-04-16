

## Plan: Two Registration Categories — Individual & School Delegation

### Overview
Add a category selector at the top of the registration modal. **Individual Delegation** keeps the current single-delegate form. **School Delegation** collects a shared school name + details for 10–20 delegates, each with their own name, mobile, email, class, 3 committee preferences, and experience. Fee = ₹10 per delegate.

### Database Change
Add a new column to the `registrations` table:
- `delegation_type TEXT NOT NULL DEFAULT 'individual'` — values: `'individual'` or `'school'`
- `delegation_group_id UUID` — nullable; for school delegations, all delegates in the same submission share the same group UUID so they can be linked together in the admin view.

No new table needed — each delegate is still one row, tagged with type and group.

### Frontend Changes

**1. `src/components/RegistrationModal.tsx` — Major rewrite**

- Add a **category toggle** (two styled tabs/buttons) at the top: "Individual Delegation" / "School Delegation". Default: Individual.
- **Individual mode**: identical to current form (no changes).
- **School Delegation mode**:
  - Top section: School Name (shared across all delegates).
  - Delegate list: start with 10 empty delegate cards. Each card has: Name, Mobile, Email, Class, Pref 1/2/3, Experience.
  - "Add Delegate" button (up to 20). "Remove" button on cards beyond the 10th.
  - Each delegate card is a compact, collapsible accordion-style row showing delegate number + name (once filled). Expand to edit fields. This keeps the form navigable.
  - **Running total** displayed at the bottom: `{count} delegates × ₹10 = ₹{count * 10}`.
  - On submit: validate all delegates have required fields filled. Open Razorpay with `amount = count * 1000` (paise). On success, insert all delegates as separate rows sharing the same `delegation_group_id` UUID and `delegation_type = 'school'`.

**2. `src/pages/Admin.tsx` — Minor updates**
- Add "Type" column to the table showing Individual/School.
- Add "Group" column (short UUID or dash for individuals).
- Update XLSX export to include these columns.

**3. Edge function `get-registrations/index.ts`** — no changes needed (it returns all rows).

### UX Design for School Delegation Form
- Accordion pattern: delegates are numbered cards (Delegate 1, Delegate 2, …). Only one expanded at a time.
- Progress indicator: "8/10 delegates completed" with a progress bar.
- The school name field is pinned at the top outside the accordion.
- Submit button shows the total amount and is disabled until all delegates (min 10) have required fields filled.

### Technical Details
- Generate `delegation_group_id` client-side with `crypto.randomUUID()`.
- Insert all delegates in a single `.insert([...rows])` call after payment.
- Amount in paise: `delegates.length * 1000`.

